import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAllLessons, type LessonWithBlocks } from "@/lib/database.service";

const { width, height } = Dimensions.get("window");
const NODE_SIZE = 64;
const NODE_SPACING = 32; // Increased to account for labels and prevent overlap
const PATH_WIDTH = 4;
const LABEL_HEIGHT = 44; // Approximate height for lesson label (2 lines of text + spacing)
const CURVE_CONTROL_OFFSET = 50; // Control point offset for smooth curves
const LESSONS_PER_BATCH = 10; // Load 10 lessons at a time

interface LearningJourneyProps {
  holyBookId?: string;
  onLessonPress?: (lesson: LessonWithBlocks) => void;
}

interface LessonNode {
  lesson: LessonWithBlocks;
  x: number;
  y: number;
  completed: boolean;
  locked: boolean;
  isCheckpoint?: boolean;
  isSpecial?: boolean; // For treasure chests, special lessons
}


export default function LearningJourney({
  holyBookId = "guru-granth-sahib",
  onLessonPress,
}: LearningJourneyProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [allLessons, setAllLessons] = useState<LessonWithBlocks[]>([]); // All lessons from DB
  const [displayedLessons, setDisplayedLessons] = useState<LessonWithBlocks[]>([]); // Currently displayed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nodes, setNodes] = useState<LessonNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [holyBookId]);

  const onRefresh = async () => {
    setRefreshing(true);
    setDisplayedLessons([]);
    setNodes([]);
    setHasMore(true);
    await loadLessons();
    setRefreshing(false);
  };

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading lessons for holy book:', holyBookId);
      const data = await getAllLessons(holyBookId);
      console.log('Fetched lessons:', data.length, data);
      
      if (!data || data.length === 0) {
        setError('No lessons found. Please run: npm run migrate:template-lessons');
        setAllLessons([]);
        setDisplayedLessons([]);
        setNodes([]);
        setLoading(false);
        return;
      }

      // Sort all lessons by order_index and deduplicate by order_index
      // If multiple lessons have the same order_index, keep only the first one
      const seenOrderIndices = new Set<number>();
      const sortedLessons = [...data]
        .sort((a: LessonWithBlocks, b: LessonWithBlocks) => a.order_index - b.order_index)
        .filter(lesson => {
          if (seenOrderIndices.has(lesson.order_index)) {
            console.warn(`Duplicate order_index ${lesson.order_index} found for lesson: ${lesson.id}. Skipping duplicate.`);
            return false;
          }
          seenOrderIndices.add(lesson.order_index);
          return true;
        });
      setAllLessons(sortedLessons);
      
      console.log('Total lessons available:', sortedLessons.length);
      
      // Load first batch
      const firstBatch = sortedLessons.slice(0, LESSONS_PER_BATCH);
      setDisplayedLessons(firstBatch);
      setHasMore(sortedLessons.length > LESSONS_PER_BATCH);
      generateNodes(firstBatch);
      
    } catch (err) {
      console.error("Error loading lessons:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load lessons: ${errorMessage}. Please check your database connection and ensure tables exist.`);
      setAllLessons([]);
      setDisplayedLessons([]);
      setNodes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreLessons = () => {
    if (loadingMore || !hasMore || allLessons.length === 0) return;
    
    setLoadingMore(true);
    const startIndex = displayedLessons.length;
    const endIndex = Math.min(startIndex + LESSONS_PER_BATCH, allLessons.length);
    const newLessons = allLessons.slice(startIndex, endIndex);
    
    setDisplayedLessons(prev => {
      const updated = [...prev, ...newLessons];
      generateNodes(updated);
      return updated;
    });
    setHasMore(endIndex < allLessons.length);
    setLoadingMore(false);
  };

  const generateNodes = (lessonsToDisplay: LessonWithBlocks[]) => {
    const allNodes: LessonNode[] = [];
    
    lessonsToDisplay.forEach((lesson) => {
      // Use order_index for global positioning (not local index in displayed array)
      const globalIndex = lesson.order_index - 1; // order_index is 1-based
      
      // Create winding path: alternate left/right
      const offsetX = (globalIndex % 3 === 1) ? -40 : (globalIndex % 3 === 2) ? 40 : 0;
      const x = width / 2 - NODE_SIZE / 2 + offsetX;
      // Position nodes starting from top, using global index
      const y = 20 + globalIndex * (NODE_SIZE + NODE_SPACING + LABEL_HEIGHT);

      allNodes.push({
        lesson,
        x,
        y,
        completed: false, // TODO: Get from user progress
        locked: false, // All lessons unlocked for now
        isCheckpoint: (globalIndex + 1) % 5 === 0,
        isSpecial: lesson.lesson_type === "checkpoint" || lesson.id.includes("checkpoint"),
      });
    });

    setNodes(allNodes);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 200; // Trigger loading when 200px from bottom
    
    if (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom &&
      hasMore &&
      !loadingMore &&
      allLessons.length > 0
    ) {
      loadMoreLessons();
    }
  };

  const getNodeIcon = (lesson: LessonWithBlocks, completed: boolean, locked: boolean, isCheckpoint?: boolean, isSpecial?: boolean) => {
    if (completed) {
      return "checkmark-circle";
    }
    if (isCheckpoint || isSpecial) {
      return "trophy"; // Treasure chest / checkpoint
    }

    // Determine icon based on lesson type and blocks
    const blockTypes = lesson.blocks.map((b: any) => b.block_type);
    if (blockTypes.includes("audio_recitation") || blockTypes.includes("repeat_practice")) {
      return "mic";
    }
    if (blockTypes.includes("question") || blockTypes.includes("micro_quiz") || blockTypes.includes("match") || blockTypes.includes("cloze")) {
      return "fitness"; // Dumbbell for practice
    }
    if (blockTypes.includes("scenario_choice")) {
      return "git-branch";
    }
    if (blockTypes.includes("reflection") || blockTypes.includes("guided_reflection")) {
      return "journal";
    }
    if (blockTypes.includes("audio_recitation") || blockTypes.includes("listen_and_select")) {
      return "headset";
    }
    return "book";
  };

  const getNodeColor = (completed: boolean, locked: boolean, isCheckpoint?: boolean, isSpecial?: boolean, theme?: any) => {
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
          <ThemedText style={[styles.emptyText, { color: theme.icon, marginTop: 16, fontSize: 14 }]}>
            Make sure you've:
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon, fontSize: 14, marginTop: 8 }]}>
            1. Created the database tables (run the SQL schema)
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon, fontSize: 14 }]}>
            2. Run: npm run migrate:template-lessons
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!loading && allLessons.length === 0) {
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
          <ThemedText style={[styles.emptyText, { color: theme.icon, marginTop: 16, fontSize: 14 }]}>
            Run: npm run migrate:template-lessons
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Calculate content height based on all lessons (for proper scrolling)
  const totalLessons = allLessons.length;
  const estimatedContentHeight = totalLessons > 0
    ? 20 + totalLessons * (NODE_SIZE + NODE_SPACING + LABEL_HEIGHT) + 100
    : height;
  
  // Current displayed content height
  const currentContentHeight = nodes.length > 0 
    ? nodes[nodes.length - 1].y + NODE_SIZE + LABEL_HEIGHT + 100
    : height;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { minHeight: estimatedContentHeight }]}
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
        {/* Learning Path - Continuous flow */}
        <View style={[styles.pathContainer, { minHeight: estimatedContentHeight }]}>
          {/* Single SVG for all connection paths */}
          <Svg
            style={styles.pathSvg}
            width={width}
            height={estimatedContentHeight}
          >
            {nodes.map((node, nodeIndex) => {
              const isLast = nodeIndex === nodes.length - 1;
              const nextNode = nodes[nodeIndex + 1];
              
              if (isLast || !nextNode) return null;
              
              // Calculate start and end points (center of nodes)
              const startX = node.x + NODE_SIZE / 2;
              const startY = node.y + NODE_SIZE + LABEL_HEIGHT;
              const endX = nextNode.x + NODE_SIZE / 2;
              const endY = nextNode.y;
              
              // Calculate distance and direction
              const deltaX = endX - startX;
              const deltaY = endY - startY;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              
              // Create smooth bezier curve with control points
              // Control points positioned to create a natural flowing curve
              const curveStrength = Math.min(distance * 0.4, CURVE_CONTROL_OFFSET);
              const controlX1 = startX + (deltaX * 0.3);
              const controlY1 = startY + curveStrength;
              const controlX2 = endX - (deltaX * 0.3);
              const controlY2 = endY - curveStrength;
              
              // Smooth cubic bezier curve
              const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
              
              return (
                <Path
                  key={`path-${node.lesson.id}`}
                  d={pathData}
                  stroke={node.completed ? theme.tint : theme.tint}
                  strokeWidth={PATH_WIDTH}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.6}
                />
              );
            })}
          </Svg>
          
          {/* Lesson Nodes */}
          {nodes.map((node, nodeIndex) => {
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

                {/* Lesson Node */}
                <View style={[styles.lessonNodeWrapper, { left: node.x, top: node.y }]}>
                  <TouchableOpacity
                    style={[
                      styles.lessonNode,
                      {
                        backgroundColor: node.completed
                          ? theme.tint
                          : node.isCheckpoint || node.isSpecial
                          ? "#FFD700"
                          : theme.tint,
                        borderColor: nodeColor,
                        borderWidth: 0,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                    ]}
                    onPress={() => {
                      if (onLessonPress) {
                        onLessonPress(node.lesson);
                      }
                    }}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={32}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                  {/* Progress Stars (for completed lessons) */}
                  {node.completed && (
                    <View style={styles.starsContainer}>
                      {[1, 2, 3].map((star) => (
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
                  <View style={styles.lessonLabelContainer}>
                    <ThemedText 
                      style={[
                        styles.lessonLabel,
                        { color: theme.text },
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      adjustsFontSizeToFit={false}
                    >
                      {node.lesson.title || node.lesson.learning_objective || 'Lesson'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <View style={[styles.loadingMoreContainer, { top: currentContentHeight }]}>
              <ActivityIndicator size="small" color={theme.tint} />
              <ThemedText style={[styles.loadingMoreText, { color: theme.icon }]}>
                Loading more lessons...
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  pathContainer: {
    position: "relative",
    paddingTop: 20,
    paddingBottom: 40,
  },
  pathSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },
  nodeContainer: {
    position: "absolute",
    zIndex: 1,
  },
  lessonNodeWrapper: {
    position: "absolute",
    alignItems: "center",
    zIndex: 1,
  },
  lessonNode: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonLabelContainer: {
    marginTop: 4,
    width: 120,
    alignItems: "center",
  },
  lessonLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },
  lessonLabelLocked: {
    opacity: 0.5,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
    alignSelf: "center",
  },
  star: {
    marginHorizontal: 1,
  },
  loadingMoreContainer: {
    position: "absolute",
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    marginLeft: 8,
  },
});
