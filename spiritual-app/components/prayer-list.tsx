import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getAllPrayers,
  searchPrayers as searchPrayersDB,
  getPrayerById,
} from '@/lib/database.service';
import type { PrayerWithLines } from '@/lib/database.types';

interface PrayerListProps {
  onPrayerSelect?: (prayer: PrayerWithLines) => void;
}

export default function PrayerList({ onPrayerSelect }: PrayerListProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrayers, setFilteredPrayers] = useState<PrayerWithLines[]>([]);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerWithLines | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrayers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchPrayersData(searchQuery);
    } else {
      loadPrayers();
    }
  }, [searchQuery]);

  const loadPrayers = async () => {
    setLoading(true);
    try {
      const prayers = await getAllPrayers();
      setFilteredPrayers(prayers);
    } catch (error) {
      console.error('Error loading prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPrayersData = async (query: string) => {
    setLoading(true);
    try {
      const results = await searchPrayersDB(query);
      setFilteredPrayers(results);
    } catch (error) {
      console.error('Error searching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrayerPress = (prayer: PrayerWithLines) => {
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
          backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8',
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
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
              color: theme.text
            }
          ]}
          placeholder="Search prayers..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
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
                No prayers found
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
            <View style={[styles.modalHeader, { backgroundColor: theme.background }]}>
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

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <ThemedText
                style={[styles.modalDescription, { color: theme.icon }]}
              >
                {selectedPrayer.description}
              </ThemedText>

              {selectedPrayer.lines.map((line, index) => (
                <View key={index} style={styles.prayerLineContainer}>
                  <ThemedText
                    style={[styles.prayerPunjabiText, { fontFamily: 'serif' }]}
                  >
                    {line.punjabi}
                  </ThemedText>
                  {line.transliteration_english && (
                    <ThemedText
                      style={[styles.prayerTransliterationText, { color: theme.icon }]}
                    >
                      {line.transliteration_english}
                    </ThemedText>
                  )}
                  <ThemedText
                    style={[styles.prayerEnglishText, { color: theme.icon }]}
                  >
                    {line.english}
                  </ThemedText>
                  {index < selectedPrayer.lines.length - 1 && (
                    <View
                      style={[
                        styles.prayerSeparator,
                        { backgroundColor: theme.icon + '20' }
                      ]}
                    />
                  )}
                </View>
              ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  prayerLineCount: {
    fontSize: 12
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12
  },
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  closeButton: {
    padding: 4
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center'
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
    fontStyle: 'italic'
  },
  prayerLineContainer: {
    marginBottom: 20
  },
  prayerPunjabiText: {
    fontSize: 18,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'left'
  },
  prayerTransliterationText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    fontStyle: 'italic',
    opacity: 0.8
  },
  prayerEnglishText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4
  },
  prayerSeparator: {
    height: 1,
    marginTop: 16,
    marginBottom: 4
  }
});

