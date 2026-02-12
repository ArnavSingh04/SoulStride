import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { loadUserProfile } from "@/services/user-profile";
import { loadPrayerPreferences } from "@/services/prayer-preferences";
import { getLessonProgressUserId } from "@/services/lesson-progress-user";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadRoutineConfig,
  getTodayStats,
  getTodayDate,
  loadTodayCompletion,
  getRoutineStreak
} from "@/services/routine-storage";
import { loadProgress } from "@/services/progress";
import { getAllPrayers, getPrayerById } from "@/data/prayers";
import type { PrayerWithLines } from "@/data/prayers";
import { getNextLessonForUser } from "@/lib/database.service";
import type { LessonWithBlocks } from "@/lib/database.types";
import { TIME_SLOT_LABELS } from "@/types/routine";
import type { TimeSlot } from "@/types/routine";

const { width } = Dimensions.get("window");

// Relevant images for cards (cached by expo-image)
const CARD_IMAGES = {
  nextLesson:
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=224&h=224&fit=crop",
  guide:
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=224&h=224&fit=crop",
  journey:
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=144&h=144&fit=crop",
  routine:
    "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=144&h=144&fit=crop",
  prayers:
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=144&h=144&fit=crop",
  guideQuick:
    "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=144&h=144&fit=crop"
};

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Get motivational message based on progress
function getMotivationalMessage(progress: number): string {
  if (progress >= 100) return "Perfect! You've completed your daily goal! 🌟";
  if (progress >= 75) return "Almost there! Keep up the great work! 💪";
  if (progress >= 50) return "You're halfway there! Keep going! ✨";
  if (progress >= 25) return "Great start! Every step counts! 🙏";
  return "Begin your spiritual journey today! 🌱";
}

