import React, {
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  useRef,
  forwardRef
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop
} from "react-native-svg";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/contexts/AuthContext";
import {
  getLessonsPaginated,
  getCompletedLessonsForHolyBook
} from "@/lib/database.service";
import { getLessonProgressUserId } from "@/services/lesson-progress-user";
import type { LessonWithBlocks } from "@/lib/database.types";

const NODE_SIZE = 64;
const NODE_SPACING = 32; // Increased to account for labels and prevent overlap
const PATH_WIDTH = 1.5;
const RIVER_WIDTH = 10; // Slim river band between nodes
const LABEL_HEIGHT = 44; // Approximate height for lesson label (2 lines of text + spacing)
const CURVE_CONTROL_OFFSET = 50; // Control point offset for smooth curves
const LESSONS_PER_BATCH = 10; // Load 10 lessons at a time
const LESSONS_PER_SECTION = 5; // Groups of 5; complete all in a section to unlock the next
const SECTION_HEADER_HEIGHT = 36;

interface LearningJourneyProps {
  holyBookId?: string;
  onLessonPress?: (lesson: LessonWithBlocks) => void;
}

export interface LearningJourneyRef {
  refreshProgress: () => Promise<void>;
}

interface CompletedLesson {
  lesson_id: string;
  order_index: number;
  score?: number;
}

interface LessonNode {
  lesson: LessonWithBlocks;
  x: number;
  y: number;
  completed: boolean;
  locked: boolean;
  sectionIndex: number;
  isCheckpoint?: boolean;
  isSpecial?: boolean; // For treasure chests, special lessons
  /** 1–3 stars based on lesson score (situation/questions correct). */
  stars?: number;
}

function isSectionUnlocked(
  sectionIndex: number,
  completedOrderIndices: Set<number>
): boolean {
  if (sectionIndex === 0) return true;
  for (let t = 0; t < sectionIndex; t++) {
    for (
      let k = t * LESSONS_PER_SECTION + 1;
      k <= (t + 1) * LESSONS_PER_SECTION;
      k++
    ) {
      if (!completedOrderIndices.has(k)) return false;
    }
  }
  return true;
}

/** Convert stored score (0–100) to 1–3 stars. No score = 3 stars (backwards compat). */
function scoreToStars(score?: number): 1 | 2 | 3 {
  if (score == null || score >= 80) return 3;
  if (score >= 50) return 2;
  return 1;
}

