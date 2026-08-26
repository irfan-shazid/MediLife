import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { PressableScale, type PressableScaleProps } from '@/components/ui/pressable-scale';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const backgrounds: Record<Variant, string> = {
    primary: theme.primary,
    secondary: theme.primaryMuted,
    ghost: 'transparent',
    danger: theme.dangerMuted,
  };
  const textColors: Record<Variant, string> = {
    primary: '#FFFFFF',
    secondary: theme.primary,
    ghost: theme.primary,
    danger: theme.danger,
  };

  return (
    <PressableScale
      disabled={disabled || loading}
      haptic={variant !== 'danger'}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        { backgroundColor: backgrounds[variant], opacity: disabled ? 0.5 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.border },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <ThemedText variant="bodyLarge" style={{ color: textColors[variant], fontWeight: '600' }}>
          {label}
        </ThemedText>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
