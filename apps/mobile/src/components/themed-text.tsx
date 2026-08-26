import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSize, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  variant?: 'body' | 'bodyLarge' | 'caption' | 'title' | 'heading' | 'display' | 'label';
  color?: ThemeColor;
};

export function ThemedText({ style, variant = 'body', color, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[{ color: theme[color ?? 'text'] }, styles[variant], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  body: { fontSize: FontSize.body, lineHeight: 22, fontWeight: '400' },
  bodyLarge: { fontSize: FontSize.bodyLarge, lineHeight: 25, fontWeight: '500' },
  caption: { fontSize: FontSize.caption, lineHeight: 18, fontWeight: '500' },
  label: { fontSize: FontSize.caption, lineHeight: 16, fontWeight: '600', letterSpacing: 0.3 },
  title: { fontSize: FontSize.title, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: FontSize.heading, lineHeight: 34, fontWeight: '700' },
  display: { fontSize: FontSize.display, lineHeight: 40, fontWeight: '700' },
});
