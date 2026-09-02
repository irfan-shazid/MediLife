import { useMemo } from 'react';
import { SectionList, View, StyleSheet, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { MedicineLog } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { SkeletonList } from '@/components/ui/skeleton';
import { MedicineIconGlyph } from '@/components/medicine-icon';
import { useMedicines } from '@/hooks/use-medicines';
import { useLogs } from '@/hooks/use-logs';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function groupByDay(logs: MedicineLog[]) {
  const groups = new Map<string, MedicineLog[]>();
  for (const log of logs) {
    const key = new Date(log.scheduledFor).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }
  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function History() {
  const theme = useTheme();
  const medicinesQuery = useMedicines();
  const logsQuery = useLogs(daysAgoISO(30));

  const medicineById = useMemo(
    () => new Map((medicinesQuery.data ?? []).map((m) => [m.id, m])),
    [medicinesQuery.data],
  );

  const logs = logsQuery.data ?? [];
  const taken = logs.filter((l) => l.status === 'taken').length;
  const adherence = logs.length > 0 ? Math.round((taken / logs.length) * 100) : 0;

  const sections = useMemo(() => groupByDay(logs), [logs]);
  const initialLoading = medicinesQuery.isLoading || logsQuery.isLoading;

  const header = (
    <View style={{ gap: Spacing.md, marginBottom: Spacing.sm }}>
      <ThemedText variant="heading">History</ThemedText>
      <View style={styles.stats}>
        <StatTile label="30-day adherence" value={`${adherence}%`} />
        <StatTile label="Doses logged" value={String(logs.length)} accent={theme.accent} />
      </View>
    </View>
  );

  if (initialLoading) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        {header}
        <SkeletonList count={4} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={medicinesQuery.isFetching || logsQuery.isFetching}
            onRefresh={() => {
              medicinesQuery.refetch();
              logsQuery.refetch();
            }}
          />
        }
        ListHeaderComponent={header}
        ListEmptyComponent={
          <ThemedText color="textSecondary" style={{ marginTop: Spacing.lg }}>
            No doses logged yet — they'll show up here once you start marking medicines taken.
          </ThemedText>
        }
        renderSectionHeader={({ section }) => (
          <ThemedText variant="label" color="textMuted" style={styles.sectionHeader}>
            {section.title.toUpperCase()}
          </ThemedText>
        )}
        renderItem={({ item: log, index }) => {
          const medicine = medicineById.get(log.medicineId);
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30)}>
              <Card style={styles.row}>
                {medicine && (
                  <View style={[styles.iconBubble, { backgroundColor: `${medicine.color}22` }]}>
                    <MedicineIconGlyph icon={medicine.icon} color={medicine.color} size={18} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body">{medicine?.name ?? 'Medicine'}</ThemedText>
                  <ThemedText variant="caption" color="textMuted">
                    {new Date(log.scheduledFor).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </ThemedText>
                </View>
                <Ionicons
                  name={
                    log.status === 'taken'
                      ? 'checkmark-circle'
                      : log.status === 'skipped'
                        ? 'close-circle'
                        : 'alert-circle'
                  }
                  size={22}
                  color={
                    log.status === 'taken'
                      ? theme.success
                      : log.status === 'skipped'
                        ? theme.textMuted
                        : theme.danger
                  }
                />
              </Card>
            </Animated.View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        SectionSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl, flexGrow: 1 },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  sectionHeader: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
