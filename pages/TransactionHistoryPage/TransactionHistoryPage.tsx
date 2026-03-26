import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { formatPrice } from '@/constants/vipPackages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/store/hooks';
import { PaymentTransaction, PaymentTransactionStatus } from '@/store/slices/PaymentSlice/paymentSlice';

type FilterType = 'all' | PaymentTransactionStatus;
type SortType = 'newest' | 'oldest';

const STATUS_META: Record<PaymentTransactionStatus, { label: string; color: string }> = {
  pending: { label: 'Đang xử lý', color: '#F5A623' },
  success: { label: 'Thành công', color: '#2ECC71' },
  failed: { label: 'Thất bại', color: '#FF6B6B' },
  cancelled: { label: 'Đã hủy', color: '#A0A7B8' },
  timeout: { label: 'Quá thời gian', color: '#8E6CFF' },
};

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  basic: 'Premium',
  premium: 'Premium',
  vip: 'Premium',
};

const FILTER_OPTIONS: Array<{ key: FilterType; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'success', label: 'Thành công' },
  { key: 'failed', label: 'Thất bại' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'timeout', label: 'Timeout' },
];

const formatTransactionDate = (value: string) => {
  return new Date(value).toLocaleString('vi-VN');
};

const getPlanLabel = (plan: PaymentTransaction['plan']) => {
  return PLAN_LABEL[plan] ?? plan.toUpperCase();
};

export const TransactionHistoryPage: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isDark = colorScheme === 'dark';
  const transactions = useAppSelector((state) => state.payment.transactions);

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');

  const filteredTransactions = useMemo(() => {
    const base = filter === 'all'
      ? [...transactions]
      : transactions.filter((item) => item.status === filter);

    return base.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [filter, sortBy, transactions]);

  const statusCount = useMemo(() => {
    return transactions.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<PaymentTransactionStatus, number>);
  }, [transactions]);

  const failedTotal =
    (statusCount.failed || 0) +
    (statusCount.cancelled || 0) +
    (statusCount.timeout || 0);

  const renderTransactionItem = ({ item }: { item: PaymentTransaction }) => {
    const meta = STATUS_META[item.status];

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <View style={styles.itemTopRow}>
          <View style={styles.itemTopLeft}>
            <Text style={[styles.planText, { color: colors.text }]}>
              Gói {getPlanLabel(item.plan)}
            </Text>
            <Text style={styles.timeText}>
              {formatTransactionDate(item.createdAt)}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${meta.color}22` }]}>
            <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.itemBottomRow}>
          <Text style={[styles.amountText, { color: colors.text }]}>{formatPrice(item.amount)}</Text>
          <Text style={styles.txnText}>Mã GD: {item.id}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View
        style={[
          styles.header,
          {
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            borderBottomColor:
              colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Lịch sử giao dịch</Text>
          <Pressable
            style={styles.sortButton}
            onPress={() => setSortBy((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          >
            <Ionicons
              name={sortBy === 'newest' ? 'arrow-down' : 'arrow-up'}
              size={18}
              color={colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Tổng: {transactions.length}</Text>
          <Text style={styles.summaryText}>Thành công: {statusCount.success || 0}</Text>
          <Text style={styles.summaryText}>Thất bại: {failedTotal}</Text>
        </View>
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const selected = filter === item.key;
            return (
              <Pressable
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected
                      ? '#2E7CF6'
                      : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.06)',
                    borderColor: selected
                      ? '#2E7CF6'
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.08)',
                  },
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text style={[styles.filterChipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderTransactionItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={42} color={isDark ? '#AAB2C5' : '#8791A8'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có giao dịch</Text>
            <Text style={styles.emptyDesc}>Hãy mua gói Premium để tạo giao dịch đầu tiên.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  sortButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  summaryText: {
    fontSize: 12,
    color: '#8C95A9',
    fontWeight: '600',
  },
  filterWrap: {
    paddingTop: 10,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 28,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemTopLeft: {
    flex: 1,
    gap: 3,
  },
  planText: {
    fontSize: 15,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#8C95A9',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
  },
  txnText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    color: '#8C95A9',
  },
  emptyWrap: {
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8C95A9',
    textAlign: 'center',
  },
});

export default TransactionHistoryPage;
