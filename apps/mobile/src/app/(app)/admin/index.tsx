import { View, StyleSheet, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Card } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/use-admin-stats';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function AdminDashboard() {
  const theme = useTheme();
  const { data, isLoading, isFetching, refetch } = useAdminStats();
  const stats = data?.stats;

  return (
    <Screen refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
      <ThemedText variant="heading">Overview</ThemedText>

      {isLoading || !stats ? (
        <SkeletonList count={5} />
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(0)} style={styles.grid}>
            <StatTile label="Total users" value={String(stats.totalUsers)} />
            <StatTile label="New this week" value={String(stats.newUsersLast7Days)} accent={theme.accent} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(50)} style={styles.grid}>
            <StatTile label="Active medicines" value={String(stats.activeMedicines)} />
            <StatTile label="Total medicines" value={String(stats.totalMedicines)} accent={theme.accent} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.grid}>
            <StatTile label="Doses logged" value={String(stats.totalDosesLogged)} />
            <StatTile
              label="Overall adherence"
              value={`${Math.round(stats.adherenceRate * 100)}%`}
              accent={theme.accent}
            />
          </Animated.View>

          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <ThemedText variant="title">Recently joined</ThemedText>
            {data?.recentUsers.map((u, index) => (
              <Animated.View key={u.id} entering={FadeInDown.delay(index * 40)}>
                <Card style={styles.userRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body">{u.name}</ThemedText>
                    <ThemedText variant="caption" color="textSecondary">
                      {u.email}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" color="textMuted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </ThemedText>
                </Card>
              </Animated.View>
            ))}
          </View>

          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            <Button label="Manage users" variant="secondary" onPress={() => router.push('/(app)/admin/users')} />
            <Button
              label="Manage default sounds"
              variant="secondary"
              onPress={() => router.push('/(app)/admin/sounds')}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: Spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
