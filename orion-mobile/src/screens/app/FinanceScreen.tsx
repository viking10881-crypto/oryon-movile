import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AnimatedFadeSlide } from '../../theme/AnimatedFadeSlide';
import { AnimatedProgressBar } from '../../theme/AnimatedProgressBar';
import { accountsApi, transactionsApi, debtsApi, Transaction, Account, Debt } from '../../services/api';
import { getTxVisual, formatMoney, formatTxAmount, formatTime, isSameDay } from '../../services/txUtils';
import AddAccountModal from '../../components/AddAccountModal';
import AddTransactionModal from '../../components/AddTransactionModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusType = 'Completado' | 'Recurrente' | 'Verificado' | 'Pendiente';

const STATUS_COLORS: Record<StatusType, string> = {
  Completado: colors.income,
  Verificado: colors.income,
  Recurrente: '#3B82F6',
  Pendiente: colors.warning,
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status as StatusType] ?? colors.muted;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupTransactions(txs: Transaction[]): { group: string; items: Transaction[] }[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const map = new Map<string, Transaction[]>();

  txs.forEach((tx) => {
    const d = new Date(tx.date);
    let key: string;
    if (isSameDay(d, today)) key = 'HOY';
    else if (isSameDay(d, yesterday)) key = 'AYER';
    else key = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase();

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  });

  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}