// Get next prayer in routine
async function getNextPrayer(): Promise<{
  prayer: PrayerWithLines;
  timeSlot: TimeSlot;
} | null> {
  try {
    const config = await loadRoutineConfig();
    if (!config) return null;

    const completion = await loadTodayCompletion();
    const today = getTodayDate();

    if (completion.date !== today) return null;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const timeSlots: TimeSlot[] = [
      "amrit-vayla",
      "morning",
      "evening",
      "night"
    ];

    for (const slot of timeSlots) {
      const slotConfig = config.slots.find((s) => s.timeSlot === slot);
      if (!slotConfig || slotConfig.prayerIds.length === 0) continue;

      const slotTime = TIME_SLOT_LABELS[slot].defaultTime;
      const slotHour = slotTime.hour;
      const slotMinute = slotTime.minute;

      if (
        slotHour > currentHour ||
        (slotHour === currentHour && slotMinute > currentMinute)
      ) {
        for (const prayerId of slotConfig.prayerIds) {
          if (!completion.completedPrayers[prayerId]) {
            const prayer = await getPrayerById(prayerId);
            if (prayer) {
              return { prayer, timeSlot: slot };
            }
          }
        }
      }
    }

    for (const slot of timeSlots) {
      const slotConfig = config.slots.find((s) => s.timeSlot === slot);
      if (!slotConfig) continue;

      for (const prayerId of slotConfig.prayerIds) {
        if (!completion.completedPrayers[prayerId]) {
          const prayer = await getPrayerById(prayerId);
          if (prayer) {
            return { prayer, timeSlot: slot };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting next prayer:", error);
    return null;
  }
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [routineStreakDays, setRoutineStreakDays] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [routineProgress, setRoutineProgress] = useState<number>(0);
  const [routineStats, setRoutineStats] = useState({ completed: 0, total: 0 });
  const [nextPrayer, setNextPrayer] = useState<{
    prayer: PrayerWithLines;
    timeSlot: TimeSlot;
  } | null>(null);
  const [nextLesson, setNextLesson] = useState<LessonWithBlocks | null>(null);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadHomeData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [profile, config, progressData, prefs] = await Promise.all([
        loadUserProfile(),
        loadRoutineConfig(),
        loadProgress(),
        loadPrayerPreferences()
      ]);

      setUsername(profile.name || "Friend");
      setXp(progressData.xp);
      setStreakDays(progressData.streakDays);

      if (config) {
        const [stats, nextPrayerResult, routineStreak] = await Promise.all([
          getTodayStats(config),
          getNextPrayer(),
          getRoutineStreak(config)
        ]);
        setRoutineStats(stats);
        const progress = stats.total > 0 ? stats.completed / stats.total : 0;
        setRoutineProgress(progress);
        setNextPrayer(nextPrayerResult);
        setRoutineStreakDays(routineStreak);
      } else {
        setRoutineStreakDays(0);
      }

      const holyBookId = prefs?.selectedHolyBookIds?.[0];
      if (holyBookId) {
        const userId = await getLessonProgressUserId(user?.id ?? null);
        const lesson = await getNextLessonForUser(userId, holyBookId);
        setNextLesson(lesson);
      } else {
        setNextLesson(null);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickCards = [
    {
      id: "journey",
      title: "Journey",
      subtitle: "Continue learning",
      imageUri: CARD_IMAGES.journey,
      route: "/(tabs)/journey"
    },
    {
      id: "routine",
      title: "Routine",
      subtitle: "Build habits",
      imageUri: CARD_IMAGES.routine,
      route: "/(tabs)/routine"
    },
    {
      id: "prayers",
      title: "Prayers",
      subtitle: "Sacred verses",
      imageUri: CARD_IMAGES.prayers,
      route: "/(tabs)/prayers"
    },
    {
      id: "guide",
      title: "Guide",
      subtitle: "Ask questions",
      imageUri: CARD_IMAGES.guideQuick,
      route: "/(tabs)/guide"
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Greeting */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          {loading && (
            <View style={styles.headerLoadingBar}>
              <ActivityIndicator size="small" color={theme.tint} />
            </View>
          )}
          <View style={styles.greetingContainer}>
            <View style={styles.greetingIconContainer}>
              <Ionicons
                name={
                  new Date().getHours() < 12
                    ? "sunny"
                    : new Date().getHours() < 17
                    ? "partly-sunny"
                    : "moon"
                }
                size={32}
                color={theme.tint}
              />
            </View>
            <View style={styles.greetingTextContainer}>
              <ThemedText type="title" style={styles.greetingText}>
                {getGreeting()}
                {username ? `, ${username}` : ""}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
                Continue your spiritual journey today
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Your Progress Section - At Top */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Your Progress
            </ThemedText>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: theme.tint + "15" }
              ]}
            >
              <Ionicons name="trending-up" size={18} color={theme.tint} />
            </View>
          </View>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.statCard,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff",
                  borderLeftWidth: 4,
                  borderLeftColor: theme.tint
                }
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.tint + "15" }
                ]}
              >
                <Ionicons name="star" size={20} color={theme.tint} />
              </View>
              <ThemedText
                type="title"
                style={[styles.statValue, { color: theme.tint }]}
              >
                {xp}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.icon }]}>
                Total XP
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.statCard,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff",
                  borderLeftWidth: 4,
                  borderLeftColor: "#FF6B6B"
                }
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#FF6B6B15" }
                ]}
              >
                <Ionicons name="flame" size={20} color="#FF6B6B" />
              </View>
              <ThemedText
                type="title"
                style={[styles.statValue, { color: "#FF6B6B" }]}
              >
                {streakDays}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.icon }]}>
                Day Streak
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.statCard,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff",
                  borderLeftWidth: 4,
                  borderLeftColor: "#4ECDC4"
                }
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#4ECDC415" }
                ]}
              >
                <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              </View>
              <ThemedText
                type="title"
                style={[styles.statValue, { color: "#4ECDC4" }]}
              >
                {routineStats.completed}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.icon }]}>
                Today's Prayers
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Routine Progress Card */}
        {routineStats.total > 0 && (
          <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push("/(tabs)/routine")}
            >
              <LinearGradient
                colors={["#7C3AED", "#5B21B6", "#4C1D95"]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.streakCard}
              >
                <View style={styles.gradientPattern}>
                  <View style={styles.gradientCircle1} />
                  <View style={styles.gradientCircle2} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View>
                      <ThemedText type="subtitle" style={styles.cardSub}>
                        Today's Routine
                      </ThemedText>
                      <ThemedText type="title" style={styles.streakNumber}>
                        {routineStats.completed} / {routineStats.total}
                      </ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={styles.xpText}>
                      Current Streak{"\n"}
                      <ThemedText type="title">
                        {routineStreakDays} Days
                      </ThemedText>
                    </ThemedText>
                  </View>

                  <View style={styles.cardMiddle}>
                    <View style={styles.progressWrap}>
                      <Progress.Circle
                        size={84}
                        progress={routineProgress}
                        showsText
                        formatText={() =>
                          `${Math.round(routineProgress * 100)}%`
                        }
                        thickness={8}
                        borderWidth={0}
                        color={"#fff"}
                        unfilledColor={"rgba(255,255,255,0.15)"}
                      />
                    </View>

                    <View style={styles.goalText}>
                      <ThemedText
                        type="subtitle"
                        style={{ color: "rgba(255,255,255,0.95)" }}
                      >
                        Daily Goal Progress
                      </ThemedText>
                      <ThemedText
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          marginTop: 6,
                          fontSize: 13
                        }}
                      >
                        {getMotivationalMessage(routineProgress * 100)}
                      </ThemedText>
                    </View>
                  </View>

                  {nextPrayer && (
                    <View style={styles.cardBottom}>
                      <ThemedText
                        type="subtitle"
                        style={{ color: "rgba(255,255,255,0.95)" }}
                      >
                        Next Prayer
                      </ThemedText>
                      <ThemedText
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          marginTop: 6,
                          fontSize: 13
                        }}
                      >
                        {nextPrayer.prayer.name} (
                        {TIME_SLOT_LABELS[nextPrayer.timeSlot].name})
                      </ThemedText>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Next Lesson Card */}
        <Animated.View
          style={[styles.lessonCardContainer, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.lessonCard,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff",
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e5e5e5"
              }
            ]}
            onPress={() => {
              if (nextLesson) {
                router.push({
                  pathname: "/(tabs)/journey",
                  params: { openLessonId: nextLesson.id }
                });
              } else {
                router.push("/(tabs)/journey");
              }
            }}
          >
            <View style={styles.lessonHeader}>
              <Image
                source={{ uri: CARD_IMAGES.nextLesson }}
                style={styles.lessonImage}
                contentFit="cover"
              />
              <View style={styles.lessonContent}>
                <ThemedText type="subtitle" style={styles.lessonTitle}>
                  {nextLesson
                    ? nextLesson.title ||
                      nextLesson.learning_objective ||
                      (nextLesson.tags?.length
                        ? nextLesson.tags.slice(0, 2).join(", ")
                        : `Lesson ${nextLesson.order_index}`)
                    : "Your next lesson"}
                </ThemedText>
                <ThemedText
                  style={[styles.lessonSubtitle, { color: theme.icon }]}
                >
                  {nextLesson
                    ? `Lesson ${nextLesson.order_index} · ${
                        nextLesson.estimated_time_min ?? 10
                      } min`
                    : "Select a holy book in Settings to see your next lesson"}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.chevronContainer,
                  { backgroundColor: theme.tint + "10" }
                ]}
              >
                <Ionicons name="chevron-forward" size={18} color={theme.tint} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Ask Spiritual Guide - Search Bar */}
        <Animated.View
          style={[styles.guideCardContainer, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.guideCard,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff",
                borderWidth: 1,
                borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e5e5e5"
              }
            ]}
            onPress={() => router.push("/(tabs)/guide")}
          >
            <LinearGradient
              colors={[theme.tint + "08", "transparent"]}
              style={styles.guideGradient}
            >
              <View style={styles.guideHeader}>
                <Image
                  source={{ uri: CARD_IMAGES.guide }}
                  style={styles.guideImage}
                  contentFit="cover"
                />
                <View style={styles.guideContent}>
                  <ThemedText type="subtitle" style={styles.guideTitle}>
                    Ask Your Spiritual Guide
                  </ThemedText>
                  <ThemedText
                    style={[styles.guideSubtitle, { color: theme.icon }]}
                  >
                    Get guidance on life questions and spirituality
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.chevronContainer,
                    { backgroundColor: theme.tint + "10" }
                  ]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.tint}
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Access */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Quick Access
            </ThemedText>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: theme.tint + "15" }
              ]}
            >
              <Ionicons name="apps" size={18} color={theme.tint} />
            </View>
          </View>
          <View style={styles.quickGrid}>
            {quickCards.map((c, index) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.quickCard,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#fff",
                    borderWidth: 1,
                    borderColor: colorScheme === "dark" ? "#3a3a3a" : "#e5e5e5"
                  }
                ]}
                activeOpacity={0.85}
                onPress={() => router.push(c.route as any)}
              >
                <Image
                  source={{ uri: c.imageUri }}
                  style={styles.quickCardImage}
                  contentFit="cover"
                />
                <View style={styles.quickTextContainer}>
                  <ThemedText
                    type="subtitle"
                    style={styles.quickTitle}
                    numberOfLines={1}
                  >
                    {c.title}
                  </ThemedText>
                  <ThemedText
                    style={[styles.quickSubtitle, { color: theme.icon }]}
                    numberOfLines={1}
                  >
                    {c.subtitle}
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.icon}
                  style={{ opacity: 0.5, marginLeft: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16
  },
  loadingText: {
    fontSize: 16
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  headerLoadingBar: {
    position: "absolute",
    top: 44,
    right: 20,
    zIndex: 1
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  greetingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  greetingTextContainer: {
    flex: 1
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: -0.5
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600"
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  streakCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    position: "relative"
  },
  gradientPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden"
  },
  gradientCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  gradientCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  cardContent: {
    position: "relative",
    zIndex: 1
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  cardSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14
  },
  streakNumber: {
    marginTop: 4,
    color: "#fff",
    fontWeight: "800",
    fontSize: 24
  },
  xpText: {
    textAlign: "right",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14
  },
  cardMiddle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },
  progressWrap: {
    width: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  goalText: {
    marginLeft: 16,
    flex: 1
  },
  cardBottom: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)"
  },
  lessonCardContainer: {
    marginHorizontal: 20,
    marginBottom: 16
  },
  lessonCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  lessonImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  lessonContent: {
    flex: 1
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6
  },
  lessonSubtitle: {
    fontSize: 13
  },
  lessonProgress: {
    marginTop: 12
  },
  guideCardContainer: {
    marginHorizontal: 20,
    marginBottom: 24
  },
  guideCard: {
    borderRadius: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden"
  },
  guideGradient: {
    padding: 20
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  guideImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16
  },
  guideContent: {
    flex: 1
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  guideSubtitle: {
    fontSize: 13
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12
  },
  quickCard: {
    width: (width - 56) / 2,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  quickCardImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12
  },
  quickTextContainer: {
    flex: 1,
    minWidth: 0
  },
  quickTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
    letterSpacing: -0.2
  },
  quickSubtitle: {
    fontSize: 11,
    lineHeight: 14
  }
});
