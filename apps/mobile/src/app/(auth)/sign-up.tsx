import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { OrDivider } from '@/components/ui/or-divider';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { authClient } from '@/lib/auth-client';
import { Spacing } from '@/constants/theme';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (signUpError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(signUpError.message ?? 'Could not create account');
      return;
    }
    router.replace('/');
  }

  return (
    <Screen padded>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <ThemedText variant="heading">Create your account</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          Set it up once, MediTime handles the rest.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={{ gap: Spacing.md }}>
        <TextField label="Name" autoComplete="name" value={name} onChangeText={setName} placeholder="Jane Doe" />
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
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
        />
        {error ? (
          <ThemedText variant="caption" color="danger">
            {error}
          </ThemedText>
        ) : null}
        <Button
          label="Create account"
          onPress={onSubmit}
          loading={loading}
          disabled={!email || !password || !name}
        />

        <OrDivider />

        <GoogleSignInButton onError={setError} />
      </Animated.View>

      <View style={styles.footer}>
        <ThemedText variant="body" color="textSecondary">
          Already have an account?
        </ThemedText>
        <Link href="/(auth)/sign-in">
          <ThemedText variant="body" color="primary" style={{ fontWeight: '700' }}>
            Sign in
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.xs, marginTop: Spacing.xxl, marginBottom: Spacing.lg },
  footer: { flexDirection: 'row', gap: Spacing.xs, justifyContent: 'center', marginTop: Spacing.lg },
});
