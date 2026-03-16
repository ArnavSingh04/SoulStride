// app/(tabs)/guide.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Android emulator: localhost is the device; use 10.0.2.2 to reach host machine.
// For production APK (sharing with others), set EXPO_PUBLIC_GUIDE_API_URL to your hosted API URL.
const DEFAULT_GUIDE_API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

// IMPORTANT: this is your Guide backend URL (not a Google URL).
// If you don't have a .env, this will be undefined and we fall back to DEFAULT_GUIDE_API_URL.
const GUIDE_API_URL =
  (process.env.EXPO_PUBLIC_GUIDE_API_URL as string | undefined)?.trim() ||
  DEFAULT_GUIDE_API_URL;

type GuideResponse = { reply?: string; error?: string };

export default function Guide() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams();

  const [query, setQuery] = useState<string>("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
   // Track if we've actually attempted a request so we don't show "Retry" prematurely
  const [hasRequested, setHasRequested] = useState(false);

  // Prevent double-submit / overlapping requests (common cause of "stuck loading")
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (params.query && typeof params.query === "string") {
      setQuery(params.query);
    }
  }, [params.query]);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    // Guard: ignore if already loading
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setError(null);
    setReply(null);
    setLoading(true);
    setHasRequested(true);

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), 60_000); // 60s timeout

    try {
      // Optional: quick health check the first time can be useful in debugging
      // (kept lightweight; remove if you want)
      // await fetch(`${GUIDE_API_URL}/health`).catch(() => {});

      const res = await fetch(`${GUIDE_API_URL}/api/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Don't assume JSON on error (Express errors / proxies may return HTML)
      const raw = await res.text();
      let data: GuideResponse = {};
      try {
        data = raw ? (JSON.parse(raw) as GuideResponse) : {};
      } catch {
        // keep data as {}
      }

      if (!res.ok) {
        const msg =
          data?.error ||
          `Request failed (${res.status}). ${
            raw?.slice(0, 120) ? `Response: ${raw.slice(0, 120)}…` : ""
          }`;
        setError(msg);
        return;
      }

      setReply((data?.reply ?? "").trim());
    } catch (e) {
      clearTimeout(timeoutId);

      if ((e as Error)?.name === "AbortError") {
        setError(
          "Request timed out. Check the server terminal for Vertex AI errors, or try again."
        );
        return;
      }

      const msg = e instanceof Error ? e.message : "Network request failed.";
      setError(
        msg +
          `\n\nGuide API URL: ${GUIDE_API_URL}\n` +
          "Make sure the Guide API is running:\n" +
          "cd spiritual-app/server && npm start\n" +
          (Platform.OS === "android"
            ? "\nOn a physical device, set EXPO_PUBLIC_GUIDE_API_URL to your computer's LAN IP (e.g. http://192.168.1.x:3001)."
            : "")
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const cancelRequest = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    setLoading(false);
    setError("Cancelled.");
  };

  const onPickSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    // Fire immediately so it doesn't look like "nothing happens"
    setTimeout(() => {
      handleSearch();
    }, 0);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          Spiritual Guide
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
          Ask questions about life, spirituality, and your journey
        </ThemedText>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.icon}
          style={styles.searchIcon}
        />

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
              color: theme.text
            }
          ]}
          placeholder="Ask your spiritual guide anything..."
          placeholderTextColor={theme.icon}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          multiline
        />

        {loading ? (
          <TouchableOpacity
            onPress={cancelRequest}
            accessibilityLabel="Cancel request"
          >
            <Ionicons name="close-circle" size={24} color={theme.tint} />
          </TouchableOpacity>
        ) : query.length > 0 ? (
          <TouchableOpacity
            onPress={handleSearch}
            accessibilityLabel="Ask guide"
          >
            <Ionicons
              name="arrow-forward-circle"
              size={24}
              color={theme.tint}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {query ? (
          <View style={styles.responseContainer}>
            <ThemedText style={[styles.questionLabel, { color: theme.icon }]}>
              Your question: "{query}"
            </ThemedText>

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={theme.tint} />
                <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
                  Asking your spiritual guide...
                </ThemedText>
              </View>
            )}

            {error && (
              <ThemedText style={[styles.errorText, { color: theme.tint }]}>
                {error}
              </ThemedText>
            )}

            {reply !== null && !loading && (
              <ThemedText style={[styles.replyText, { color: theme.text }]}>
                {reply || "(No reply returned.)"}
              </ThemedText>
            )}

            {!loading && hasRequested && !reply && !error && (
              <TouchableOpacity
                style={[styles.retryButton, { borderColor: theme.tint }]}
                onPress={handleSearch}
              >
                <Ionicons name="refresh" size={16} color={theme.tint} />
                <ThemedText style={[styles.retryText, { color: theme.tint }]}>
                  Retry
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.icon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Ask Your Spiritual Guide
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
              Get guidance on life questions, spiritual practices, and your
              journey.
            </ThemedText>

            <View style={styles.suggestionsContainer}>
              <ThemedText type="subtitle" style={styles.suggestionsTitle}>
                Example Questions:
              </ThemedText>

              {[
                "How can I remember the Divine Name in my daily routine?",
                "What does it mean to walk in the way of Hukam?",
                "How can I deal with anxiety and find peace through Gurbani?",
                "What is the role of seva (selfless service) in spiritual growth?"
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionCard,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
                    }
                  ]}
                  onPress={() => onPickSuggestion(suggestion)}
                >
                  <ThemedText style={styles.suggestionText}>
                    {suggestion}
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={16} color={theme.tint} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4
  },
  headerSubtitle: { fontSize: 16 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },

  content: { flex: 1 },
  contentContainer: { padding: 20 },

  responseContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "transparent"
  },
  questionLabel: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12
  },
  loadingText: { fontSize: 14 },
  errorText: { fontSize: 14, marginBottom: 8 },
  replyText: { fontSize: 16, lineHeight: 24 },

  retryButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: "flex-start"
  },
  retryText: { fontSize: 14 },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32
  },

  suggestionsContainer: {
    width: "100%",
    marginTop: 16
  },
  suggestionsTitle: {
    fontSize: 18,
    marginBottom: 12
  },
  suggestionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  suggestionText: {
    flex: 1,
    fontSize: 14
  }
});
