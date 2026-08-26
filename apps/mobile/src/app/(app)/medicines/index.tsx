import { FlatList, RefreshControl, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Medicine } from '@meditime/shared';
import { ThemedText } from '@/components/themed-text';
import { MedicineCard } from '@/components/medicine-card';
import { SkeletonList } from '@/components/ui/skeleton';
import { PressableScale } from '@/components/ui/pressable-scale';
import { useMedicines } from '@/hooks/use-medicines';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

export default function MedicinesList() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: medicines, isLoading, isFetching, refetch } = useMedicines();

  if (isLoading) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background, padding: Spacing.lg }]}>
        <SkeletonList count={4} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList<Medicine>
        data={medicines}
        keyExtractor={(m) => m.id}
        renderItem={({ item, index }) => (
          <MedicineCard medicine={item} index={index} onPress={() => router.push(`/(app)/medicines/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="bodyLarge" style={{ textAlign: 'center' }}>
              No medicines yet. Tap + to add one.
            </ThemedText>
          </View>
        }
      />

      <PressableScale
        onPress={() => router.push('/(app)/medicines/new')}
        style={[styles.fab, { backgroundColor: theme.primary, bottom: insets.bottom + Spacing.lg }]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl, flexGrow: 1 },
  empty: { marginTop: Spacing.xl, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
