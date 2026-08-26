import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { authClient, useSession } from '@/lib/auth-client';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
}

export default function ManageUsers() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await authClient.admin.listUsers({
      query: search
        ? { searchValue: search, searchField: 'email', limit: 50 }
        : { limit: 50, sortBy: 'createdAt', sortDirection: 'desc' },
    });
    setUsers((data?.users as AdminUser[]) ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleAdmin(user: AdminUser) {
    setBusyId(user.id);
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    await authClient.admin.setRole({ userId: user.id, role: nextRole });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await load();
    setBusyId(null);
  }

  function toggleBan(user: AdminUser) {
    const action = user.banned ? 'Unban' : 'Ban';
    Alert.alert(`${action} ${user.name}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action,
        style: user.banned ? 'default' : 'destructive',
        onPress: async () => {
          setBusyId(user.id);
          if (user.banned) {
            await authClient.admin.unbanUser({ userId: user.id });
          } else {
            await authClient.admin.banUser({ userId: user.id });
          }
          await load();
          setBusyId(null);
        },
      },
    ]);
  }

  const showSkeleton = loading && users.length === 0;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.md }}>
            <TextField
              label="Search by email"
              value={search}
              onChangeText={setSearch}
              placeholder="name@example.com"
              autoCapitalize="none"
            />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          showSkeleton ? (
            <SkeletonList count={4} />
          ) : (
            <ThemedText color="textSecondary" style={{ marginTop: Spacing.lg }}>
              No users found.
            </ThemedText>
          )
        }
        renderItem={({ item: user, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30)}>
            <Card style={{ gap: Spacing.sm }}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body">{user.name}</ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {user.email}
                  </ThemedText>
                </View>
                {user.role === 'admin' && (
                  <ThemedText variant="caption" color="primary" style={{ fontWeight: '700' }}>
                    ADMIN
                  </ThemedText>
                )}
                {user.banned && (
                  <ThemedText variant="caption" color="danger" style={{ fontWeight: '700' }}>
                    BANNED
                  </ThemedText>
                )}
              </View>
              <View style={styles.actions}>
                <Button
                  label={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                  variant="secondary"
                  fullWidth={false}
                  disabled={user.id === session?.user?.id}
                  loading={busyId === user.id}
                  onPress={() => toggleAdmin(user)}
                />
                <Button
                  label={user.banned ? 'Unban' : 'Ban'}
                  variant={user.banned ? 'secondary' : 'danger'}
                  fullWidth={false}
                  disabled={user.id === session?.user?.id}
                  loading={busyId === user.id}
                  onPress={() => toggleBan(user)}
                />
              </View>
            </Card>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl, flexGrow: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm },
});
