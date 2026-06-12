import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AnimatedFadeSlide } from '../../theme/AnimatedFadeSlide';
import { accountsApi, transactionsApi, Transaction } from '../../services/api';
import { getTxVisual, formatMoney, formatTxAmount } from '../../services/txUtils';
import AddTransactionModal from '../../components/AddTransactionModal';
import AddTaskModal from '../../components/AddTaskModal';

const QUICK_ACTIONS = [
  {
    id: 'expense',
    title: 'Agregar Gasto',
    subtitle: 'Registra una nueva transacción',
    icon: 'cash-outline' as const,
    iconBg: '#FFF3E0',
    iconColor: '#F59E0B',
  },
  {
    id: 'task',
    title: 'Agregar Tarea',
    subtitle: 'Gestiona tu agenda',
    icon: 'checkmark-circle-outline' as const,
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  {
    id: 'reports',
    title: 'Ver Reportes',
    subtitle: 'Análisis en profundidad',
    icon: 'stats-chart-outline' as const,
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
  },
];

const CHART_DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'];

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [liquidity, setLiquidity] = useState('0.00');
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<'expense' | 'income'>('expense');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userStr, liqRes, txRes] = await Promise.all([
        AsyncStorage.getItem('user'),
        accountsApi.totalLiquidity(),
        transactionsApi.list({ limit: 3 }),
      ]);
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name?.split(' ')[0] || '');
      }
      setLiquidity(formatMoney(liqRes.total));
      setRecentTx(txRes);
    } catch {
      // silently show empty state on network error
    } finally {
      setLoading(false);
    }
  };

  const openTx = (type: 'expense' | 'income') => {
    setTxDefaultType(type);
    setShowTxModal(true);
  };

  const handleActionPress = (id: string) => {
    if (id === 'expense') openTx('expense');
    else if (id === 'task') setShowTaskModal(true);
    else if (id === 'reports') router.push('/(tabs)/finance');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>Oryon360</Text>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(tabs)/stats')} activeOpacity={0.7}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <AnimatedFadeSlide delay={0}>
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Resumen</Text>
            <Text style={styles.pageSubtitle}>
              {userName ? `Bienvenido, ${userName}. ` : 'Bienvenido. '}
              Tu salud financiera está arquitectada para crecer.
            </Text>
          </View>
        </AnimatedFadeSlide>

        {/* Total Liquidity Card */}
        <AnimatedFadeSlide delay={80}>
          <View style={styles.liquidityCard}>
            <Text style={styles.liquidityLabel}>LIQUIDEZ TOTAL</Text>
            <Text style={styles.liquidityAmount}>${liquidity}</Text>
            <View style={styles.liquidityActions}>
              <TouchableOpacity style={styles.addFundsBtn} onPress={() => openTx('income')} activeOpacity={0.85}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.addFundsText}>Agregar Fondos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.transferBtn} onPress={() => openTx('expense')} activeOpacity={0.85}>
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
                <Text style={styles.transferText}>Transferir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedFadeSlide>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action, index) => (
            <AnimatedFadeSlide key={action.id} delay={180 + index * 70}>
              <TouchableOpacity style={styles.actionCard} onPress={() => handleActionPress(action.id)} activeOpacity={0.75}>
                <View style={[styles.actionIconBg, { backgroundColor: action.iconBg }]}>
                  <Ionicons name={action.icon} size={22} color={action.iconColor} />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
            </AnimatedFadeSlide>
          ))}
        </View>

        {/* Income vs Expenses Chart */}
        <AnimatedFadeSlide delay={400}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{'Ingresos vs\nGastos'}</Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
                  <Text style={styles.legendText}>Ingresos</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.legendText}>Gastos</Text>
                </View>
              </View>
            </View>
            <View style={styles.chartBody}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.gridLine} />
              ))}
            </View>
            <View style={styles.chartDayRow}>
              {CHART_DAYS.map((day) => (
                <Text key={day} style={styles.dayLabel}>{day}</Text>
              ))}
            </View>
          </View>
        </AnimatedFadeSlide>

        {/* Recent Activity */}
        <AnimatedFadeSlide delay={480}>
          <View style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/finance')} activeOpacity={0.7}>
                <Text style={styles.viewAllLink}>Ver Todo</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={[styles.activityList, { padding: 24, alignItems: 'center' }]}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Cargando...</Text>
              </View>
            ) : recentTx.length === 0 ? (
              <View style={[styles.activityList, { padding: 24, alignItems: 'center' }]}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Sin transacciones aún</Text>
              </View>
            ) : (
              <View style={styles.activityList}>
                {recentTx.map((tx, index) => {
                  const { icon, iconBg, iconColor } = getTxVisual(tx);
                  const amount = Number(tx.amount);
                  return (
                    <View key={tx.id} style={[styles.activityItem, index < recentTx.length - 1 && styles.activityItemBorder]}>
                      <View style={[styles.activityIconBg, { backgroundColor: iconBg }]}>
                        <Ionicons name={icon} size={20} color={iconColor} />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>{tx.title}</Text>
                        <Text style={styles.activityDate}>
                          {new Date(tx.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={[styles.activityAmount, { color: amount < 0 ? colors.expense : colors.income }]}>
                        {formatTxAmount(amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </AnimatedFadeSlide>

        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => openTx('expense')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modales */}
      <AddTransactionModal
        visible={showTxModal}
        onClose={() => setShowTxModal(false)}
        onCreated={loadData}
        defaultType={txDefaultType}
      />
      <AddTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onCreated={() => {}}
      />
    </SafeAreaView>
  );
}

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
  menuBtn: {
    padding: 4,
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  avatarBtn: {
    padding: 2,
  },
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
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Liquidity Card
  liquidityCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  liquidityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  liquidityAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 22,
    letterSpacing: -0.5,
  },
  liquidityActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addFundsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    flex: 1,
  },
  addFundsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    paddingVertical: 11,
    flex: 1,
  },
  transferText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Quick Actions
  quickActions: {
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 24,
  },
  chartLegend: {
    gap: 6,
    alignItems: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartBody: {
    height: 80,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.border,
  },
  chartDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  // Recent Activity
  activitySection: {
    marginBottom: 8,
  },
  activityHeader: {
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
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  activityList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: colors.muted,
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  fabSpacer: {
    height: 80,
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
