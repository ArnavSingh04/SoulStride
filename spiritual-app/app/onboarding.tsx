import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getAllHolyBooks } from "@/lib/database.service";
import type { HolyBook } from "@/lib/database.types";
import {
  loadPrayerPreferences,
  savePrayerPreferences
} from "@/services/prayer-preferences";
import {
  setOnboardingComplete,
  updateUserProfile,
  type ComfortLanguage
} from "@/services/user-profile";

type Step = 0 | 1 | 2 | 3;

const DAILY_MINUTE_OPTIONS = [5, 10, 15, 30, 45, 60] as const; // includes >30
const LANGUAGE_OPTIONS: ComfortLanguage[] = ["english", "punjabi", "hindi"];

export default function Onboarding() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(true);
  const [holyBooks, setHolyBooks] = useState<HolyBook[]>([]);

  const [name, setName] = useState("");
  const [selectedHolyBookIds, setSelectedHolyBookIds] = useState<string[]>([]);
  const [dailyMinutes, setDailyMinutes] =
    useState<(typeof DAILY_MINUTE_OPTIONS)[number]>(10);
  const [comfortLanguage, setComfortLanguage] =
    useState<ComfortLanguage>("english");

  useEffect(() => {
    (async () => {
      try {
        const [books, prefs] = await Promise.all([
          getAllHolyBooks(),
          loadPrayerPreferences()
        ]);
        setHolyBooks(books);
        if (prefs?.selectedHolyBookIds?.length)
          setSelectedHolyBookIds(prefs.selectedHolyBookIds);
        if (prefs?.primaryLanguage)
          setComfortLanguage(prefs.primaryLanguage as ComfortLanguage);
      } catch (e) {
        console.error("Error loading onboarding data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return selectedHolyBookIds.length > 0;
    return true;
  }, [step, name, selectedHolyBookIds]);

  const toggleBook = (id: string) => {
    setSelectedHolyBookIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const finish = async () => {
    const prefs = await loadPrayerPreferences();
    await savePrayerPreferences({
      ...prefs,
      primaryLanguage: comfortLanguage,
      translationLanguage: prefs.translationLanguage ?? "english",
      showOriginal: true,
      showTranslation: true,
      showTransliteration: true,
      selectedHolyBookIds
    });

    await updateUserProfile({
      name: name.trim(),
      dailyMinutes,
      comfortLanguage,
      selectedHolyBookIds
    });

    await setOnboardingComplete(true);
    router.replace("/(tabs)");
  };

  const continueNext = async () => {
    if (!canContinue) return;
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    await finish();
  };

  const back = () => {
    if (step === 0) return;
    setStep((s) => (s - 1) as Step);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={{ marginTop: 12, color: theme.icon }}>
            Loading onboarding...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            style={styles.topLink}
          >
            <ThemedText style={{ color: theme.icon }}>Sign In</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/auth/signup")}
            style={styles.topLink}
          >
            <ThemedText style={{ color: theme.icon }}>Sign Up</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText type="title" style={styles.title}>
          Let’s personalize SoulStride
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          You can change these anytime in Settings.
        </ThemedText>

        <View style={styles.card}>
          {step === 0 && (
            <>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                What should we call you?
              </ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.icon}
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
                    color: theme.text
                  }
                ]}
              />
            </>
          )}

          {step === 1 && (
            <>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Choose your holy book(s)
              </ThemedText>
              <ThemedText style={[styles.cardSubtitle, { color: theme.icon }]}>
                Select one or more. This controls what appears in Prayers.
              </ThemedText>

              <View style={{ gap: 10, marginTop: 12 }}>
                {holyBooks.map((b) => {
                  const selected = selectedHolyBookIds.includes(b.id);
                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => toggleBook(b.id)}
                      style={[
                        styles.bookRow,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
                          borderColor: selected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : "rgba(128,128,128,0.25)"
                        }
                      ]}
                    >
                      <Ionicons
                        name={selected ? "checkbox" : "square-outline"}
                        size={22}
                        color={selected ? theme.tint : theme.icon}
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold">{b.name}</ThemedText>
                        {!!b.name_punjabi && (
                          <ThemedText
                            style={{ color: theme.icon, opacity: 0.8 }}
                          >
                            {b.name_punjabi}
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Daily time commitment
              </ThemedText>
              <ThemedText style={[styles.cardSubtitle, { color: theme.icon }]}>
                How much time do you want to commit per day?
              </ThemedText>

              <View style={styles.row}>
                {DAILY_MINUTE_OPTIONS.map((m) => {
                  const selected = dailyMinutes === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setDailyMinutes(m)}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: selected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : colorScheme === "dark"
                            ? "#2a2a2a"
                            : "#f0f0f0",
                          borderColor: selected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : "transparent"
                        }
                      ]}
                    >
                      <ThemedText
                        style={{ color: selected ? "#fff" : theme.text }}
                      >
                        {m}m
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Language you’re comfortable with
              </ThemedText>
              <ThemedText style={[styles.cardSubtitle, { color: theme.icon }]}>
                We’ll set this as the default for prayer display.
              </ThemedText>

              <View style={styles.row}>
                {LANGUAGE_OPTIONS.map((l) => {
                  const selected = comfortLanguage === l;
                  return (
                    <TouchableOpacity
                      key={l}
                      onPress={() => setComfortLanguage(l)}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: selected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : colorScheme === "dark"
                            ? "#2a2a2a"
                            : "#f0f0f0",
                          borderColor: selected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : "transparent"
                        }
                      ]}
                    >
                      <ThemedText
                        style={{ color: selected ? "#fff" : theme.text }}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={back}
            disabled={step === 0}
            style={[styles.navButton, step === 0 && { opacity: 0.3 }]}
          >
            <ThemedText style={{ color: theme.icon }}>Back</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={continueNext}
            disabled={!canContinue}
            style={[
              styles.navButtonPrimary,
              {
                backgroundColor:
                  colorScheme === "dark" ? "#4a4a4a" : theme.tint,
                opacity: canContinue ? 1 : 0.5
              }
            ]}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              {step === 3 ? "Finish" : "Continue"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10
  },
  topLink: { paddingVertical: 6, paddingHorizontal: 8 },
  title: { fontSize: 28, marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 18 },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(128,128,128,0.10)"
  },
  cardTitle: { fontSize: 16, marginBottom: 10 },
  cardSubtitle: { fontSize: 13, lineHeight: 18 },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginTop: 10
  },
  bookRow: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap"
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2
  },
  navRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  navButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128,128,128,0.12)"
  },
  navButtonPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  }
});
