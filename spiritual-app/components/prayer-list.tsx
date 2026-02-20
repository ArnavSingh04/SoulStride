import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getAllPrayers,
  searchPrayers as searchPrayersDB,
  getPrayerById
} from "@/lib/database.service";
import type { PrayerWithLines } from "@/lib/database.types";
import {
  loadPrayerPreferences,
  getContentFontSizeScale,
  type PrayerPreferences,
  type ContentFontSize
} from "@/services/prayer-preferences";

interface PrayerListProps {
  onPrayerSelect?: (prayer: PrayerWithLines) => void;
  selectedHolyBookIds?: string[];
  contentFontSize?: ContentFontSize;
}

export default function PrayerList({
  onPrayerSelect,
  selectedHolyBookIds,
  contentFontSize
}: PrayerListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPrayers, setFilteredPrayers] = useState<PrayerWithLines[]>([]);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerWithLines | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<PrayerPreferences | null>(
    null
  );

  useEffect(() => {
    loadPreferences();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [])
  );

  // Reload prayers when preferences change (especially holy book selection)
  useEffect(() => {
    if (preferences) {
      loadPrayers();
    }
  }, [preferences?.selectedHolyBookIds, selectedHolyBookIds]);

  // Also reload prayers immediately when parent passes selection
  useEffect(() => {
    if (selectedHolyBookIds) {
      loadPrayers(selectedHolyBookIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHolyBookIds?.join("|")]);

  const loadPreferences = async () => {
    try {
      const prefs = await loadPrayerPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      searchPrayersData(searchQuery);
    } else {
      loadPrayers();
    }
  }, [searchQuery]);

  // Custom prayer ordering
  const getPrayerOrder = (prayerName: string): number => {
    const name = prayerName.toLowerCase();
    if (name.includes("japji")) return 1;
    if (name.includes("jaap")) return 2;
    if (name.includes("tav prasad") || name.includes("tavprasad")) return 3;
    if (name.includes("chaupai")) return 4;
    if (name.includes("anand")) return 5;
    return 99; // Other prayers come after
  };

  const loadPrayers = async (overrideHolyBookIds?: string[]) => {
    setLoading(true);
    try {
      const ids = overrideHolyBookIds ?? preferences?.selectedHolyBookIds ?? [];

      let prayers: PrayerWithLines[] = [];

      if (ids.length > 0) {
        // Load prayers from each selected holy book
        const prayerPromises = ids.map((holyBookId) =>
          getAllPrayers(holyBookId)
        );
        const prayerArrays = await Promise.all(prayerPromises);
        // Flatten the arrays and combine
        prayers = prayerArrays.flat();
      } else {
        // If no holy books selected, show nothing (Prayers page will prompt)
        prayers = [];
      }

      // Sort prayers by custom order, then alphabetically for others
      const sortedPrayers = [...prayers].sort((a, b) => {
        const orderA = getPrayerOrder(a.name);
        const orderB = getPrayerOrder(b.name);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // If same order, sort alphabetically
        return a.name.localeCompare(b.name);
      });
      setFilteredPrayers(sortedPrayers);
    } catch (error) {
      console.error("Error loading prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchPrayersData = async (query: string) => {
    setLoading(true);
    try {
      const ids = selectedHolyBookIds ?? preferences?.selectedHolyBookIds ?? [];

      let results: PrayerWithLines[] = [];

      if (ids.length > 0) {
        // Search in each selected holy book
        const searchPromises = ids.map((holyBookId) =>
          searchPrayersDB(query, holyBookId)
        );
        const searchArrays = await Promise.all(searchPromises);
        // Flatten and combine results
        results = searchArrays.flat();
      } else {
        // If no holy books selected, show nothing
        results = [];
      }

      setFilteredPrayers(results);
    } catch (error) {
      console.error("Error searching prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrayerPress = async (prayer: PrayerWithLines) => {
    // Reload preferences when opening a prayer to get latest settings
    await loadPreferences();
    setSelectedPrayer(prayer);
    if (onPrayerSelect) {
      onPrayerSelect(prayer);
    }
  };

  const renderPrayerItem = ({ item }: { item: PrayerWithLines }) => (
    <TouchableOpacity
      style={[
        styles.prayerItem,
        {
          backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8",
          borderLeftColor: theme.tint
        }
      ]}
      onPress={() => handlePrayerPress(item)}
    >
      <View style={styles.prayerHeader}>
        <ThemedText type="defaultSemiBold" style={styles.prayerName}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.prayerNamePunjabi, { color: theme.tint }]}>
          {item.name_punjabi}
        </ThemedText>
      </View>
      <ThemedText
        style={[styles.prayerDescription, { color: theme.icon }]}
        numberOfLines={2}
      >
        {item.description}
      </ThemedText>
      <View style={styles.prayerFooter}>
        <ThemedText style={[styles.prayerLineCount, { color: theme.icon }]}>
          {item.lines.length} lines
        </ThemedText>
        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
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
          placeholder="Search prayers..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={theme.icon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Prayer List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
            Loading prayers...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredPrayers}
          renderItem={renderPrayerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
                {preferences?.selectedHolyBookIds?.length
                  ? "No prayers found"
                  : "Select a holy book in Settings to view prayers"}
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Prayer Detail Modal */}
      <Modal
        visible={selectedPrayer !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPrayer(null)}
      >
        {selectedPrayer && (
          <ThemedView style={styles.modalContainer}>
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: theme.background }
              ]}
            >
              <TouchableOpacity
                onPress={() => setSelectedPrayer(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <ThemedText type="title" style={styles.modalTitle}>
                  {selectedPrayer.name}
                </ThemedText>
                <ThemedText
                  style={[styles.modalTitlePunjabi, { color: theme.tint }]}
                >
                  {selectedPrayer.name_punjabi}
                </ThemedText>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText
                style={[styles.modalDescription, { color: theme.icon }]}
              >
                {selectedPrayer.description}
              </ThemedText>

              {selectedPrayer.lines.map((line, index) => {
                const showOriginal = preferences?.showOriginal ?? true;
                const showTranslation = preferences?.showTranslation ?? false;
                const defaultLanguage =
                  preferences?.primaryLanguage ?? "punjabi";

                // Meaning/translation is stored in English; always use it for the translation block
                const translationText = line.english;
                const shouldShowTranslation =
                  showTranslation && !!translationText;
                // When show original is on and default is not Punjabi: show text in that language (Hindi transliteration or Hindi script, else English transliteration)
                const transliterationText =
                  defaultLanguage === "hindi"
                    ? (line.transliteration_hindi || line.hindi || line.transliteration_english)
                    : line.transliteration_english;
                const showPunjabiAsOriginal =
                  showOriginal && !!line.punjabi && defaultLanguage === "punjabi";
                const showTransliterationAsOriginal =
                  showOriginal &&
                  defaultLanguage !== "punjabi" &&
                  !!transliterationText;

                const scale = getContentFontSizeScale(
                  contentFontSize ?? preferences?.contentFontSize ?? "medium"
                );
                const lineContainerMargin = Math.round(12 * scale);
                const separatorMarginTop = Math.round(8 * scale);
                const separatorMarginBottom = Math.round(2 * scale);

                return (
                  <View
                    key={index}
                    style={[styles.prayerLineContainer, { marginBottom: lineContainerMargin }]}
                  >
                    {/* Original: Punjabi (Gurmukhi) when default is Punjabi, or transliteration as original when default is not Punjabi */}
                    {showPunjabiAsOriginal && (
                      <ThemedText
                        style={[
                          styles.prayerPunjabiText,
                          {
                            fontFamily: "serif",
                            fontSize: 18 * scale,
                            lineHeight: 32 * scale
                          }
                        ]}
                      >
                        {line.punjabi}
                      </ThemedText>
                    )}
                    {showTransliterationAsOriginal && (
                      <ThemedText
                        style={[
                          styles.prayerPunjabiText,
                          {
                            fontFamily: undefined,
                            fontSize: 18 * scale,
                            lineHeight: 28 * scale,
                            color: theme.text
                          }
                        ]}
                      >
                        {transliterationText}
                      </ThemedText>
                    )}

                    {/* Translation in default language (with fallback) - when "Show translation" is on */}
                    {shouldShowTranslation && (
                      <ThemedText
                        style={[
                          styles.prayerEnglishText,
                          {
                            color: theme.icon,
                            fontSize: 14 * scale,
                            lineHeight: 20 * scale
                          }
                        ]}
                      >
                        {translationText}
                      </ThemedText>
                    )}

                    {index < selectedPrayer.lines.length - 1 && (
                      <View
                        style={[
                          styles.prayerSeparator,
                          {
                            backgroundColor: theme.icon + "20",
                            marginTop: separatorMarginTop,
                            marginBottom: separatorMarginBottom
                          }
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </ThemedView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  listContent: {
    padding: 16
  },
  prayerItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4
  },
  prayerHeader: {
    marginBottom: 8
  },
  prayerName: {
    fontSize: 18,
    marginBottom: 4
  },
  prayerNamePunjabi: {
    fontSize: 16
  },
  prayerDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20
  },
  prayerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  prayerLineCount: {
    fontSize: 12
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12
  },
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  closeButton: {
    padding: 4
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 4
  },
  modalTitlePunjabi: {
    fontSize: 16
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: "italic"
  },
  prayerLineContainer: {
    marginBottom: 12
  },
  prayerPunjabiText: {
    fontSize: 18,
    lineHeight: 32,
    marginBottom: 6,
    textAlign: "left"
  },
  prayerTransliterationText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    fontStyle: "italic",
    opacity: 0.8
  },
  prayerEnglishText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 2
  },
  prayerPrimaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
    textAlign: "left"
  },
  prayerSeparator: {
    height: 1,
    marginTop: 8,
    marginBottom: 2
  }
});
