import React from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // Sample data - replace with your context or API
  const username = "Alex";
  const streakDays = 7;
  const xp = 450;
  const progress = 0.65;

  const quickCards = [
    {
      id: "lessons",
      title: "Lessons",
      subtitle: "Continue learning",
      icon: <IconSymbol name="book.fill" size={18} color={theme.tint} />
    },
    {
      id: "routines",
      title: "Routines",
      subtitle: "Build habits",
      icon: <IconSymbol name="calendar" size={18} color={theme.tint} />
    },
    {
      id: "prayers",
      title: "Prayers",
      subtitle: "Sacred verses",
      icon: <IconSymbol name="heart.fill" size={18} color={theme.tint} />
    },
    {
      id: "ai",
      title: "AI Guide",
      subtitle: "Ask questions",
      icon: <IconSymbol name="sparkles" size={18} color={theme.tint} />
    }
  ];

  const recommended = [
    { id: "r1", title: "Morning Gratitude", detail: "5 min · Daily routine" },
    { id: "r2", title: "Breathing Focus", detail: "3 min · Calming" },
    { id: "r3", title: "Evening Reflection", detail: "7 min · Reflection" }
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.headerRow}>
        <ThemedText type="title">Good morning</ThemedText>
        <ThemedText type="title" style={styles.nameText}>
          {username}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.subtitleWrap}>
        <ThemedText type="default">
          Continue your spiritual journey today
        </ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Streak Card */}
      <TouchableOpacity activeOpacity={0.95} style={styles.cardContainer}>
        <LinearGradient
          colors={["#7C3AED", "#5B21B6"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.streakCard}
        >
          <View style={styles.cardTop}>
            <View>
              <ThemedText type="subtitle" style={styles.cardSub}>
                Current Streak
              </ThemedText>
              <ThemedText type="title" style={styles.streakNumber}>
                {streakDays} Days
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.xpText}>
              Total XP{"\n"}
              <ThemedText type="title">{xp}</ThemedText>
            </ThemedText>
          </View>

          <View style={styles.cardMiddle}>
            <View style={styles.progressWrap}>
              <Progress.Circle
                size={84}
                progress={progress}
                showsText
                formatText={() => `${Math.round(progress * 100)}%`}
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
                style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}
              >
                Keep going! You're doing great
              </ThemedText>
            </View>
          </View>

          <View style={styles.cardBottom}>
            <ThemedText
              type="subtitle"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Continue Your Journey
            </ThemedText>
            <ThemedText
              style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}
            >
              Lesson 12: Finding Inner Peace
            </ThemedText>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Access */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="title">Quick Access</ThemedText>
      </ThemedView>

      <View style={styles.quickGrid}>
        {quickCards.map((c) => (
          <Link
            key={c.id}
            href={`/${c.id}`}
            style={{ width: (width - 56) / 2 }}
          >
            <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
              <View style={styles.iconCircle}>{c.icon}</View>
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={styles.quickTitle}>
                  {c.title}
                </ThemedText>
                <ThemedText style={styles.quickSubtitle}>
                  {c.subtitle}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Recommended */}
      <ThemedView style={[styles.sectionHeader, { marginTop: 12 }]}>
        <ThemedText type="title">Recommended for You</ThemedText>
      </ThemedView>

      <View style={styles.recommendList}>
        {recommended.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.recItem}
            activeOpacity={0.9}
          >
            <View style={styles.recLeft}>
              <View style={styles.appIcon}>
                <Ionicons name="sunny" size={20} color="#fff" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <ThemedText type="subtitle">{r.title}</ThemedText>
                <ThemedText style={styles.recDetail}>{r.detail}</ThemedText>
              </View>
            </View>
            <View>
              <ThemedText style={{ color: theme.tint, fontWeight: "700" }}>
                Start
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8
  },
  nameText: {
    marginLeft: 8,
    fontSize: 32,
    fontWeight: "800"
  },
  subtitleWrap: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  cardContainer: {
    paddingHorizontal: 16,
    marginTop: 8
  },
  streakCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardSub: { color: "rgba(255,255,255,0.9)" },
  streakNumber: { marginTop: 6, color: "#fff", fontWeight: "800" },
  xpText: { textAlign: "right", color: "rgba(255,255,255,0.95)" },

  cardMiddle: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  progressWrap: { width: 100, alignItems: "center", justifyContent: "center" },
  goalText: { marginLeft: 12, flex: 1 },

  cardBottom: { marginTop: 12 },

  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 18
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8
  },
  quickCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  quickTitle: { fontWeight: "700", fontSize: 16 },
  quickSubtitle: { color: "#6b7280", marginTop: 4 },

  recommendList: {
    paddingHorizontal: 16,
    marginTop: 6
  },
  recItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1
  },
  recLeft: { flexDirection: "row", alignItems: "center" },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center"
  },
  recDetail: { color: "#6b7280", marginTop: 4 },

  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute"
  }
});
