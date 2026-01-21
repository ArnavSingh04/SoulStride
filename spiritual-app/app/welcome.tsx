import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setOnboardingComplete } from '@/services/user-profile';

export default function Welcome() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [busy, setBusy] = useState(false);

  const skip = async () => {
    setBusy(true);
    try {
      await setOnboardingComplete(true);
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to SoulStride
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Sign in to sync your progress, or continue as a guest.
        </ThemedText>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : theme.tint }]}
          onPress={() => router.push('/auth/login')}
          disabled={busy}
        >
          <ThemedText style={styles.primaryButtonText}>Sign In</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.tint }]}
          onPress={() => router.push('/auth/signup')}
          disabled={busy}
        >
          <ThemedText style={[styles.secondaryButtonText, { color: theme.tint }]}>Sign Up</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0' }]}
          onPress={() => router.replace('/onboarding')}
          disabled={busy}
        >
          <ThemedText style={{ color: theme.text, fontWeight: '600' }}>Continue Setup</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            Alert.alert(
              'Skip setup?',
              'You can set your holy book and preferences later in Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip', style: 'destructive', onPress: skip },
              ]
            );
          }}
          disabled={busy}
        >
          <ThemedText style={[styles.linkText, { color: theme.icon }]}>Skip for now</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 30, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 22, textAlign: 'center' },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  secondaryButtonText: { fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 13 },
});

