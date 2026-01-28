import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { LessonBlock } from "@/lib/database.types";
import type {
  ObjectiveBlockData,
  ScriptureBlockData,
  ContextBlockData,
  ExplanationBlockData,
  AnalogyBlockData,
  DefinitionBlockData,
  CommonMisconceptionBlockData,
  QuestionBlockData,
  MatchBlockData,
  ClozeBlockData,
  OrderBlockData,
  HighlightBlockData,
  ClassificationBlockData,
  ScenarioChoiceBlockData,
  MicroQuizBlockData,
  ReflectionBlockData,
  GuidedReflectionBlockData,
  IntentionBlockData,
  CheckInBlockData,
  SummaryBlockData,
  MemoryCardBlockData,
  CompareContrastBlockData,
  TeachBackBlockData,
} from "@/lib/database.types";

interface BlockRendererProps {
  block: LessonBlock;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}

export default function BlockRenderer({
  block,
  onAnswer,
  previousAnswer,
}: BlockRendererProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // Safety check: if block_data is missing, show error
  if (!block.block_data) {
    return (
      <View style={styles.unknownBlock}>
        <ThemedText>Error: Block data is missing for type: {block.block_type}</ThemedText>
      </View>
    );
  }

  const renderBlock = () => {
    switch (block.block_type) {
      case "objective":
        return <ObjectiveBlock data={block.block_data as ObjectiveBlockData} theme={theme} />;
      case "scripture":
        return <ScriptureBlock data={block.block_data as ScriptureBlockData} theme={theme} />;
      case "context":
        return <ContextBlock data={block.block_data as ContextBlockData} theme={theme} />;
      case "explanation":
        return <ExplanationBlock data={block.block_data as ExplanationBlockData} theme={theme} />;
      case "analogy":
        return <AnalogyBlock data={block.block_data as AnalogyBlockData} theme={theme} />;
      case "definition":
        return <DefinitionBlock data={block.block_data as DefinitionBlockData} theme={theme} />;
      case "common_misconception":
        return (
          <CommonMisconceptionBlock
            data={block.block_data as CommonMisconceptionBlockData}
            theme={theme}
          />
        );
      case "question":
        return (
          <QuestionBlock
            data={block.block_data as QuestionBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "match":
        return (
          <MatchBlock
            data={block.block_data as MatchBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "cloze":
        return (
          <ClozeBlock
            data={block.block_data as ClozeBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "order":
        return (
          <OrderBlock
            data={block.block_data as OrderBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "highlight":
        return (
          <HighlightBlock
            data={block.block_data as HighlightBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "classification":
        return (
          <ClassificationBlock
            data={block.block_data as ClassificationBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "scenario_choice":
        return (
          <ScenarioChoiceBlock
            data={block.block_data as ScenarioChoiceBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "micro_quiz":
        return (
          <MicroQuizBlock
            data={block.block_data as MicroQuizBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "reflection":
        return (
          <ReflectionBlock
            data={block.block_data as ReflectionBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "guided_reflection":
        return (
          <GuidedReflectionBlock
            data={block.block_data as GuidedReflectionBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "intention":
        return (
          <IntentionBlock
            data={block.block_data as IntentionBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "check_in":
        return (
          <CheckInBlock
            data={block.block_data as CheckInBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "audio_recitation":
        return (
          <AudioRecitationBlock
            data={block.block_data as any}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "listen_and_select":
        return (
          <ListenAndSelectBlock
            data={block.block_data as any}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "repeat_practice":
        return (
          <RepeatPracticeBlock
            data={block.block_data as any}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "summary":
        return <SummaryBlock data={block.block_data as SummaryBlockData} theme={theme} />;
      case "memory_card":
        return (
          <MemoryCardBlock
            data={block.block_data as MemoryCardBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "compare_contrast":
        return (
          <CompareContrastBlock
            data={block.block_data as CompareContrastBlockData}
            theme={theme}
          />
        );
      case "teach_back":
        return (
          <TeachBackBlock
            data={block.block_data as TeachBackBlockData}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      case "checkpoint":
        return (
          <CheckpointBlock
            data={block.block_data as any}
            theme={theme}
            onAnswer={onAnswer}
            previousAnswer={previousAnswer}
          />
        );
      default:
        return (
          <View style={styles.unknownBlock}>
            <ThemedText>Unknown block type: {block.block_type}</ThemedText>
          </View>
        );
    }
  };

  return <ThemedView style={styles.container}>{renderBlock()}</ThemedView>;
}

// ============== BLOCK COMPONENTS ==============

function ObjectiveBlock({ data, theme }: { data: ObjectiveBlockData; theme: any }) {
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
      <Ionicons name="flag" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.objectiveText}>
        {data.text}
      </ThemedText>
    </ThemedView>
  );
}

function ScriptureBlock({ data, theme }: { data: ScriptureBlockData; theme: any }) {
  const [collapsed, setCollapsed] = useState(!data.show_by_default);

  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        onPress={() => setCollapsed(!collapsed)}
        style={styles.scriptureHeader}
      >
        <Ionicons name="book" size={24} color={theme.tint} />
        <ThemedText type="subtitle" style={styles.scriptureTitle}>
          Scripture
        </ThemedText>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={20}
          color={theme.icon}
        />
      </TouchableOpacity>
      {!collapsed && (
        <View style={styles.scriptureContent}>
          <ThemedText style={[styles.gurmukhiText, { fontSize: 24, marginBottom: 12 }]}>
            {data.gurmukhi}
          </ThemedText>
          <ThemedText style={[styles.transliterationText, { color: theme.icon, marginBottom: 8 }]}>
            {data.transliteration}
          </ThemedText>
          <ThemedText style={styles.translationText}>{data.translation}</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

function ContextBlock({ data, theme }: { data: ContextBlockData; theme: any }) {
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background, borderLeftWidth: 4, borderLeftColor: theme.icon }]}>
      <Ionicons name="information-circle" size={24} color={theme.icon} style={styles.blockIcon} />
      <ThemedText style={styles.contextText}>{data.text}</ThemedText>
    </ThemedView>
  );
}

function ExplanationBlock({ data, theme }: { data: ExplanationBlockData; theme: any }) {
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText style={styles.explanationText}>{data.text}</ThemedText>
    </ThemedView>
  );
}

function AnalogyBlock({ data, theme }: { data: AnalogyBlockData; theme: any }) {
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
      <Ionicons name="bulb" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.analogyTitle}>
        {data.title}
      </ThemedText>
      <ThemedText style={styles.analogyText}>{data.text}</ThemedText>
    </ThemedView>
  );
}

function DefinitionBlock({ data, theme }: { data: DefinitionBlockData; theme: any }) {
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
      <ThemedText type="subtitle" style={styles.definitionTerm}>
        {data.term}
      </ThemedText>
      <ThemedText style={styles.definitionGloss}>{data.gloss}</ThemedText>
      {data.notes && data.notes.length > 0 && (
        <View style={styles.definitionNotes}>
          {data.notes.map((note, index) => (
            <View key={index} style={styles.definitionNoteItem}>
              <Ionicons name="ellipse" size={6} color={theme.tint} />
              <ThemedText style={[styles.definitionNote, { color: theme.icon }]}>
                {note}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

function CommonMisconceptionBlock({
  data,
  theme,
}: {
  data: CommonMisconceptionBlockData;
  theme: any;
}) {
  const isDark = theme.background === Colors.dark.background;
  const errorBg = isDark ? "rgba(211, 47, 47, 0.2)" : "rgba(255, 235, 238, 0.8)";
  const successBg = isDark ? "rgba(46, 125, 50, 0.2)" : "rgba(232, 245, 233, 0.8)";
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.misconceptionItem, { backgroundColor: errorBg }]}>
        <Ionicons name="close-circle" size={24} color="#D32F2F" />
        <View style={styles.misconceptionContent}>
          <ThemedText style={styles.misconceptionLabel}>Common Misconception</ThemedText>
          <ThemedText style={styles.misconceptionText}>{data.misconception}</ThemedText>
        </View>
      </View>
      <View style={[styles.misconceptionItem, { backgroundColor: successBg }]}>
        <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
        <View style={styles.misconceptionContent}>
          <ThemedText style={styles.misconceptionLabel}>Correction</ThemedText>
          <ThemedText style={styles.misconceptionText}>{data.correction}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

function QuestionBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: QuestionBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    previousAnswer?.selectedOption ?? null
  );
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);
    if (onAnswer) {
      onAnswer({ selectedOption: index, isCorrect: index === data.correct_option });
    }
  };

  const isCorrect = selectedOption === data.correct_option;

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.questionPrompt}>
        {data.prompt}
      </ThemedText>
      {data.options && Array.isArray(data.options) && (
        <View style={styles.optionsContainer}>
          {data.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = index === data.correct_option;
            let buttonStyle: any = [styles.optionButton, { borderColor: theme.icon, backgroundColor: theme.background }];
            let textStyle = {};

            if (showFeedback) {
              if (isCorrectOption) {
                buttonStyle = [styles.optionButton, { backgroundColor: "#4CAF50", borderColor: "#4CAF50" }];
                textStyle = { color: "#FFFFFF" };
              } else if (isSelected && !isCorrectOption) {
                buttonStyle = [styles.optionButton, { backgroundColor: "#D32F2F", borderColor: "#D32F2F" }];
                textStyle = { color: "#FFFFFF" };
              }
            } else if (isSelected) {
              buttonStyle = [styles.optionButton, { backgroundColor: theme.tint, borderColor: theme.tint }];
              textStyle = { color: "#FFFFFF" };
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleSelect(index)}
                disabled={showFeedback}
              >
                <ThemedText style={[styles.optionText, textStyle]}>{option}</ThemedText>
                {showFeedback && isCorrectOption && (
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                )}
                {showFeedback && isSelected && !isCorrectOption && (
                  <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      {showFeedback && data.feedback && data.feedback[selectedOption!] && (
        <View
          style={[
            styles.feedbackContainer,
            { backgroundColor: isCorrect ? "#E8F5E9" : "#FFE5E5" },
          ]}
        >
          <ThemedText style={[styles.feedbackText, { color: isCorrect ? "#2E7D32" : "#D32F2F" }]}>
            {data.feedback[selectedOption!]}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

function MatchBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: MatchBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [matches, setMatches] = useState<Record<string, string>>(
    previousAnswer?.matches ?? {}
  );

  const handleMatch = (left: string, right: string) => {
    const newMatches = { ...matches, [left]: right };
    setMatches(newMatches);
    if (onAnswer) {
      onAnswer({ matches: newMatches });
    }
  };

  const isComplete = (data.left || []).every((left) => matches[left]);

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.matchPrompt}>
        Match the terms with their meanings
      </ThemedText>
      <View style={styles.matchContainer}>
        <View style={styles.matchColumn}>
          {(data.left || []).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.matchItem,
                { borderColor: theme.icon, backgroundColor: theme.background },
                matches[item] && { backgroundColor: theme.tint, opacity: 0.7 },
              ]}
            >
              <ThemedText
                style={[
                  styles.matchItemText,
                  matches[item] && { color: "#FFFFFF" },
                ]}
              >
                {item}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.matchColumn}>
          {(data.right || []).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.matchItem, { borderColor: theme.icon, backgroundColor: theme.background }]}
              onPress={() => {
                // Find unmatched left item
                const unmatchedLeft = (data.left || []).find((left) => !matches[left]);
                if (unmatchedLeft) {
                  handleMatch(unmatchedLeft, item);
                }
              }}
            >
              <ThemedText style={styles.matchItemText}>{item}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {isComplete && (
        <View style={[styles.feedbackContainer, { backgroundColor: isDark ? "rgba(46, 125, 50, 0.2)" : "#E8F5E9" }]}>
          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
          <ThemedText style={[styles.feedbackText, { color: "#2E7D32" }]}>
            All matches complete!
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

function ClozeBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: ClozeBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>(
    previousAnswer?.answers ?? {}
  );

  const handleAnswer = (index: number, answer: string) => {
    const newAnswers = { ...answers, [index]: answer };
    setAnswers(newAnswers);
    if (onAnswer) {
      onAnswer({ answers: newAnswers });
    }
  };

  const textParts = (data.text || "").split(/\s+/);
  let blankIndex = 0;

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.clozePrompt}>
        Fill in the blanks
      </ThemedText>
      <View style={styles.clozeContainer}>
        {textParts.map((part, index) => {
          const blank = (data.blanks || []).find((b) => b.index === blankIndex);
          if (blank) {
            blankIndex++;
            const userAnswer = answers[blank.index];
            const isCorrect = userAnswer === blank.correct;

            return (
              <View key={index} style={styles.clozeBlankContainer}>
                <TextInput
                  style={[
                    styles.clozeInput,
                    {
                      borderColor: userAnswer
                        ? isCorrect
                          ? "#4CAF50"
                          : "#D32F2F"
                        : theme.icon,
                      backgroundColor: theme.background,
                      color: theme.text,
                    },
                  ]}
                  value={userAnswer || ""}
                  onChangeText={(text) => handleAnswer(blank.index, text)}
                  placeholder="?"
                  placeholderTextColor={theme.icon}
                />
                {userAnswer && (
                  <Ionicons
                    name={isCorrect ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={isCorrect ? "#4CAF50" : "#D32F2F"}
                    style={styles.clozeFeedback}
                  />
                )}
              </View>
            );
          }
          return (
            <ThemedText key={index} style={styles.clozeText}>
              {part}{" "}
            </ThemedText>
          );
        })}
      </View>
    </ThemedView>
  );
}

function OrderBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: OrderBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [order, setOrder] = useState<number[]>(
    previousAnswer?.order ?? (data.items || []).map((_, i) => i)
  );

  const handleMove = (fromIndex: number, toIndex: number) => {
    const newOrder = [...order];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setOrder(newOrder);
    if (onAnswer) {
      onAnswer({ order: newOrder });
    }
  };

  const isCorrect = JSON.stringify(order) === JSON.stringify(data.correct_order || []);

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.orderPrompt}>
        {data.prompt}
      </ThemedText>
      <ScrollView style={styles.orderContainer}>
        {order.map((itemIndex, displayIndex) => (
          <TouchableOpacity
            key={itemIndex}
            style={[
              styles.orderItem,
              {
                backgroundColor: theme.background,
                borderColor: theme.icon,
              },
            ]}
            onPress={() => {
              if (displayIndex > 0) {
                handleMove(displayIndex, displayIndex - 1);
              }
            }}
          >
            <Ionicons name="reorder" size={20} color={theme.icon} />
            <ThemedText style={styles.orderItemText}>
              {displayIndex + 1}. {(data.items || [])[itemIndex] || ""}
            </ThemedText>
            {displayIndex < order.length - 1 && (
              <TouchableOpacity
                onPress={() => handleMove(displayIndex, displayIndex + 1)}
              >
                <Ionicons name="chevron-down" size={20} color={theme.icon} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isCorrect && (
        <View style={[styles.feedbackContainer, { backgroundColor: "#E8F5E9" }]}>
          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
          <ThemedText style={[styles.feedbackText, { color: "#2E7D32" }]}>
            Correct order!
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

function HighlightBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: HighlightBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    previousAnswer?.selectedIndices ?? []
  );

  const handleToggle = (index: number) => {
    const newIndices = selectedIndices.includes(index)
      ? selectedIndices.filter((i) => i !== index)
      : [...selectedIndices, index];
    setSelectedIndices(newIndices);
    if (onAnswer) {
      onAnswer({ selectedIndices: newIndices });
    }
  };

  const isCorrect =
    selectedIndices.length === (data.correct_indices || []).length &&
    (data.correct_indices || []).every((idx) => selectedIndices.includes(idx));

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.highlightPrompt}>
        {data.prompt}
      </ThemedText>
      <View style={styles.highlightContainer}>
        {(data.text_tokens || []).map((token, index) => {
          const isSelected = selectedIndices.includes(index);
          const isCorrectIndex = (data.correct_indices || []).includes(index);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.highlightToken,
                { borderColor: theme.icon, backgroundColor: theme.background },
                isSelected && {
                  backgroundColor: isCorrectIndex ? "#4CAF50" : "#FF9800",
                },
              ]}
              onPress={() => handleToggle(index)}
            >
              <ThemedText
                style={[
                  styles.highlightTokenText,
                  isSelected && { color: "#FFFFFF" },
                ]}
              >
                {token}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
      {isCorrect && (
        <View style={[styles.feedbackContainer, { backgroundColor: isDark ? "rgba(46, 125, 50, 0.2)" : "#E8F5E9" }]}>
          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
          <ThemedText style={[styles.feedbackText, { color: "#2E7D32" }]}>
            Correct!
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

function ClassificationBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: ClassificationBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [classifications, setClassifications] = useState<Record<string, string>>(
    previousAnswer?.classifications ?? {}
  );

  const handleClassify = (item: string, bucket: string) => {
    const newClassifications = { ...classifications, [item]: bucket };
    setClassifications(newClassifications);
    if (onAnswer) {
      onAnswer({ classifications: newClassifications });
    }
  };

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.classificationPrompt}>
        {data.prompt}
      </ThemedText>
      <View style={styles.bucketsContainer}>
        {(data.buckets || []).map((bucket, index) => (
          <ThemedView key={index} style={[styles.bucket, { borderColor: theme.icon, backgroundColor: theme.background }]}>
            <ThemedText type="subtitle" style={styles.bucketTitle}>
              {bucket}
            </ThemedText>
            {(data.items || [])
              .filter((item) => classifications[item] === bucket)
              .map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.bucketItem, { backgroundColor: theme.tint }]}
                  onPress={() => handleClassify(item, "")}
                >
                  <ThemedText style={[styles.bucketItemText, { color: "#FFFFFF" }]}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              ))}
          </ThemedView>
        ))}
      </View>
      <View style={styles.itemsContainer}>
        {(data.items || [])
          .filter((item) => !classifications[item])
          .map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.classificationItem, { borderColor: theme.icon, backgroundColor: theme.background }]}
              onPress={() => {
                // Allow user to select bucket
                Alert.alert("Select bucket", "Choose a bucket", [
                  ...(data.buckets || []).map((bucket) => ({
                    text: bucket,
                    onPress: () => handleClassify(item, bucket),
                  })),
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <ThemedText style={styles.classificationItemText}>{item}</ThemedText>
            </TouchableOpacity>
          ))}
      </View>
    </ThemedView>
  );
}

function ScenarioChoiceBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: ScenarioChoiceBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    previousAnswer?.selectedOption ?? null
  );
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setShowFeedback(true);
    if (onAnswer) {
      onAnswer({ selectedOption: index, isCorrect: index === data.correct_option });
    }
  };

  const isCorrect = selectedOption === data.correct_option;

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="git-branch" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.scenarioSituation}>
        {data.situation}
      </ThemedText>
      <ThemedText style={styles.scenarioQuestion}>{data.question}</ThemedText>
      <View style={styles.optionsContainer}>
        {(data.options || []).map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectOption = index === data.correct_option;
          let buttonStyle = styles.optionButton;

          if (showFeedback) {
            if (isCorrectOption) {
              buttonStyle = [styles.optionButton, styles.correctOption];
            } else if (isSelected && !isCorrectOption) {
              buttonStyle = [styles.optionButton, styles.incorrectOption];
            }
          } else if (isSelected) {
            buttonStyle = [styles.optionButton, { backgroundColor: theme.tint }];
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => handleSelect(index)}
              disabled={showFeedback}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  (showFeedback && isCorrectOption) || (isSelected && !showFeedback)
                    ? { color: "#FFFFFF" }
                    : {},
                ]}
              >
                {option}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
      {showFeedback && data.feedback && data.feedback[selectedOption!] && (
        <View
          style={[
            styles.feedbackContainer,
            { 
              backgroundColor: isCorrect 
                ? (isDark ? "rgba(46, 125, 50, 0.2)" : "#E8F5E9")
                : (isDark ? "rgba(211, 47, 47, 0.2)" : "#FFE5E5")
            },
          ]}
        >
          <ThemedText style={[styles.feedbackText, { color: isCorrect ? "#2E7D32" : "#D32F2F" }]}>
            {data.feedback[selectedOption!]}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

function MicroQuizBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: MicroQuizBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [answers, setAnswers] = useState<Record<number, any>>(
    previousAnswer?.answers ?? {}
  );

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.microQuizTitle}>
        Quick Check
      </ThemedText>
      {(data.items || []).map((item, index) => (
        <QuestionBlock
          key={index}
          data={item as QuestionBlockData}
          theme={theme}
          onAnswer={(answer) => {
            const newAnswers = { ...answers, [index]: answer };
            setAnswers(newAnswers);
            if (onAnswer) {
              onAnswer({ answers: newAnswers });
            }
          }}
          previousAnswer={answers[index]}
        />
      ))}
    </ThemedView>
  );
}

function ReflectionBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: ReflectionBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [response, setResponse] = useState<string>(previousAnswer?.response ?? "");

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="journal" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.reflectionPrompt}>
        {data.prompt}
      </ThemedText>
      <TextInput
        style={[
          styles.reflectionInput,
          {
            backgroundColor: theme.background,
            borderColor: theme.icon,
            color: theme.text,
          },
        ]}
        multiline
        numberOfLines={6}
        placeholder="Write your reflection here..."
        placeholderTextColor={theme.icon}
        value={response}
          onChangeText={(text) => {
          setResponse(text);
          if (onAnswer) {
            onAnswer({ response: text });
          }
        }}
      />
    </ThemedView>
  );
}

function GuidedReflectionBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: GuidedReflectionBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(
    previousAnswer?.responses ?? (data.steps || []).map(() => "")
  );

  const handleResponse = (stepIndex: number, text: string) => {
    const newResponses = [...responses];
    newResponses[stepIndex] = text;
    setResponses(newResponses);
    if (onAnswer) {
      onAnswer({ responses: newResponses });
    }
  };

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="journal" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.guidedReflectionTitle}>
        Guided Reflection ({currentStep + 1} of {(data.steps || []).length})
      </ThemedText>
      <ThemedText style={styles.guidedReflectionPrompt}>
        {(data.steps || [])[currentStep]?.prompt || ""}
      </ThemedText>
      <TextInput
        style={[
          styles.reflectionInput,
          {
            backgroundColor: theme.background,
            borderColor: theme.icon,
            color: theme.text,
          },
        ]}
        multiline
        numberOfLines={4}
        placeholder="Write your response..."
        placeholderTextColor={theme.icon}
        value={responses[currentStep]}
        onChangeText={(text) => handleResponse(currentStep, text)}
      />
      <View style={styles.guidedReflectionNav}>
        <TouchableOpacity
          onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={[
            styles.guidedReflectionNavButton,
            { borderColor: theme.icon, backgroundColor: theme.background },
            currentStep === 0 && styles.guidedReflectionNavButtonDisabled,
          ]}
        >
          <ThemedText
            style={[
              styles.guidedReflectionNavText,
              currentStep === 0 && { color: theme.icon },
            ]}
          >
            Previous
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentStep(Math.min((data.steps || []).length - 1, currentStep + 1))}
          disabled={currentStep === (data.steps || []).length - 1}
          style={[
            styles.guidedReflectionNavButton,
            { borderColor: theme.icon, backgroundColor: theme.background },
            currentStep === (data.steps || []).length - 1 && styles.guidedReflectionNavButtonDisabled,
          ]}
        >
          <ThemedText
            style={[
            styles.guidedReflectionNavText,
            currentStep === (data.steps || []).length - 1 && { color: theme.icon },
            ]}
          >
            Next
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

function IntentionBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: IntentionBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [intention, setIntention] = useState<string>(previousAnswer?.intention ?? "");

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="flag" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.intentionPrompt}>
        {data.prompt}
      </ThemedText>
      {data.examples && data.examples.length > 0 && (
        <View style={styles.intentionExamples}>
          <ThemedText style={[styles.intentionExamplesTitle, { color: theme.icon }]}>
            Examples:
          </ThemedText>
          {data.examples.map((example, index) => (
            <ThemedText key={index} style={[styles.intentionExample, { color: theme.icon }]}>
              • {example}
            </ThemedText>
          ))}
        </View>
      )}
      <TextInput
        style={[
          styles.reflectionInput,
          {
            backgroundColor: theme.background,
            borderColor: theme.icon,
            color: theme.text,
          },
        ]}
        placeholder="Set your intention..."
        placeholderTextColor={theme.icon}
        value={intention}
          onChangeText={(text) => {
          setIntention(text);
          if (onAnswer) {
            onAnswer({ intention: text });
          }
        }}
      />
    </ThemedView>
  );
}

function CheckInBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: CheckInBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [rating, setRating] = useState<number | null>(previousAnswer?.rating ?? null);

  const handleRating = (value: number) => {
    setRating(value);
    if (onAnswer) {
      onAnswer({ rating: value });
    }
  };

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.checkInPrompt}>
        {data.prompt}
      </ThemedText>
      <View style={styles.ratingContainer}>
        {Array.from({ length: data.scale_max - data.scale_min + 1 }, (_, i) => {
          const value = data.scale_min + i;
          const isSelected = rating === value;
          const label = data.labels?.[value];

          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                { borderColor: theme.icon, backgroundColor: theme.background },
                isSelected && { backgroundColor: theme.tint, borderColor: theme.tint },
              ]}
              onPress={() => handleRating(value)}
            >
              <ThemedText
                style={[
                  styles.ratingButtonText,
                  isSelected && { color: "#FFFFFF" },
                ]}
              >
                {value}
              </ThemedText>
              {label && (
                <ThemedText
                  style={[
                    styles.ratingLabel,
                    { color: isSelected ? "#FFFFFF" : theme.icon },
                  ]}
                >
                  {label}
                </ThemedText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
  );
}

function AudioRecitationBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: any;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="headset" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.audioTitle}>
        Listen to Recitation
      </ThemedText>
      <TouchableOpacity
        style={[styles.audioButton, { backgroundColor: theme.tint }]}
        onPress={() => {
          setIsPlaying(!isPlaying);
          // TODO: Implement audio playback
          Alert.alert("Audio", "Audio playback will be implemented with expo-av");
        }}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFFFFF" />
      </TouchableOpacity>
      {data.follow_along && (
        <ThemedText style={[styles.audioHint, { color: theme.icon }]}>
          Follow along with the text
        </ThemedText>
      )}
    </ThemedView>
  );
}

function ListenAndSelectBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: any;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    previousAnswer?.selectedOption ?? null
  );
  const [hasPlayed, setHasPlayed] = useState(false);

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="headset" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.listenSelectTitle}>
        Listen and Select
      </ThemedText>
      <TouchableOpacity
        style={[styles.audioButton, { backgroundColor: theme.tint }]}
        onPress={() => {
          setHasPlayed(true);
          // TODO: Implement audio playback
          Alert.alert("Audio", "Audio playback will be implemented with expo-av");
        }}
      >
        <Ionicons name="play" size={32} color="#FFFFFF" />
      </TouchableOpacity>
          {hasPlayed && (
        <>
          <ThemedText style={styles.listenSelectPrompt}>{data.prompt}</ThemedText>
          <View style={styles.optionsContainer}>
            {(data.options || []).map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
              style={[
                styles.optionButton,
                { borderColor: theme.icon, backgroundColor: theme.background },
                selectedOption === index && { backgroundColor: theme.tint, borderColor: theme.tint },
              ]}
              onPress={() => {
                setSelectedOption(index);
                if (onAnswer) {
                  onAnswer({
                    selectedOption: index,
                    isCorrect: index === data.correct_option,
                  });
                }
              }}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  selectedOption === index && { color: "#FFFFFF" },
                ]}
              >
                {option}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        </>
      )}
    </ThemedView>
  );
}

function RepeatPracticeBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: any;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [isRecording, setIsRecording] = useState(false);

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="mic" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.repeatPrompt}>
        {data.prompt}
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.audioButton,
          { backgroundColor: isRecording ? "#D32F2F" : theme.tint },
        ]}
        onPress={() => {
          setIsRecording(!isRecording);
          // TODO: Implement speech recording
          Alert.alert("Recording", "Speech recording will be implemented");
        }}
      >
        <Ionicons name={isRecording ? "stop" : "mic"} size={32} color="#FFFFFF" />
      </TouchableOpacity>
      <ThemedText style={[styles.repeatHint, { color: theme.icon }]}>
        {isRecording ? "Recording..." : "Tap to record your pronunciation"}
      </ThemedText>
    </ThemedView>
  );
}

function SummaryBlock({ data, theme }: { data: SummaryBlockData; theme: any }) {
  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
      <Ionicons name="checkmark-circle" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.summaryTitle}>
        Key Takeaways
      </ThemedText>
      {(data.key_takeaways || []).map((takeaway, index) => (
        <View key={index} style={styles.takeawayItem}>
          <Ionicons name="checkmark" size={20} color={theme.tint} />
          <ThemedText style={styles.takeawayText}>{takeaway}</ThemedText>
        </View>
      ))}
    </ThemedView>
  );
}

function MemoryCardBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: MemoryCardBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <ThemedView style={styles.blockContainer}>
      <TouchableOpacity
        style={[styles.memoryCard, { backgroundColor: theme.tint }]}
        onPress={() => {
          setFlipped(!flipped);
          if (onAnswer) {
            onAnswer({ flipped: !flipped });
          }
        }}
      >
        <ThemedText style={[styles.memoryCardText, { color: "#FFFFFF" }]}>
          {flipped ? data.back : data.front}
        </ThemedText>
        <Ionicons name="refresh" size={24} color="#FFFFFF" style={styles.memoryCardIcon} />
      </TouchableOpacity>
    </ThemedView>
  );
}

function CompareContrastBlock({
  data,
  theme,
}: {
  data: CompareContrastBlockData;
  theme: any;
}) {
  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" style={styles.compareTitle}>
        Compare & Contrast
      </ThemedText>
      <View style={styles.compareContainer}>
        <View style={styles.compareColumn}>
          <ThemedText type="subtitle" style={styles.compareColumnTitle}>
            {data.left_title}
          </ThemedText>
          {(data.left_points || []).map((point, index) => (
            <View key={index} style={styles.comparePoint}>
              <Ionicons name="ellipse" size={8} color={theme.tint} />
              <ThemedText style={styles.comparePointText}>{point}</ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.compareColumn}>
          <ThemedText type="subtitle" style={styles.compareColumnTitle}>
            {data.right_title}
          </ThemedText>
          {(data.right_points || []).map((point, index) => (
            <View key={index} style={styles.comparePoint}>
              <Ionicons name="ellipse" size={8} color={theme.tint} />
              <ThemedText style={styles.comparePointText}>{point}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

function TeachBackBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: TeachBackBlockData;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const [response, setResponse] = useState<string>(previousAnswer?.response ?? "");

  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Ionicons name="school" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.teachBackPrompt}>
        {data.prompt}
      </ThemedText>
      <TextInput
        style={[
          styles.reflectionInput,
          {
            backgroundColor: theme.background,
            borderColor: theme.icon,
            color: theme.text,
          },
        ]}
        multiline
        numberOfLines={6}
        placeholder="Explain in your own words..."
        placeholderTextColor={theme.icon}
        value={response}
        onChangeText={(text) => {
          setResponse(text);
          if (onAnswer) {
            onAnswer({ response: text });
          }
        }}
      />
    </ThemedView>
  );
}

function CheckpointBlock({
  data,
  theme,
  onAnswer,
  previousAnswer,
}: {
  data: any;
  theme: any;
  onAnswer?: (answer: any) => void;
  previousAnswer?: any;
}) {
  const isDark = theme.background === Colors.dark.background;
  
  return (
    <ThemedView style={[styles.blockContainer, { backgroundColor: theme.background, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
      <Ionicons name="flag" size={32} color={theme.tint} style={styles.blockIcon} />
      <ThemedText type="subtitle" style={styles.checkpointTitle}>
        Checkpoint
      </ThemedText>
      <ThemedText style={styles.checkpointText}>
        Complete the questions above to pass this checkpoint. You need{" "}
        {Math.round(data.pass_score * 100)}% to pass.
      </ThemedText>
    </ThemedView>
  );
}

// ============== STYLES ==============

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  unknownBlock: {
    padding: 20,
    alignItems: "center",
  },
  blockContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  blockIcon: {
    marginBottom: 12,
    alignSelf: "center",
  },
  // Objective - removed hardcoded background
  objectiveText: {
    textAlign: "center",
    fontSize: 18,
  },
  // Scripture - removed hardcoded background
  scriptureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scriptureTitle: {
    flex: 1,
  },
  scriptureContent: {
    marginTop: 16,
  },
  gurmukhiText: {
    fontFamily: "serif",
    textAlign: "center",
  },
  transliterationText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Context - removed hardcoded background
  contextText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Explanation - removed hardcoded background
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Analogy
  analogyBlock: {
    backgroundColor: "#E8F5E9",
    alignItems: "center",
  },
  analogyTitle: {
    marginBottom: 12,
  },
  analogyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  // Definition - removed hardcoded background
  definitionTerm: {
    fontSize: 20,
    marginBottom: 8,
  },
  definitionGloss: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  definitionNotes: {
    gap: 8,
  },
  definitionNoteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  definitionNote: {
    fontSize: 14,
    flex: 1,
  },
  // Misconception
  misconceptionBlock: {
    gap: 16,
  },
  misconceptionItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  misconceptionContent: {
    flex: 1,
  },
  misconceptionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  misconceptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Question - removed hardcoded background
  questionPrompt: {
    fontSize: 18,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  correctOption: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  incorrectOption: {
    backgroundColor: "#D32F2F",
    borderColor: "#D32F2F",
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  feedbackContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackText: {
    fontSize: 14,
    flex: 1,
  },
  // Match - removed hardcoded background
  matchPrompt: {
    marginBottom: 20,
  },
  matchContainer: {
    flexDirection: "row",
    gap: 16,
  },
  matchColumn: {
    flex: 1,
    gap: 12,
  },
  matchItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  matchItemText: {
    fontSize: 14,
  },
  // Cloze
  clozeBlock: {
    backgroundColor: "#F5F5F5",
  },
  clozePrompt: {
    marginBottom: 20,
  },
  clozeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  clozeBlankContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clozeInput: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
    textAlign: "center",
    fontSize: 16,
  },
  clozeText: {
    fontSize: 16,
  },
  clozeFeedback: {
    marginLeft: 4,
  },
  // Order - removed hardcoded background
  orderPrompt: {
    marginBottom: 20,
  },
  orderContainer: {
    maxHeight: 300,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  orderItemText: {
    fontSize: 16,
    flex: 1,
  },
  // Highlight - removed hardcoded background
  highlightPrompt: {
    marginBottom: 20,
  },
  highlightContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  highlightToken: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  highlightTokenText: {
    fontSize: 16,
  },
  // Classification
  classificationBlock: {
    backgroundColor: "#F5F5F5",
  },
  classificationPrompt: {
    marginBottom: 20,
  },
  bucketsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  bucket: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minHeight: 200,
  },
  bucketTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  bucketItem: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  bucketItemText: {
    fontSize: 14,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classificationItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  classificationItemText: {
    fontSize: 14,
  },
  // Scenario - removed hardcoded background
  scenarioSituation: {
    marginBottom: 12,
    textAlign: "center",
  },
  scenarioQuestion: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  // Micro Quiz - removed hardcoded background
  microQuizTitle: {
    marginBottom: 20,
  },
  // Reflection - removed hardcoded background
  reflectionPrompt: {
    marginBottom: 20,
  },
  reflectionInput: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  // Guided Reflection - removed hardcoded background
  guidedReflectionTitle: {
    marginBottom: 12,
  },
  guidedReflectionPrompt: {
    fontSize: 16,
    marginBottom: 20,
  },
  guidedReflectionNav: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  guidedReflectionNavButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  guidedReflectionNavButtonDisabled: {
    opacity: 0.5,
  },
  guidedReflectionNavText: {
    fontSize: 16,
  },
  // Intention
  intentionBlock: {
    backgroundColor: "#F5F5F5",
  },
  intentionPrompt: {
    marginBottom: 12,
  },
  intentionExamples: {
    marginBottom: 20,
  },
  intentionExamplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  intentionExample: {
    fontSize: 14,
    marginBottom: 4,
  },
  // Check In - removed hardcoded background
  checkInPrompt: {
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ratingButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 60,
    alignItems: "center",
  },
  ratingButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  ratingLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  // Audio - removed hardcoded background
  audioTitle: {
    marginBottom: 20,
  },
  audioButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  audioHint: {
    fontSize: 14,
    textAlign: "center",
  },
  // Listen and Select - removed hardcoded background
  listenSelectTitle: {
    marginBottom: 20,
  },
  listenSelectPrompt: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  // Repeat
  repeatBlock: {
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  repeatPrompt: {
    marginBottom: 20,
  },
  repeatHint: {
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  // Summary - removed hardcoded background
  summaryTitle: {
    marginBottom: 20,
  },
  takeawayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  takeawayText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  // Memory Card - removed hardcoded background
  memoryCard: {
    width: "100%",
    minHeight: 200,
    borderRadius: 12,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  memoryCardText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  memoryCardIcon: {
    opacity: 0.7,
  },
  // Compare - removed hardcoded background
  compareTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  compareContainer: {
    flexDirection: "row",
    gap: 16,
  },
  compareColumn: {
    flex: 1,
  },
  compareColumnTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  comparePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  comparePointText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  // Teach Back - removed hardcoded background
  teachBackPrompt: {
    marginBottom: 20,
  },
  // Checkpoint - removed hardcoded background
  checkpointTitle: {
    marginBottom: 12,
  },
  checkpointText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
