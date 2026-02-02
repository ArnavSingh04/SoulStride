import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { LessonWithBlocks, LessonBlock } from "@/lib/database.types";
import BlockRenderer from "./block-renderer";

const { width, height } = Dimensions.get("window");

interface LessonViewerProps {
  visible: boolean;
  lesson: LessonWithBlocks | null;
  onClose: () => void;
}

export default function LessonViewer({
  visible,
  lesson,
  onClose,
}: LessonViewerProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [blockAnswers, setBlockAnswers] = useState<Record<number, any>>({});

  if (!lesson) {
    return null;
  }

  const blocks = lesson.blocks || [];
  const currentBlock = blocks[currentBlockIndex];
  const isFirstBlock = currentBlockIndex === 0;
  const isLastBlock = currentBlockIndex === blocks.length - 1;
  const totalBlocks = blocks.length;

  const handleNext = () => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      // Lesson complete
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  const handleBlockAnswer = (blockId: number, answer: any) => {
    setBlockAnswers({
      ...blockAnswers,
      [blockId]: answer,
    });
  };

  const handleClose = () => {
    setCurrentBlockIndex(0);
    setBlockAnswers({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.icon + "40" }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <ThemedText type="subtitle" style={styles.lessonTitle} numberOfLines={1}>
              {lesson.title || (lesson.tags?.length ? lesson.tags.join(', ') : 'Lesson')}
            </ThemedText>
            <ThemedText style={[styles.progressText, { color: theme.icon }]}>
              {currentBlockIndex + 1} of {totalBlocks}
            </ThemedText>
          </View>

          <View style={styles.headerRight}>
            <ThemedText style={[styles.timeText, { color: theme.icon }]}>
              {lesson.estimated_time_min} min
            </ThemedText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { backgroundColor: theme.icon + "40" }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${((currentBlockIndex + 1) / totalBlocks) * 100}%`,
                backgroundColor: theme.tint,
              },
            ]}
          />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentBlock ? (
            <BlockRenderer
              block={currentBlock}
              onAnswer={(answer) => handleBlockAnswer(currentBlock.id, answer)}
              previousAnswer={blockAnswers[currentBlock.id]}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={theme.tint} />
            </View>
          )}
        </ScrollView>

        {/* Navigation Footer */}
        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.icon + "40" }]}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={isFirstBlock}
            style={[
              styles.navButton,
              { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.icon },
              isFirstBlock && styles.navButtonDisabled,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isFirstBlock ? theme.icon : theme.text}
            />
            <ThemedText
              style={[
                styles.navButtonText,
                { color: isFirstBlock ? theme.icon : theme.text },
              ]}
            >
              Previous
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton, { backgroundColor: theme.tint }]}
          >
            <ThemedText style={[styles.navButtonText, { color: "#FFFFFF" }]}>
              {isLastBlock ? "Complete" : "Next"}
            </ThemedText>
            {!isLastBlock && (
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  lessonTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
  },
  headerRight: {
    minWidth: 60,
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 12,
  },
  progressBarContainer: {
    height: 4,
    width: "100%",
  },
  progressBar: {
    height: "100%",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: height * 0.5,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {
    // backgroundColor set inline with theme
  },
  nextButton: {
    // backgroundColor set inline
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
