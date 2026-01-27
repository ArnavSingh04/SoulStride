// app/(tabs)/journey.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import LearningJourney from "@/components/learning-journey";
import LessonViewer from "@/components/lesson-viewer";
import type { LessonWithBlocks } from "@/lib/database.types";

export default function Journey() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [selectedLesson, setSelectedLesson] = useState<LessonWithBlocks | null>(null);
  const [lessonViewerVisible, setLessonViewerVisible] = useState(false);

  const handleLessonPress = (lesson: LessonWithBlocks) => {
    setSelectedLesson(lesson);
    setLessonViewerVisible(true);
  };

  const handleCloseLesson = () => {
    setLessonViewerVisible(false);
    setSelectedLesson(null);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.icon + "40" }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          Learning Journey
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
          Your path through Guru Granth Sahib Ji
        </ThemedText>
      </View>

      {/* Learning Journey - Full SGGS Path */}
      <LearningJourney
        holyBookId="guru-granth-sahib"
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
