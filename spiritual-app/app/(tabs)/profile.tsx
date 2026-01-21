import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  loadPrayerPreferences,
  savePrayerPreferences,
  type PrayerPreferences,
  type PrayerLanguage
} from "@/services/prayer-preferences";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { getAllHolyBooks } from "@/lib/database.service";
import type { HolyBook } from "@/lib/database.types";
import { loadUserProfile } from "@/services/user-profile";
import { useThemePreference, type ThemeMode } from "@/contexts/ThemePreferenceContext";

export default function Settings() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user, signOut, loading: authLoading } = useAuth();
  const { mode, setMode } = useThemePreference();
  const [preferences, setPreferences] = useState<PrayerPreferences | null>(
    null
  );
  const [holyBooks, setHolyBooks] = useState<HolyBook[]>([]);
  const [localName, setLocalName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prefs, books, profile] = await Promise.all([
        loadPrayerPreferences(),
        getAllHolyBooks(),
        loadUserProfile()
      ]);
      setPreferences(prefs);
      setHolyBooks(books);
      setLocalName(profile?.name || "");
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async <K extends keyof PrayerPreferences>(
    key: K,
    value: PrayerPreferences[K]
  ) => {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      await savePrayerPreferences(updated);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setPreferences(preferences);
    }
  };

  const handleLanguageSelect = async (language: PrayerLanguage) => {
    await handlePreferenceChange("primaryLanguage", language);
  };

  const handleTranslationLanguageSelect = async (
    language: "english" | "hindi"
  ) => {
    await handlePreferenceChange("translationLanguage", language);
  };

  const handleHolyBookToggle = async (holyBookId: string) => {
    if (!preferences) return;

    const currentIds = preferences.selectedHolyBookIds || [];
    const isSelected = currentIds.includes(holyBookId);

    let updatedIds: string[];
    if (isSelected) {
      // Remove from selection
      updatedIds = currentIds.filter((id) => id !== holyBookId);
    } else {
      // Add to selection
      updatedIds = [...currentIds, holyBookId];
    }

    await handlePreferenceChange("selectedHolyBookIds", updatedIds);
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        }
      }
    ]);
  };

  if (loading || authLoading || !preferences) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={{ marginTop: 12 }}>Loading settings...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={24} color={theme.tint} />
            <ThemedText type="title" style={styles.sectionTitle}>
              Appearance
            </ThemedText>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <ThemedText type="defaultSemiBold" style={styles.settingLabel}>
                Theme
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: theme.icon }]}>
                Choose light, dark, or follow your device
              </ThemedText>
            </View>

            <View style={styles.themeButtons}>
              {(["system", "light", "dark"] as ThemeMode[]).map((m) => {
                const selected = mode === m;
                const bg = selected
                  ? colorScheme === "dark"
                    ? "#4a4a4a"
                    : theme.tint
                  : colorScheme === "dark"
                  ? "#2a2a2a"
                  : "#f0f0f0";
                const text = selected ? "#fff" : theme.text;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMode(m)}
                    style={[styles.themeButton, { backgroundColor: bg }]}
                  >
                    <ThemedText style={{ color: text, fontWeight: selected ? "700" : "500" }}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={24} color={theme.tint} />
            <ThemedText type="title" style={styles.sectionTitle}>
              Profile
            </ThemedText>
          </View>

          {user ? (
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
                }
              ]}
            >
              <View style={styles.profileInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.tint + "20" }
                  ]}
                >
                  <Ionicons name="person" size={32} color={theme.tint} />
                </View>
                <View style={styles.profileDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.profileName}>
                    {user.name || "User"}
                  </ThemedText>
                  <ThemedText
                    style={[styles.profileEmail, { color: theme.icon }]}
                  >
                    {user.email}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleSignOut}
                style={[
                  styles.signOutButton,
                  { backgroundColor: theme.tint + "20" }
                ]}
              >
                <Ionicons name="log-out-outline" size={18} color={theme.tint} />
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
                }
              ]}
            >
              <View style={styles.profileInfo}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.tint + "20" }
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={32}
                    color={theme.tint}
                  />
                </View>
                <View style={styles.profileDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.profileName}>
                    {localName?.trim() ? localName.trim() : "Guest User"}
                  </ThemedText>
                  <ThemedText
                    style={[styles.profileEmail, { color: theme.icon }]}
                  >
                    {localName?.trim()
                      ? "You can sign in to sync your preferences"
                      : "Sign in to sync your preferences"}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {!user && (
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={[
                  styles.authButton,
                  { backgroundColor: colorScheme === "dark" ? "#4a4a4a" : theme.tint }
                ]}
                onPress={() => router.push("/auth/login")}
              >
                <ThemedText style={styles.authButtonText}>Sign In</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.authButton,
                  styles.authButtonSecondary,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
                    borderColor: theme.tint,
                    borderWidth: 1
                  }
                ]}
                onPress={() => router.push("/auth/signup")}
              >
                <ThemedText
                  style={[
                    styles.authButtonTextSecondary,
                    { color: theme.tint }
                  ]}
                >
                  Sign Up
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Faith / Holy Book Selection */}
        {holyBooks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={24} color={theme.tint} />
              <ThemedText type="title" style={styles.sectionTitle}>
                Faith & Holy Book
              </ThemedText>
            </View>
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <ThemedText type="defaultSemiBold" style={styles.settingLabel}>
                  Select Your Faith
                </ThemedText>
                <ThemedText
                  style={[styles.settingDescription, { color: theme.icon }]}
                >
                  Select one or more holy books to learn from
                </ThemedText>
              </View>
              <View style={styles.holyBookList}>
                {holyBooks.map((book) => {
                  const currentIds = preferences.selectedHolyBookIds || [];
                  const isSelected = currentIds.includes(book.id);

                  return (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => handleHolyBookToggle(book.id)}
                      style={[
                        styles.holyBookItem,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
                          borderColor: isSelected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : "rgba(128, 128, 128, 0.3)",
                          borderWidth: 2
                        }
                      ]}
                    >
                      <View style={styles.holyBookCheckbox}>
                        <Ionicons
                          name={isSelected ? "checkbox" : "square-outline"}
                          size={24}
                          color={isSelected ? theme.tint : theme.icon}
                        />
                      </View>
                      <View style={styles.holyBookInfo}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={[
                            styles.holyBookName,
                            {
                              color: theme.text
                            }
                          ]}
                        >
                          {book.name}
                        </ThemedText>
                        {book.name_punjabi && (
                          <ThemedText
                            style={[
                              styles.holyBookNamePunjabi,
                              {
                                color: theme.icon,
                                opacity: 0.7
                              }
                            ]}
                          >
                            {book.name_punjabi}
                          </ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Prayer Display Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={24} color={theme.tint} />
            <ThemedText type="title" style={styles.sectionTitle}>
              Prayer Display
            </ThemedText>
          </View>

          {/* Primary Language Selection */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <ThemedText type="defaultSemiBold" style={styles.settingLabel}>
                Primary Language
              </ThemedText>
              <ThemedText
                style={[styles.settingDescription, { color: theme.icon }]}
              >
                Choose the main language for prayer content
              </ThemedText>
            </View>
            <View style={styles.languageButtons}>
              {(["punjabi", "english", "hindi"] as PrayerLanguage[]).map(
                (lang) => {
                  const isSelected = preferences.primaryLanguage === lang;
                  const selectedBgColor =
                    colorScheme === "dark" ? "#4a4a4a" : theme.tint;
                  const textColor = isSelected ? "#fff" : theme.text;

                  return (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => handleLanguageSelect(lang)}
                      style={[
                        styles.languageButton,
                        {
                          backgroundColor: isSelected
                            ? selectedBgColor
                            : colorScheme === "dark"
                            ? "#2a2a2a"
                            : "#f0f0f0",
                          borderColor: isSelected
                            ? colorScheme === "dark"
                              ? "#4a4a4a"
                              : theme.tint
                            : "transparent"
                        }
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.languageButtonText,
                          {
                            color: textColor,
                            fontWeight: isSelected ? "600" : "400"
                          }
                        ]}
                      >
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          {/* Content Type Toggles */}
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
              }
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText type="defaultSemiBold" style={styles.settingLabel}>
                  Show Original Text
                </ThemedText>
                <ThemedText
                  style={[styles.settingDescription, { color: theme.icon }]}
                >
                  Display the original Punjabi text
                </ThemedText>
              </View>
              <Switch
                value={preferences.showOriginal}
                onValueChange={(value) =>
                  handlePreferenceChange("showOriginal", value)
                }
                trackColor={{
                  false: theme.icon + "40",
                  true: theme.tint + "80"
                }}
                thumbColor={preferences.showOriginal ? theme.tint : "#f4f3f4"}
              />
            </View>
          </View>

          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
              }
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText type="defaultSemiBold" style={styles.settingLabel}>
                  Show Translation
                </ThemedText>
                <ThemedText
                  style={[styles.settingDescription, { color: theme.icon }]}
                >
                  Display translated text
                </ThemedText>
              </View>
              <Switch
                value={preferences.showTranslation}
                onValueChange={(value) =>
                  handlePreferenceChange("showTranslation", value)
                }
                trackColor={{
                  false: theme.icon + "40",
                  true: theme.tint + "80"
                }}
                thumbColor={
                  preferences.showTranslation ? theme.tint : "#f4f3f4"
                }
              />
            </View>

            {preferences.showTranslation && (
              <View style={styles.translationLanguageContainer}>
                <ThemedText style={[styles.subLabel, { color: theme.icon }]}>
                  Translation Language:
                </ThemedText>
                <View style={styles.languageButtons}>
                  {(["english", "hindi"] as const).map((lang) => {
                    const isSelected = preferences.translationLanguage === lang;
                    const selectedBgColor =
                      colorScheme === "dark" ? "#4a4a4a" : theme.tint;
                    const textColor = isSelected ? "#fff" : theme.text;

                    return (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => handleTranslationLanguageSelect(lang)}
                        style={[
                          styles.languageButton,
                          styles.smallLanguageButton,
                          {
                            backgroundColor: isSelected
                              ? selectedBgColor
                              : colorScheme === "dark"
                              ? "#1a1a1a"
                              : "#e0e0e0",
                            borderColor: isSelected
                              ? colorScheme === "dark"
                                ? "#4a4a4a"
                                : theme.tint
                              : "transparent"
                          }
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.languageButtonText,
                            styles.smallLanguageButtonText,
                            {
                              color: textColor,
                              fontWeight: isSelected ? "600" : "400"
                            }
                          ]}
                        >
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
              }
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText type="defaultSemiBold" style={styles.settingLabel}>
                  Show Transliteration
                </ThemedText>
                <ThemedText
                  style={[styles.settingDescription, { color: theme.icon }]}
                >
                  Display phonetic transliteration
                </ThemedText>
              </View>
              <Switch
                value={preferences.showTransliteration}
                onValueChange={(value) =>
                  handlePreferenceChange("showTransliteration", value)
                }
                trackColor={{
                  false: theme.icon + "40",
                  true: theme.tint + "80"
                }}
                thumbColor={
                  preferences.showTransliteration ? theme.tint : "#f4f3f4"
                }
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  section: {
    marginBottom: 32
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12
  },
  sectionTitle: {
    fontSize: 22
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  profileDetails: {
    flex: 1
  },
  profileName: {
    fontSize: 18,
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 14
  },
  signOutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center"
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12
  },
  authButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  authButtonSecondary: {
    backgroundColor: "transparent"
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  authButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600"
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  themeButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  themeButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  settingHeader: {
    marginBottom: 12
  },
  settingInfo: {
    flex: 1,
    marginRight: 16
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18
  },
  languageButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  smallLanguageButton: {
    flex: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80
  },
  languageButtonText: {
    fontSize: 14
  },
  smallLanguageButtonText: {
    fontSize: 12
  },
  translationLanguageContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)"
  },
  subLabel: {
    fontSize: 13,
    marginBottom: 8
  },
  holyBookList: {
    marginTop: 12,
    gap: 8
  },
  holyBookItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12
  },
  holyBookCheckbox: {
    marginRight: 12
  },
  holyBookInfo: {
    flex: 1
  },
  holyBookName: {
    fontSize: 16,
    marginBottom: 4
  },
  holyBookNamePunjabi: {
    fontSize: 14
  }
});
