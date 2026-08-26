import { useMemo } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { DoseRow } from '@/components/dose-row';
import { useMedicines } from '@/hooks/use-medicines';
import { useCreateLog, useLogs } from '@/hooks/use-logs';
import { useSession } from '@/lib/auth-client';
import { todaysDoses } from '@/lib/schedule';
import { Spacing } from '@/constants/theme';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function Today() {
  const { data: session } = useSession();
  const medicinesQuery = useMedicines();
  const logsQuery = useLogs(startOfToday());
  const createLog = useCreateLog();

  const doses = useMemo(
    () => todaysDoses(medicinesQuery.data ?? [], logsQuery.data ?? []),
    [medicinesQuery.data, logsQuery.data],
  );

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const remaining = doses.filter((d) => d.status === 'due' || d.status === 'upcoming').length;
  const initialLoading = medicinesQuery.isLoading || logsQuery.isLoading;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={!initialLoading && (medicinesQuery.isFetching || logsQuery.isFetching)}
          onRefresh={() => {
            medicinesQuery.refetch();
            logsQuery.refetch();
          }}
        />
      }
    >
      <View style={styles.header}>
        <ThemedText variant="heading">Hi {firstName} 👋</ThemedText>
        <ThemedText variant="body" color="textSecondary">
          {initialLoading
            ? 'Loading your schedule…'
            : doses.length === 0
              ? 'Nothing scheduled for today.'
              : remaining === 0
                ? "You're all caught up for today."
                : `${remaining} dose${remaining === 1 ? '' : 's'} left today.`}
        </ThemedText>
      </View>

      {initialLoading ? (
        <SkeletonList count={3} />
      ) : medicinesQuery.data?.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText variant="bodyLarge" style={{ textAlign: 'center' }}>
            Add your first medicine to start getting reminders.
          </ThemedText>
          <Button label="Add a medicine" onPress={() => router.push('/(app)/medicines/new')} />
        </View>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {doses.map((dose, index) => (
            <DoseRow
              key={`${dose.medicine.id}-${dose.time}`}
              dose={dose}
              index={index}
              busy={createLog.isPending}
              onTake={() =>
                createLog.mutate({
                  medicineId: dose.medicine.id,
                  scheduledFor: dose.scheduledFor,
                  status: 'taken',
                })
              }
              onSkip={() =>
                createLog.mutate({
                  medicineId: dose.medicine.id,
                  scheduledFor: dose.scheduledFor,
                  status: 'skipped',
                })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.sm, marginBottom: Spacing.sm, gap: Spacing.xs },
  empty: { alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.xl },
});
