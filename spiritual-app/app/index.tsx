import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isOnboardingComplete } from '@/services/user-profile';

export default function Index() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const completed = await isOnboardingComplete();
      setDone(completed);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={{ marginTop: 12, color: theme.icon }}>
            Preparing your experience...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // If not onboarded, show Welcome (sign in/up or skip)
  return <Redirect href={done ? '/(tabs)' : '/welcome'} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

