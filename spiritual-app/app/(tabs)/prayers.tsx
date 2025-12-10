import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import GuruGranthSahibReader from "@/components/guru-granth-sahib-reader";
import PrayerList from "@/components/prayer-list";

const { width } = Dimensions.get("window");

export default function Prayers() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [showGuruGranthSahib, setShowGuruGranthSahib] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Prayers
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
            Read sacred texts and prayers
          </ThemedText>
        </View>

        {/* Guru Granth Sahib Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowGuruGranthSahib(true)}
          style={styles.guruGranthSahibCard}
        >
          <LinearGradient
            colors={["#7C3AED", "#5B21B6"]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.gradientCard}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="book" size={32} color="#fff" />
              </View>
              <View style={styles.cardTextContainer}>
                <ThemedText style={styles.cardTitle}>
                  Guru Granth Sahib Ji
                </ThemedText>
                <ThemedText style={styles.cardTitlePunjabi}>
                  ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Read page by page with meanings
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.icon + "30" }]}
          />
          <ThemedText
            style={[styles.sectionTitle, { color: theme.icon }]}
            type="subtitle"
          >
            Daily Prayers
          </ThemedText>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.icon + "30" }]}
          />
        </View>

        {/* Prayer List */}
        <View style={styles.prayerListContainer}>
          <PrayerList />
        </View>
      </ScrollView>

      {/* Guru Granth Sahib Reader Modal */}
      <GuruGranthSahibReader
        visible={showGuruGranthSahib}
        onClose={() => setShowGuruGranthSahib(false)}
      />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16
  },
  guruGranthSahibCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  cardTextContainer: {
    flex: 1
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4
  },
  cardTitlePunjabi: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4
  },
  cardSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  sectionTitle: {
    marginHorizontal: 12,
    fontSize: 18
  },
  prayerListContainer: {
    minHeight: 400
  }
});