function LearningJourneyInner(
  { holyBookId, onLessonPress }: LearningJourneyProps,
  ref: React.Ref<LearningJourneyRef>
) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { user } = useAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [displayedLessons, setDisplayedLessons] = useState<LessonWithBlocks[]>(
    []
  );
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nodes, setNodes] = useState<LessonNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadLessons = useCallback(async () => {
    if (!holyBookId) {
      setDisplayedLessons([]);
      setNodes([]);
      setCompletedLessons([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const userId = await getLessonProgressUserId();
      const [{ lessons, hasMore: more }, completed] = await Promise.all([
        getLessonsPaginated(holyBookId, LESSONS_PER_BATCH, 0),
        getCompletedLessonsForHolyBook(userId, holyBookId)
      ]);

      if (!lessons || lessons.length === 0) {
        setError(
          "No lessons found. Run: npm run migrate:lessons-from-json:clear (after clearing, or npm run migrate:lessons-from-json to add from lessons.json)"
        );
        setDisplayedLessons([]);
        setNodes([]);
        setCompletedLessons([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setDisplayedLessons(lessons);
      setCompletedLessons(completed);
      setHasMore(more);
      generateNodes(lessons, completed, windowWidth);
    } catch (err) {
      console.error("Error loading lessons:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(
        `Failed to load lessons: ${errorMessage}. Please check your database connection and ensure tables exist.`
      );
      setDisplayedLessons([]);
      setNodes([]);
      setCompletedLessons([]);
    } finally {
      setLoading(false);
    }
  }, [holyBookId, user?.id, windowWidth]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const onRefresh = async () => {
    setRefreshing(true);
    setDisplayedLessons([]);
    setNodes([]);
    setHasMore(true);
    await loadLessons();
    setRefreshing(false);
  };

  /** Refetch completed progress and regenerate nodes (e.g. after user completes a lesson). */
  const refreshProgress = useCallback(async () => {
    if (!holyBookId || displayedLessons.length === 0) return;
    const userId = await getLessonProgressUserId();
    const completed = await getCompletedLessonsForHolyBook(userId, holyBookId);
    setCompletedLessons(completed);
    generateNodes(displayedLessons, completed, windowWidth);
  }, [holyBookId, user?.id, displayedLessons, windowWidth]);

  useImperativeHandle(ref, () => ({ refreshProgress }), [refreshProgress]);

  const loadMoreLessons = async () => {
    if (loadingMore || !hasMore || !holyBookId) return;

    setLoadingMore(true);
    try {
      const offset = displayedLessons.length;
      const { lessons, hasMore: more } = await getLessonsPaginated(
        holyBookId,
        LESSONS_PER_BATCH,
        offset
      );

      if (lessons.length > 0) {
        setDisplayedLessons((prev) => {
          const updated = [...prev, ...lessons];
          generateNodes(updated, completedLessons, windowWidth);
          return updated;
        });
      }
      setHasMore(more);
    } catch (err) {
      console.error("Error loading more lessons:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const generateNodes = (
    lessonsToDisplay: LessonWithBlocks[],
    completed: CompletedLesson[],
    canvasWidth: number
  ) => {
    const completedLessonIds = new Set(completed.map((c) => c.lesson_id));
    const completedOrderIndices = new Set(completed.map((c) => c.order_index));
    const scoreByLessonId = new Map(
      completed.map((c) => [c.lesson_id, c.score])
    );
    const allNodes: LessonNode[] = [];
    let currentY = 20;

    lessonsToDisplay.forEach((lesson) => {
      const globalIndex = lesson.order_index - 1;
      const sectionIndex = Math.floor(globalIndex / LESSONS_PER_SECTION);
      const isFirstInSection = globalIndex % LESSONS_PER_SECTION === 0;
      if (isFirstInSection) {
        currentY += SECTION_HEADER_HEIGHT;
      }

      const baseOffset = Math.min(canvasWidth * 0.12, 60);
      const offsetX =
        globalIndex % 3 === 1 ? -baseOffset : globalIndex % 3 === 2 ? baseOffset : 0;
      const x = canvasWidth / 2 - NODE_SIZE / 2 + offsetX;
      const y = currentY;

      const completed_ = completedLessonIds.has(lesson.id);
      const unlocked = isSectionUnlocked(sectionIndex, completedOrderIndices);
      const locked = !unlocked;

      allNodes.push({
        lesson,
        x,
        y,
        completed: completed_,
        locked,
        sectionIndex,
        isCheckpoint:
          (globalIndex + 1) % LESSONS_PER_SECTION === 0 &&
          globalIndex + 1 >= LESSONS_PER_SECTION,
        isSpecial:
          lesson.lesson_type === "checkpoint" ||
          lesson.id.includes("checkpoint"),
        stars: completed_
          ? scoreToStars(scoreByLessonId.get(lesson.id))
          : undefined
      });

      currentY += NODE_SIZE + NODE_SPACING + LABEL_HEIGHT;
    });

    setNodes(allNodes);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 200;

    if (
      layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom &&
      hasMore &&
      !loadingMore &&
      holyBookId
    ) {
      loadMoreLessons();
    }
  };

  const getNodeIcon = (
    lesson: LessonWithBlocks,
    completed: boolean,
    locked: boolean,
    isCheckpoint?: boolean,
    isSpecial?: boolean
  ) => {
    if (completed) {
      return "checkmark-circle";
    }
    if (isCheckpoint || isSpecial) {
      return "trophy"; // Treasure chest / checkpoint
    }

    // Determine icon based on lesson type and blocks
    const blockTypes = (lesson.blocks || []).map((b: any) => b.block_type);
    if (
      blockTypes.includes("audio_recitation") ||
      blockTypes.includes("repeat_practice")
    ) {
      return "mic";
    }
    if (
      blockTypes.includes("question") ||
      blockTypes.includes("micro_quiz") ||
      blockTypes.includes("match") ||
      blockTypes.includes("cloze")
    ) {
      return "fitness"; // Dumbbell for practice
    }
    if (blockTypes.includes("scenario_choice")) {
      return "git-branch";
    }
    if (
      blockTypes.includes("reflection") ||
      blockTypes.includes("guided_reflection")
    ) {
      return "journal";
    }
    if (
      blockTypes.includes("audio_recitation") ||
      blockTypes.includes("listen_and_select")
    ) {
      return "headset";
    }
    return "book";
  };

  const getNodeColor = (
    completed: boolean,
    locked: boolean,
    isCheckpoint?: boolean,
    isSpecial?: boolean,
    theme?: any
  ) => {
    if (locked) return "#CCCCCC";
    if (completed) return theme?.tint || "#7C3AED";
    if (isCheckpoint || isSpecial) return "#FFD700"; // Gold for special lessons
    return theme?.tint || "#7C3AED"; // Use app's purple theme color
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
            Loading lessons...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#D32F2F" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Error Loading Lessons
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            {error}
          </ThemedText>
          <ThemedText
            style={[
              styles.emptyText,
              { color: theme.icon, marginTop: 16, fontSize: 14 }
            ]}
          >
            Make sure you've:
          </ThemedText>
          <ThemedText
            style={[
              styles.emptyText,
              { color: theme.icon, fontSize: 14, marginTop: 8 }
            ]}
          >
            1. Created the database tables (run the SQL schema)
          </ThemedText>
          <ThemedText
            style={[styles.emptyText, { color: theme.icon, fontSize: 14 }]}
          >
            2. Run: npm run migrate:lessons-from-json:clear (or
            migrate:lessons-from-json)
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Show empty state when no holy book is selected
  if (!holyBookId) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={theme.icon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No holy book selected
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            Please select a holy book in Settings to view your learning journey.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!loading && displayedLessons.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={theme.icon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No lessons available
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            Your learning journey will appear here once lessons are created.
          </ThemedText>
          <ThemedText
            style={[
              styles.emptyText,
              { color: theme.icon, marginTop: 16, fontSize: 14 }
            ]}
          >
            Run: npm run migrate:lessons-from-json:clear (or
            migrate:lessons-from-json)
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Content height from currently loaded nodes (grows as user scrolls and we load more)
  const currentContentHeight =
    nodes.length > 0
      ? nodes[nodes.length - 1].y + NODE_SIZE + LABEL_HEIGHT + 100
      : windowHeight;

  const isDark = colorScheme === "dark";
  const skyColor = isDark ? "#1a1a2e" : "#e8f4f8";
  const groundColor = isDark ? "#16213e" : "#d4e8d4";
  const riverLight = "#5eb4c9";
  const riverDark = "#2a7a8c";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: currentContentHeight }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint}
            colors={[theme.tint]}
          />
        }
      >
        {/* Learning Path - River and scenery */}
        <View
          style={[styles.pathContainer, { minHeight: currentContentHeight }]}
        >
          {/* Background: sky to ground gradient (scenery) */}
          <LinearGradient
            colors={[skyColor, groundColor]}
            style={[styles.sceneryGradient, { height: currentContentHeight }]}
          />
          {/* Decorative hills / banks (left and right curved shapes) */}
          <View style={styles.sceneryHills} pointerEvents="none">
            <Svg
              width={windowWidth}
              height={currentContentHeight}
              style={styles.hillsSvg}
            >
              <Defs>
                <SvgLinearGradient
                  id="hillLeft"
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <Stop
                    offset="0%"
                    stopColor={isDark ? "#0f3460" : "#a8d5a2"}
                    stopOpacity={0.85}
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? "#16213e" : "#c5e8c0"}
                    stopOpacity={0.6}
                  />
                </SvgLinearGradient>
                <SvgLinearGradient
                  id="hillRight"
                  x1="100%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <Stop
                    offset="0%"
                    stopColor={isDark ? "#0f3460" : "#a8d5a2"}
                    stopOpacity={0.85}
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? "#16213e" : "#c5e8c0"}
                    stopOpacity={0.6}
                  />
                </SvgLinearGradient>
              </Defs>
              {/* Left bank - curved path */}
              <Path
                d={`M 0 ${currentContentHeight} Q ${windowWidth * 0.25} ${
                  currentContentHeight * 0.3
                } ${
                  windowWidth * 0.38
                } ${currentContentHeight} L 0 ${currentContentHeight} Z`}
                fill="url(#hillLeft)"
              />
              {/* Right bank */}
              <Path
                d={`M ${windowWidth} ${currentContentHeight} Q ${windowWidth * 0.75} ${
                  currentContentHeight * 0.4
                } ${
                  windowWidth * 0.62
                } ${currentContentHeight} L ${windowWidth} ${currentContentHeight} Z`}
                fill="url(#hillRight)"
              />
            </Svg>
          </View>

          {/* River path (thick band + center line) */}
          <Svg
            style={styles.pathSvg}
            width={windowWidth}
            height={currentContentHeight}
          >
            <Defs>
              <SvgLinearGradient
                id="riverGrad"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <Stop offset="0%" stopColor={riverLight} stopOpacity={0.95} />
                <Stop offset="100%" stopColor={riverDark} stopOpacity={1} />
              </SvgLinearGradient>
            </Defs>
            {nodes.map((node, nodeIndex) => {
              const isLast = nodeIndex === nodes.length - 1;
              const nextNode = nodes[nodeIndex + 1];

              if (isLast || !nextNode) return null;

              // Connect center-bottom of current node to center-top of next (reliable, no haywire lines)
              const startX = node.x + NODE_SIZE / 2;
              const startY = node.y + NODE_SIZE + LABEL_HEIGHT;
              const endX = nextNode.x + NODE_SIZE / 2;
              const endY = nextNode.y;

              const deltaX = endX - startX;
              const deltaY = endY - startY;
              const curveStrength = Math.min(
                Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.4,
                CURVE_CONTROL_OFFSET
              );
              const controlX1 = startX + deltaX * 0.3;
              const controlY1 = startY + curveStrength;
              const controlX2 = endX - deltaX * 0.3;
              const controlY2 = endY - curveStrength;

              const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

              return (
                <React.Fragment key={`path-${node.lesson.id}`}>
                  {/* River body (thick stroke) */}
                  <Path
                    d={pathData}
                    stroke="url(#riverGrad)"
                    strokeWidth={RIVER_WIDTH}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.6}
                  />
                  {/* River center line */}
                  <Path
                    d={pathData}
                    stroke={node.completed ? theme.tint : riverDark}
                    strokeWidth={PATH_WIDTH}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.75}
                  />
                </React.Fragment>
              );
            })}
          </Svg>

          {/* Lesson Nodes */}
          {nodes.map((node, nodeIndex) => {
            const isFirstInSection =
              nodeIndex === 0 ||
              nodes[nodeIndex - 1].sectionIndex !== node.sectionIndex;
            const iconName = getNodeIcon(
              node.lesson,
              node.completed,
              node.locked,
              node.isCheckpoint,
              node.isSpecial
            );
            const nodeColor = getNodeColor(
              node.completed,
              node.locked,
              node.isCheckpoint,
              node.isSpecial,
              theme
            );

            return (
              <View
                key={`node-${node.lesson.id}-${nodeIndex}`}
                style={styles.nodeContainer}
              >
                {/* Section header (above first node of each section) */}
                {isFirstInSection && (
                  <View
                    style={[
                      styles.sectionHeader,
                      {
                        left: 0,
                        top: node.y - SECTION_HEADER_HEIGHT - 4,
                        right: 0
                      }
                    ]}
                  >
                    <ThemedText
                      style={[styles.sectionHeaderText, { color: theme.icon }]}
                    >
                      Section {node.sectionIndex + 1}
                    </ThemedText>
                  </View>
                )}

                {/* Lesson Node */}
                <View
                  style={[
                    styles.lessonNodeWrapper,
                    { left: node.x, top: node.y }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.lessonNode,
                      {
                        backgroundColor: node.locked
                          ? "#CCCCCC"
                          : node.completed
                          ? theme.tint
                          : node.isCheckpoint || node.isSpecial
                          ? "#FFD700"
                          : theme.tint,
                        borderColor: nodeColor,
                        borderWidth: 0,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: node.locked ? 0.05 : 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        opacity: node.locked ? 0.8 : 1
                      }
                    ]}
                    onPress={() => {
                      if (node.locked) return;
                      if (onLessonPress) onLessonPress(node.lesson);
                    }}
                    disabled={node.locked}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={32}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  {/* Progress Stars (for completed lessons; 1–3 based on score) */}
                  {node.completed && (
                    <View style={styles.starsContainer}>
                      {[1, 2, 3].slice(0, node.stars ?? 3).map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={12}
                          color="#FFD700"
                          style={styles.star}
                        />
                      ))}
                    </View>
                  )}
                  {/* Lesson Label */}
                  <View
                    style={[
                      styles.lessonLabelContainer,
                      node.locked && styles.lessonLabelLocked
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.lessonLabel,
                        { color: node.locked ? theme.icon : theme.text }
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      adjustsFontSizeToFit={false}
                    >
                      {node.lesson.title ||
                        node.lesson.learning_objective ||
                        (node.lesson.tags?.length
                          ? node.lesson.tags.slice(0, 2).join(", ")
                          : `Lesson ${node.lesson.order_index}`)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Loading more indicator */}
          {loadingMore && (
            <View
              style={[
                styles.loadingMoreContainer,
                { top: currentContentHeight }
              ]}
            >
              <ActivityIndicator size="small" color={theme.tint} />
              <ThemedText
                style={[styles.loadingMoreText, { color: theme.icon }]}
              >
                Loading more lessons...
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const LearningJourney = forwardRef<LearningJourneyRef, LearningJourneyProps>(
  LearningJourneyInner
);
export default LearningJourney;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  pathContainer: {
    position: "relative",
    width: "100%",
    paddingTop: 20,
    paddingBottom: 40
  },
  sceneryGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  sceneryHills: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0.5
  },
  hillsSvg: {
    position: "absolute",
    top: 0,
    left: 0
  },
  pathSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1
  },
  nodeContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 2
  },
  lessonNodeWrapper: {
    position: "absolute",
    alignItems: "center",
    zIndex: 2
  },
  lessonNode: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center"
  },
  lessonLabelContainer: {
    marginTop: 4,
    width: 120,
    alignItems: "center"
  },
  lessonLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14
  },
  lessonLabelLocked: {
    opacity: 0.5
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
    alignSelf: "center"
  },
  star: {
    marginHorizontal: 1
  },
  loadingMoreContainer: {
    position: "absolute",
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  loadingMoreText: {
    fontSize: 14,
    marginLeft: 8
  },
  sectionHeader: {
    position: "absolute",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0.5
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5
  }
});
