import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  guruGranthSahibData,
  getPageByNumber,
  searchPages,
  getTotalPages,
  type GuruGranthSahibPage
} from '@/data/guruGranthSahib';

interface GuruGranthSahibReaderProps {
  visible: boolean;
  onClose: () => void;
}

export default function GuruGranthSahibReader({
  visible,
  onClose
}: GuruGranthSahibReaderProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GuruGranthSahibPage[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const totalPages = getTotalPages();
  const page = getPageByNumber(currentPage);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchPages(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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

  const handleSearchResultSelect = (page: GuruGranthSahibPage) => {
    setCurrentPage(page.pageNumber);
    setSearchQuery('');
    setShowSearch(false);
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
              placeholder="Search in Guru Granth Sahib..."
              placeholderTextColor={theme.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchResults.length > 0 && (
              <ScrollView style={styles.searchResults}>
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.pageNumber}
                    style={[
                      styles.searchResultItem,
                      { borderBottomColor: theme.icon + '30' }
                    ]}
                    onPress={() => handleSearchResultSelect(result)}
                  >
                    <ThemedText type="defaultSemiBold">
                      Page {result.pageNumber}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={styles.searchResultPreview}
                      numberOfLines={1}
                    >
                      {result.lines[0]?.punjabi || ''}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
              placeholder={`${currentPage} / ${totalPages}`}
              placeholderTextColor={theme.icon}
              value={pageInput}
              onChangeText={setPageInput}
              keyboardType="numeric"
              onSubmitEditing={handlePageInputSubmit}
            />
            <TouchableOpacity
              onPress={handlePageInputSubmit}
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
          {page && (
            <View style={styles.pageContent}>
              <ThemedText type="subtitle" style={styles.pageNumber}>
                Page {page.pageNumber}
              </ThemedText>
              {page.lines.map((line, index) => (
                <View key={index} style={styles.lineContainer}>
                  <ThemedText style={[styles.punjabiText, { fontFamily: 'serif' }]}>
                    {line.punjabi}
                  </ThemedText>
                  <ThemedText
                    style={[styles.englishText, { color: theme.icon }]}
                  >
                    {line.english}
                  </ThemedText>
                  {index < page.lines.length - 1 && (
                    <View
                      style={[styles.separator, { backgroundColor: theme.icon + '20' }]}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
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
    height: 36,
    width: 80,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    marginRight: 8
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
    marginBottom: 20
  },
  punjabiText: {
    fontSize: 18,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'left'
  },
  englishText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4
  },
  separator: {
    height: 1,
    marginTop: 16,
    marginBottom: 4
  }
});