// ─── Component ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function FinanceScreen() {
  const [period, setPeriod] = useState<'Mensual' | 'Semanal'>('Mensual');
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, dts, txs] = await Promise.all([
        accountsApi.list(),
        debtsApi.list(),
        transactionsApi.list({ limit: PAGE_SIZE, offset: 0 }),
      ]);
      setAccounts(accs);
      setDebts(dts);
      setTransactions(txs);
      setHasMore(txs.length === PAGE_SIZE);
    } catch {
      // silently show empty state on network error
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const more = await transactionsApi.list({ limit: PAGE_SIZE, offset: transactions.length });
      setTransactions((prev) => [...prev, ...more]);
      setHasMore(more.length === PAGE_SIZE);
    } catch {
      // silently stop pagination on error
    } finally {
      setLoadingMore(false);
    }
  };

  const primaryAccount = accounts[0];
  const cashAccount = accounts.find((a) => a.type === 'cash');

  const filteredTx = search.trim()
    ? transactions.filter((tx) =>
        tx.title.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const grouped = groupTransactions(filteredTx);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>Oryon360</Text>
          <TouchableOpacity style={styles.avatarBtn} activeOpacity={0.7}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <AnimatedFadeSlide delay={0}>
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Resumen Financiero</Text>
            <Text style={styles.pageSubtitle}>
              Tu plan arquitectónico para la riqueza a largo plazo.
            </Text>
          </View>
        </AnimatedFadeSlide>

        {/* Period Toggle */}
        <AnimatedFadeSlide delay={60}>
          <View style={styles.toggleRow}>
            {(['Mensual', 'Semanal'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.toggleBtn, period === p && styles.toggleBtnActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleText, period === p && styles.toggleTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedFadeSlide>

        {/* ── Accounts ─────────────────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={140}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuentas</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAccountModal(true)} activeOpacity={0.7}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={[styles.bankCard, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Cargando...</Text>
            </View>
          ) : primaryAccount ? (
            <View style={styles.bankCard}>
              <View style={styles.bankCardTop}>
                <View style={styles.bankIconBg}>
                  <MaterialCommunityIcons name="bank-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.primaryBankLabel}>
                  {primaryAccount.name.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.balanceLabel}>Saldo Disponible</Text>
              <Text style={styles.balanceAmount}>${formatMoney(primaryAccount.balance)}</Text>
            </View>
          ) : (
            <View style={[styles.bankCard, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Sin cuentas registradas</Text>
            </View>
          )}

          {cashAccount && (
            <View style={styles.cashRow}>
              <View style={styles.cashLeft}>
                <View style={styles.cashIconBg}>
                  <MaterialCommunityIcons name="cash-multiple" size={22} color="#64748B" />
                </View>
                <Text style={styles.cashLabel}>Efectivo</Text>
              </View>
              <Text style={styles.cashAmount}>${formatMoney(cashAccount.balance)}</Text>
            </View>
          )}
        </AnimatedFadeSlide>

        {/* ── Debts & Liabilities ───────────────────────────────────────────── */}
        {debts.length > 0 && (
          <AnimatedFadeSlide delay={240}>
            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
              Deudas y Pasivos
            </Text>
            {debts.map((debt, i) => {
              const paidPct = Number(debt.paid_percentage) || 0;
              const barColor = paidPct >= 80 ? colors.warning : colors.primary;
              return (
                <View key={debt.id} style={styles.debtCard}>
                  <View style={styles.debtHeader}>
                    <Text style={styles.debtTitle}>{debt.name}</Text>
                    <Text style={styles.debtPct}>{paidPct}% Pagado</Text>
                  </View>
                  <AnimatedProgressBar
                    percentage={paidPct}
                    color={barColor}
                    delay={400 + i * 150}
                  />
                  <View style={styles.debtFooter}>
                    <Text style={styles.debtRemainingLabel}>Restante</Text>
                    <Text style={styles.debtRemainingAmount}>
                      ${formatMoney(debt.remaining_amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </AnimatedFadeSlide>
        )}

        {/* ── Transaction History ───────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={340}>
          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
            Historial de Transacciones
          </Text>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar transacciones..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          </View>

          {loading ? (
            <View style={[styles.txList, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Cargando...</Text>
            </View>
          ) : grouped.length === 0 ? (
            <View style={[styles.txList, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Sin transacciones aún</Text>
            </View>
          ) : (
            grouped.map((group) => (
              <View key={group.group}>
                <Text style={styles.groupLabel}>{group.group}</Text>
                <View style={styles.txList}>
                  {group.items.map((tx, index) => {
                    const { icon, iconBg, iconColor } = getTxVisual(tx);
                    const amount = Number(tx.amount);
                    return (
                      <View
                        key={tx.id}
                        style={[
                          styles.txItem,
                          index < group.items.length - 1 && styles.txItemBorder,
                        ]}
                      >
                        <View style={[styles.txIconBg, { backgroundColor: iconBg }]}>
                          <Ionicons name={icon} size={20} color={iconColor} />
                        </View>
                        <View style={styles.txInfo}>
                          <Text style={styles.txTitle}>{tx.title}</Text>
                          <Text style={styles.txMeta}>
                            {tx.category_name ?? tx.type} • {formatTime(tx.date)}
                          </Text>
                        </View>
                        <View style={styles.txRight}>
                          <Text
                            style={[
                              styles.txAmount,
                              { color: amount < 0 ? colors.expense : colors.income },
                            ]}
                          >
                            {formatTxAmount(amount)}
                          </Text>
                          <Text style={[styles.txStatus, { color: getStatusColor(tx.status) }]}>
                            {tx.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}

          {!loading && hasMore && (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore} activeOpacity={0.75} disabled={loadingMore}>
              {loadingMore
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={styles.loadMoreText}>Cargar Más Historial</Text>}
            </TouchableOpacity>
          )}
        </AnimatedFadeSlide>

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowTxModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <AddAccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onCreated={loadData}
      />
      <AddTransactionModal
        visible={showTxModal}
        onClose={() => setShowTxModal(false)}
        onCreated={loadData}
        defaultType="expense"
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuBtn: { padding: 4 },
  headerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  avatarBtn: { padding: 2 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  titleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  toggleTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bankCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bankIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBankLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1.4,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  cashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cashLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cashIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cashAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  debtCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  debtTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  debtPct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  debtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtRemainingLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  debtRemainingAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 1.4,
    marginBottom: 8,
    marginTop: 4,
  },
  txList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  txItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  txMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadMoreBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
