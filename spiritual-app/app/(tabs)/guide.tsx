// app/(tabs)/guide.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Guide() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    // If query was passed from home page, set it
    if (params.query && typeof params.query === "string") {
      setQuery(params.query);
    }
  }, [params.query]);

  const handleSearch = () => {
    // Placeholder - will be implemented when guide/LLM is ready
    console.log("Search query:", query);
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

      <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
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
        {query.length > 0 && (
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="arrow-forward-circle" size={24} color={theme.tint} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {query ? (
          <View style={styles.responseContainer}>
            <ThemedText style={[styles.placeholderText, { color: theme.icon }]}>
              Guide feature coming soon! Your question: "{query}"
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: theme.icon }]}>
              This will be powered by an LLM that provides spiritual guidance based on your selected holy book.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.icon} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Ask Your Spiritual Guide
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
              Get guidance on life questions, spiritual practices, and your journey.
            </ThemedText>
            
            <View style={styles.suggestionsContainer}>
              <ThemedText type="subtitle" style={styles.suggestionsTitle}>
                Example Questions:
              </ThemedText>
              {[
                "Should I eat non-vegetarian food?",
                "How do I find inner peace?",
                "What does my current situation mean?",
                "How can I improve my daily practice?"
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionCard, { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8" }]}
                  onPress={() => setQuery(suggestion)}
                >
                  <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
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
  container: {
    flex: 1
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16
  },
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
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: 20
  },
  responseContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "transparent"
  },
  placeholderText: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24
  },
  infoText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20
  },
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
