// app/(tabs)/journey.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import LearningJourney from "@/components/learning-journey";
import LessonViewer from "@/components/lesson-viewer";
import type { LessonWithBlocks } from "@/lib/database.types";
import { loadPrayerPreferences } from "@/services/prayer-preferences";
import { getHolyBookById } from "@/lib/database.service";
import { useFocusEffect } from "@react-navigation/native";

export default function Journey() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [selectedLesson, setSelectedLesson] = useState<LessonWithBlocks | null>(null);
  const [lessonViewerVisible, setLessonViewerVisible] = useState(false);
  const [selectedHolyBookId, setSelectedHolyBookId] = useState<string | undefined>(undefined);
  const [holyBookName, setHolyBookName] = useState<string | null>(null);

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
      const firstBookId = prefs?.selectedHolyBookIds?.[0];
      setSelectedHolyBookId(firstBookId);
      
      // Load holy book name for subtitle
      if (firstBookId) {
        const book = await getHolyBookById(firstBookId);
        setHolyBookName(book?.name || null);
      } else {
        setHolyBookName(null);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setSelectedHolyBookId(undefined);
      setHolyBookName(null);
    }
  };

  const handleLessonPress = (lesson: LessonWithBlocks) => {
    setSelectedLesson(lesson);
    setLessonViewerVisible(true);
  };

  const handleCloseLesson = () => {
    setLessonViewerVisible(false);
    setSelectedLesson(null);
  };

  const getSubtitle = () => {
    if (!selectedHolyBookId) {
      return "Select a holy book to begin your journey";
    }
    if (holyBookName) {
      return `Your path through ${holyBookName}`;
    }
    return "Your learning journey";
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.icon + "40" }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          Learning Journey
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
          {getSubtitle()}
        </ThemedText>
      </View>

      {/* Learning Journey */}
      <LearningJourney
        holyBookId={selectedHolyBookId}
        onLessonPress={handleLessonPress}
      />

      {/* Lesson Viewer Modal */}
      <LessonViewer
        visible={lessonViewerVisible}
        lesson={selectedLesson}
        onClose={handleCloseLesson}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
});
