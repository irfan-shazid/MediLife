import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideToast } from '@/store/uiSlice';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

const DISPLAY_MS = 2200;

export function ToastHost() {
  const toast = useAppSelector((s) => s.ui.toast);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(hideToast()), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const isError = toast.tone === 'error';

  return (
    <Animated.View
      key={toast.id}
      entering={FadeInUp.springify().damping(16)}
      exiting={FadeOutUp.duration(150)}
      style={[
        styles.toast,
        { top: insets.top + Spacing.sm, backgroundColor: isError ? theme.danger : theme.text },
      ]}
      pointerEvents="none"
    >
      <Ionicons
        name={isError ? 'alert-circle' : 'checkmark-circle'}
        size={18}
        color={theme.background}
      />
      <ThemedText
        variant="caption"
        style={{ color: theme.background, fontWeight: '600', flexShrink: 1 }}
      >
        {toast.message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
