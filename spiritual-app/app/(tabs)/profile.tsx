import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  loadPrayerPreferences,
  savePrayerPreferences,
  updatePrayerPreference,
  type PrayerPreferences,
  type PrayerLanguage
} from "@/services/prayer-preferences";

export default function Settings() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [preferences, setPreferences] = useState<PrayerPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await loadPrayerPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
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
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleLanguageSelect = async (language: PrayerLanguage) => {
    await handlePreferenceChange("primaryLanguage", language);
  };

  const handleTranslationLanguageSelect = async (language: "english" | "hindi") => {
    await handlePreferenceChange("translationLanguage", language);
  };

  if (loading || !preferences) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading settings...</ThemedText>
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
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={24} color={theme.tint} />
            <ThemedText type="title" style={styles.sectionTitle}>
              Profile
            </ThemedText>
          </View>
          
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8"
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
                  User
                </ThemedText>
                <ThemedText style={[styles.profileEmail, { color: theme.icon }]}>
                  user@soulstride.app
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: theme.tint + "20" }
              ]}
            >
              <Ionicons name="pencil" size={18} color={theme.tint} />
            </TouchableOpacity>
          </View>
        </View>

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
              <ThemedText style={[styles.settingDescription, { color: theme.icon }]}>
                Choose the main language for prayer content
              </ThemedText>
            </View>
            <View style={styles.languageButtons}>
              {(["punjabi", "english", "hindi"] as PrayerLanguage[]).map((lang) => {
                const isSelected = preferences.primaryLanguage === lang;
                // Use a darker shade for selected button in dark mode to ensure text visibility
                const selectedBgColor = colorScheme === "dark" 
                  ? "#4a4a4a" // Darker gray for dark mode
                  : theme.tint; // Use tint for light mode
                // Text color: white for selected in light mode, white for selected in dark mode (on dark bg)
                const textColor = isSelected 
                  ? "#fff"
                  : theme.text;
                
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
                          ? (colorScheme === "dark" ? "#4a4a4a" : theme.tint)
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
              })}
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
                <ThemedText style={[styles.settingDescription, { color: theme.icon }]}>
                  Display the original Punjabi text
                </ThemedText>
              </View>
              <Switch
                value={preferences.showOriginal}
                onValueChange={(value) =>
                  handlePreferenceChange("showOriginal", value)
                }
                trackColor={{ false: theme.icon + "40", true: theme.tint + "80" }}
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
                <ThemedText style={[styles.settingDescription, { color: theme.icon }]}>
                  Display translated text
                </ThemedText>
              </View>
              <Switch
                value={preferences.showTranslation}
                onValueChange={(value) =>
                  handlePreferenceChange("showTranslation", value)
                }
                trackColor={{ false: theme.icon + "40", true: theme.tint + "80" }}
                thumbColor={preferences.showTranslation ? theme.tint : "#f4f3f4"}
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
                    // Use a darker shade for selected button in dark mode
                    const selectedBgColor = colorScheme === "dark" 
                      ? "#4a4a4a" // Darker gray for dark mode
                      : theme.tint; // Use tint for light mode
                    const textColor = isSelected 
                      ? "#fff"
                      : theme.text;
                    
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
                              ? (colorScheme === "dark" ? "#4a4a4a" : theme.tint)
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
                <ThemedText style={[styles.settingDescription, { color: theme.icon }]}>
                  Display phonetic transliteration
                </ThemedText>
              </View>
              <Switch
                value={preferences.showTransliteration}
                onValueChange={(value) =>
                  handlePreferenceChange("showTransliteration", value)
                }
                trackColor={{ false: theme.icon + "40", true: theme.tint + "80" }}
                thumbColor={preferences.showTransliteration ? theme.tint : "#f4f3f4"}
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
    justifyContent: "space-between"
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
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center"
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
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
  }
});
