import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getPageByNumber,
  searchPages,
  getTotalPages,
} from '@/lib/database.service';
import type { PageWithLines, BaniLine } from '@/lib/database.types';
import {
  loadPrayerPreferences,
  getContentFontSizeScale,
  type ContentFontSize,
  type PrayerPreferences
} from '@/services/prayer-preferences';

interface GuruGranthSahibReaderProps {
  visible: boolean;
  onClose: () => void;
  contentFontSize?: ContentFontSize;
}

export default function GuruGranthSahibReader({
  visible,
  onClose,
  contentFontSize = 'medium'
}: GuruGranthSahibReaderProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BaniLine[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [showPageInputModal, setShowPageInputModal] = useState(false);
  const [tempPageInput, setTempPageInput] = useState('');
  const [totalPages, setTotalPages] = useState(1430);
  const [page, setPage] = useState<PageWithLines | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [preferences, setPreferences] = useState<PrayerPreferences | null>(null);

  useEffect(() => {
    loadTotalPages();
  }, []);

  useEffect(() => {
    if (visible) {
      loadPrayerPreferences().then(setPreferences);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      loadPage(currentPage);
    }
  }, [currentPage, visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchContent(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadTotalPages = async () => {
    try {
      const total = await getTotalPages();
      setTotalPages(total);
    } catch (error) {
      console.error('Error loading total pages:', error);
    }
  };

  const loadPage = async (pageNum: number) => {
    setLoading(true);
    try {
      const pageData = await getPageByNumber(pageNum);
      setPage(pageData);
    } catch (error) {
      console.error('Error loading page:', error);
      Alert.alert('Error', 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const searchContent = async (query: string) => {
    setSearchLoading(true);
    try {
      const results = await searchPages(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageInput('');
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInputSubmit = () => {
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum)) {
      goToPage(pageNum);
    }
  };

  const handleSearchResultSelect = (line: BaniLine) => {
    if (line.page_number) {
      setCurrentPage(line.page_number);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Guru Granth Sahib Ji
          </ThemedText>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={styles.searchButton}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search'}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                  color: theme.text
                }
              ]}
              placeholder="Search in Guru Granth Sahib Ji..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchLoading ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="small" color={theme.tint} />
              </View>
            ) : searchResults.length > 0 ? (
              <ScrollView style={styles.searchResults}>
                {searchResults.map((result, idx) => (
                  <TouchableOpacity
                    key={`${result.page_number}-${idx}`}
                    style={[
                      styles.searchResultItem,
                      { borderBottomColor: theme.icon + '30' }
                    ]}
                    onPress={() => handleSearchResultSelect(result)}
                  >
                    <ThemedText type="defaultSemiBold">
                      Page {result.page_number} {result.ang ? `(Ang ${result.ang})` : ''}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={styles.searchResultPreview}
                      numberOfLines={2}
                    >
                      {result.punjabi}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={[styles.searchResultEnglish, { color: theme.icon }]}
                      numberOfLines={1}
                    >
                      {result.english}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </View>
        )}

        {/* Page Navigation */}
        <View style={[styles.pageNav, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            onPress={goToPreviousPage}
            disabled={currentPage === 1}
            style={[
              styles.navButton,
              currentPage === 1 && styles.navButtonDisabled
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentPage === 1 ? theme.icon : theme.tint}
            />
          </TouchableOpacity>

          <View style={styles.pageInputContainer}>
            <TextInput
              style={[
                styles.pageInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                  color: theme.text
                }
              ]}
              value={`${currentPage} / ${totalPages}`}
              editable={false}
              scrollEnabled={false}
            />
            <TouchableOpacity
              onPress={() => {
                setTempPageInput(currentPage.toString());
                setShowPageInputModal(true);
              }}
              style={styles.goButton}
            >
              <ThemedText style={{ color: theme.tint }}>Go</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
            style={[
              styles.navButton,
              currentPage === totalPages && styles.navButtonDisabled
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentPage === totalPages ? theme.icon : theme.tint}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.tint} />
              <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
                Loading page...
              </ThemedText>
            </View>
          ) : page ? (
            <View style={styles.pageContent}>
              <ThemedText type="subtitle" style={styles.pageNumber}>
                Page {page.pageNumber}
              </ThemedText>
              {page.lines.map((line, index) => {
                const scale = getContentFontSizeScale(contentFontSize);
                const lineMarginBottom = Math.round(12 * scale);
                const separatorMarginTop = Math.round(8 * scale);
                const separatorMarginBottom = Math.round(2 * scale);
                const showOriginal = preferences?.showOriginal ?? true;
                const showTranslation = preferences?.showTranslation ?? false;
                const defaultLanguage = preferences?.primaryLanguage ?? 'punjabi';
                // Meaning/translation is stored in English (same as prayer-list)
                const translationText = line.english;
                // When show original is on and default is not Punjabi: show text in that language (Hindi transliteration or Hindi script, else English transliteration) — same as prayer-list
                const transliterationText =
                  defaultLanguage === 'hindi'
                    ? (line.transliteration_hindi || line.hindi || line.transliteration_english)
                    : line.transliteration_english;
                const showPunjabiAsOriginal =
                  showOriginal && !!line.punjabi && defaultLanguage === 'punjabi';
                const showTransliterationAsOriginal =
                  showOriginal && defaultLanguage !== 'punjabi' && !!transliterationText;
                return (
                  <View
                    key={line.id || index}
                    style={[styles.lineContainer, { marginBottom: lineMarginBottom }]}
                  >
                    {/* Original: Punjabi (Gurmukhi) when default is Punjabi, or transliteration as original when default is not Punjabi */}
                    {showPunjabiAsOriginal && (
                      <ThemedText
                        style={[
                          styles.punjabiText,
                          {
                            fontFamily: 'serif',
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
                          styles.punjabiText,
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
                    {/* Translation (English meaning) - when "Show translation" is on */}
                    {showTranslation && translationText && (
                      <ThemedText
                        style={[
                          styles.englishText,
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
                    {index < page.lines.length - 1 && (
                      <View
                        style={[
                          styles.separator,
                          {
                            backgroundColor: theme.icon + '20',
                            marginTop: separatorMarginTop,
                            marginBottom: separatorMarginBottom
                          }
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
                No content available
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>

      {/* Page Input Modal */}
      <Modal
        visible={showPageInputModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPageInputModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPageInputModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.background }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Go to Page
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                  color: theme.text
                }
              ]}
              placeholder={`Enter page (1-${totalPages})`}
              placeholderTextColor={theme.icon}
              value={tempPageInput}
              onChangeText={setTempPageInput}
              keyboardType="numeric"
              autoFocus={true}
              onSubmitEditing={() => {
                const pageNum = parseInt(tempPageInput);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                  goToPage(pageNum);
                  setShowPageInputModal(false);
                }
              }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowPageInputModal(false)}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0'
                  }
                ]}
              >
                <ThemedText style={{ color: theme.icon }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const pageNum = parseInt(tempPageInput);
                  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                    goToPage(pageNum);
                    setShowPageInputModal(false);
                  }
                }}
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : theme.tint 
                  }
                ]}
              >
                <ThemedText style={{ color: '#fff' }}>Go</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20
  },
  searchButton: {
    padding: 4
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  searchResults: {
    maxHeight: 200,
    marginTop: 8
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1
  },
  searchResultPreview: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7
  },
  searchResultEnglish: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic'
  },
  searchLoadingContainer: {
    padding: 20,
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14
  },
  transliterationText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7
  },
  pageNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  navButton: {
    padding: 8
  },
  navButtonDisabled: {
    opacity: 0.3
  },
  pageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16
  },
  pageInput: {
    height: 40,
    minWidth: 100,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  goButton: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  content: {
    flex: 1
  },
  pageContent: {
    padding: 20
  },
  pageNumber: {
    textAlign: 'center',
    marginBottom: 24
  },
  lineContainer: {
    marginBottom: 12
  },
  punjabiText: {
    fontSize: 18,
    lineHeight: 32,
    marginBottom: 6,
    textAlign: 'left'
  },
  englishText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 2
  },
  separator: {
    height: 1,
    marginTop: 8,
    marginBottom: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20
  },
  modalInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
});

