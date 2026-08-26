import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { authClient } from '@/lib/auth-client';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function SignIn() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const { error: signInError } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (signInError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(signInError.message ?? 'Could not sign in');
    }
  }

  return (
    <Screen padded>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={[styles.logoDot, { backgroundColor: theme.primary }]} />
        <ThemedText variant="display">MediTime</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          Never miss a dose. Welcome back.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={{ gap: Spacing.md }}>
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        {error ? (
          <ThemedText variant="caption" color="danger">
            {error}
          </ThemedText>
        ) : null}
        <Button label="Sign in" onPress={onSubmit} loading={loading} disabled={!email || !password} />
      </Animated.View>

      <View style={styles.footer}>
        <ThemedText variant="body" color="textSecondary">
          New to MediTime?
        </ThemedText>
        <Link href="/(auth)/sign-up">
          <ThemedText variant="body" color="primary" style={{ fontWeight: '700' }}>
            Create an account
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'flex-start', gap: Spacing.xs, marginTop: Spacing.xxl, marginBottom: Spacing.lg },
  logoDot: { width: 14, height: 14, borderRadius: 7, marginBottom: Spacing.sm },
  footer: { flexDirection: 'row', gap: Spacing.xs, justifyContent: 'center', marginTop: Spacing.lg },
});
