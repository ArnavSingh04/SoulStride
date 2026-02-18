import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        animation: "fade",
        tabBarStyle: {
          height: 85,
          paddingBottom: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colorScheme === "dark" ? "#333" : "#e0e0e0"
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          )
        }}
      />
      {/* JOURNEY */}
      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="book.fill" color={color} />
          )
        }}
      />

      {/* ROUTINE */}
      <Tabs.Screen
        name="routine"
        options={{
          title: "Routine",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="calendar" color={color} />
          )
        }}
      />

      {/* PRAYERS */}
      <Tabs.Screen
        name="prayers"
        options={{
          title: "Prayers",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="heart.fill" color={color} />
          )
        }}
      />

      {/* GUIDE - left of Settings */}
      <Tabs.Screen
        name="guide"
        options={{
          title: "Guide",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          )
        }}
      />

      {/* SETTINGS - rightmost */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          )
        }}
      />
    </Tabs>
  );
}
