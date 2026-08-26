import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/pressable-scale';
import { authClient } from '@/lib/auth-client';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export function GoogleSignInButton({ onError }: { onError: (message: string) => void }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  async function onPress() {
    setLoading(true);
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
    setLoading(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      onError(error.message ?? 'Could not sign in with Google');
    }
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={loading}
      style={[styles.button, { borderColor: theme.border, backgroundColor: theme.card }]}
    >
      {loading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={theme.text} />
          <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>
            Continue with Google
          </ThemedText>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
