// app/(tabs)/journey.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Journey() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          Learning Journey
        </ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
          Structured lessons to deepen your understanding
        </ThemedText>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={theme.icon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Learning Journey Coming Soon
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            Structured lessons like Duolingo to help you learn and understand your selected holy book.
          </ThemedText>
          
          <View style={styles.featuresContainer}>
            <ThemedText type="subtitle" style={styles.featuresTitle}>
              Planned Features:
            </ThemedText>
            {[
              "Progressive lesson structure",
              "Interactive quizzes and exercises",
              "Track your learning progress",
              "Earn XP and unlock new lessons",
              "Personalized learning path"
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={theme.tint} />
                <ThemedText style={[styles.featureText, { color: theme.icon }]}>
                  {feature}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: 20
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24
  },
  featuresContainer: {
    width: "100%",
    marginTop: 16
  },
  featuresTitle: {
    fontSize: 18,
    marginBottom: 16
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 4
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1
  }
});
