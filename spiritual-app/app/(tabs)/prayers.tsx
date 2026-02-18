import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import GuruGranthSahibReader from "@/components/guru-granth-sahib-reader";
import PrayerList from "@/components/prayer-list";
import {
  loadPrayerPreferences,
  savePrayerPreferences,
  type ContentFontSize
} from "@/services/prayer-preferences";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function Prayers() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showGuruGranthSahib, setShowGuruGranthSahib] = useState(false);
  const [selectedHolyBookIds, setSelectedHolyBookIds] = useState<string[]>([]);
  const [contentFontSize, setContentFontSize] = useState<ContentFontSize>("medium");

  useEffect(() => {
    loadPreferences();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  const loadPreferences = async () => {
    try {
      const prefs = await loadPrayerPreferences();
      setSelectedHolyBookIds(prefs?.selectedHolyBookIds || []);
      setContentFontSize(prefs?.contentFontSize ?? "medium");
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleContentFontSizeChange = async (size: ContentFontSize) => {
    setContentFontSize(size);
    try {
      const prefs = await loadPrayerPreferences();
      await savePrayerPreferences({ ...prefs, contentFontSize: size });
    } catch (error) {
      console.error("Error saving font size preference:", error);
    }
  };

  const hasHolyBookSelection = selectedHolyBookIds.length > 0;
  const showGGSCard = selectedHolyBookIds.includes("guru-granth-sahib");

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Prayers
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
            Read sacred texts and prayers
          </ThemedText>
          {hasHolyBookSelection && (
            <View style={styles.fontSizeRow}>
              <ThemedText style={[styles.fontSizeLabel, { color: theme.icon }]}>
                Text size:
              </ThemedText>
              {(["small", "medium", "large"] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => handleContentFontSizeChange(size)}
                  style={[
                    styles.fontSizeButton,
                    {
                      backgroundColor:
                        contentFontSize === size
                          ? theme.tint
                          : colorScheme === "dark"
                            ? "#3a3a3a"
                            : "#e8e8e8"
                    }
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.fontSizeButtonText,
                      {
                        color: contentFontSize === size ? "#fff" : theme.text
                      }
                    ]}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* If no holy book selected, prompt user */}
        {!hasHolyBookSelection ? (
          <View style={styles.selectPromptCard}>
            <View style={styles.selectPromptHeader}>
              <Ionicons name="alert-circle-outline" size={22} color={theme.icon} />
              <ThemedText type="defaultSemiBold" style={styles.selectPromptTitle}>
                Select a holy book to continue
              </ThemedText>
            </View>
            <ThemedText style={[styles.selectPromptSubtitle, { color: theme.icon }]}>
              Go to Settings and choose one or more holy books to load prayers.
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.selectPromptButton,
                { backgroundColor: colorScheme === "dark" ? "#4a4a4a" : theme.tint }
              ]}
              onPress={() => router.navigate("/(tabs)/profile")}
            >
              <ThemedText style={styles.selectPromptButtonText}>Open Settings</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Guru Granth Sahib Card - Only show if GGS is selected */}
            {showGGSCard && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowGuruGranthSahib(true)}
            style={styles.guruGranthSahibCard}
          >
            <LinearGradient
              colors={["#7C3AED", "#5B21B6"]}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.gradientCard}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="book" size={32} color="#fff" />
                </View>
                <View style={styles.cardTextContainer}>
                  <ThemedText style={styles.cardTitle}>
                    Guru Granth Sahib Ji
                  </ThemedText>
                  <ThemedText style={styles.cardTitlePunjabi}>
                    ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ
                  </ThemedText>
                  <ThemedText style={styles.cardSubtitle}>
                    Read page by page with meanings
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
            )}

        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.icon + "30" }]}
          />
          <ThemedText
            style={[styles.sectionTitle, { color: theme.icon }]}
            type="subtitle"
          >
            Daily Prayers
          </ThemedText>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.icon + "30" }]}
          />
        </View>

        {/* Prayer List */}
        <View style={styles.prayerListContainer}>
          <PrayerList
            selectedHolyBookIds={selectedHolyBookIds}
            contentFontSize={contentFontSize}
          />
        </View>
          </>
        )}
      </ScrollView>

      {/* Guru Granth Sahib Reader Modal */}
      <GuruGranthSahibReader
        visible={showGuruGranthSahib}
        onClose={() => setShowGuruGranthSahib(false)}
        contentFontSize={contentFontSize}
      />
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
    paddingBottom: 20
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16
  },
  fontSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8
  },
  fontSizeLabel: {
    fontSize: 14,
    marginRight: 4
  },
  fontSizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  fontSizeButtonText: {
    fontSize: 13,
    fontWeight: "600"
  },
  guruGranthSahibCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  cardTextContainer: {
    flex: 1
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4
  },
  cardTitlePunjabi: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4
  },
  cardSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  sectionTitle: {
    marginHorizontal: 12,
    fontSize: 18
  },
  prayerListContainer: {
    minHeight: 400
  },
  selectPromptCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(128, 128, 128, 0.12)"
  },
  selectPromptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  selectPromptTitle: {
    fontSize: 16
  },
  selectPromptSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14
  },
  selectPromptButton: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  selectPromptButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  }
});
