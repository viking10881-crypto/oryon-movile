import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AnimatedFadeSlide } from '../../theme/AnimatedFadeSlide';
import { tasksApi, Task as ApiTask } from '../../services/api';
import { getWeekDays, toDateParam } from '../../services/txUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

type BadgeKey = 'ALTA' | 'REUNIÓN' | 'FINANZAS' | 'PERSONAL';

const BADGE_STYLES: Record<BadgeKey, { bg: string; text: string }> = {
  ALTA:     { bg: '#E0F2FE', text: '#0284C7' },
  REUNIÓN:  { bg: '#F1F5F9', text: '#64748B' },
  FINANZAS: { bg: '#FFF3E0', text: '#F59E0B' },
  PERSONAL: { bg: '#EFF6FF', text: '#3B82F6' },
};

const BADGE_TO_CATEGORY: Record<BadgeKey, string> = {
  ALTA: 'Finanzas',
  REUNIÓN: 'Agenda',
  FINANZAS: 'Inversión',
  PERSONAL: 'Personal',
};

const UPCOMING = [
  {
    id: 'u1',
    month: 'OCT',
    day: '20',
    category: 'SEMINARIO DE INVERSIÓN',
    categoryColor: '#0284C7',
    title: 'Tendencias del Mercado Global 2024',
    meta: '09:00 AM - 11:30 AM',
    metaIcon: 'time-outline' as const,
  },
  {
    id: 'u2',
    month: 'OCT',
    day: '24',
    category: 'PERSONAL',
    categoryColor: '#64748B',
    title: 'Evaluación Fiscal Anual',
    meta: 'Oficina Principal',
    metaIcon: 'location-outline' as const,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const DAYS = getWeekDays();
const today = new Date();

export default function AgendaScreen() {
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async (dayNum: number) => {
    const dayObj = DAYS.find((d) => d.day === dayNum);
    if (!dayObj) return;
    setLoading(true);
    try {
      const dateParam = toDateParam(
        dayObj.date.getFullYear(),
        dayObj.date.getMonth(),
        dayObj.date.getDate()
      );
      const data = await tasksApi.list(dateParam);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks(selectedDay);
  }, [selectedDay]);

  const toggleTask = async (id: string, currentDone: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !currentDone } : t))
    );
    try {
      await tasksApi.update(id, { is_completed: !currentDone });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: currentDone } : t))
      );
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const completedPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const currentMonth = DAYS[0]?.date
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .toUpperCase() ?? '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>Oryon360</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month & Title */}
        <AnimatedFadeSlide delay={0}>
          <View style={styles.calendarTop}>
            <View style={styles.monthRow}>
              <Text style={styles.monthLabel}>{currentMonth}</Text>
              <View style={styles.monthNav}>
                <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.pageTitle}>Agenda</Text>
          </View>
        </AnimatedFadeSlide>

        {/* Day Picker */}
        <AnimatedFadeSlide delay={80}>
          <View style={styles.dayPicker}>
            {DAYS.map(({ dow, day }) => {
              const active = day === selectedDay;
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCard, active && styles.dayCardActive]}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.dowText, active && styles.dowTextActive]}>{dow}</Text>
                  <Text style={[styles.dayNum, active && styles.dayNumActive]}>{day}</Text>
                  {active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedFadeSlide>

        {/* ── Today's Tasks ─────────────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={160}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tareas de Hoy</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.addNewLink}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={[styles.taskList, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Cargando...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={[styles.taskList, { padding: 24, alignItems: 'center' }]}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Sin tareas para este día</Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {tasks.map((task) => {
                const badge = (task.priority as BadgeKey) in BADGE_STYLES
                  ? (task.priority as BadgeKey)
                  : 'PERSONAL';
                const { bg, text } = BADGE_STYLES[badge];
                const timeStr = task.due_date
                  ? new Date(task.due_date).toLocaleTimeString('es-MX', {
                      hour: '2-digit', minute: '2-digit', hour12: true,
                    })
                  : '';
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskItem}
                    onPress={() => toggleTask(task.id, task.is_completed)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.taskCheckbox, task.is_completed && styles.taskCheckboxDone]}>
                      {task.is_completed && (
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, task.is_completed && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {BADGE_TO_CATEGORY[badge]}{timeStr ? ` • ${timeStr}` : ''}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: bg }]}>
                      <Text style={[styles.badgeText, { color: text }]}>{badge}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </AnimatedFadeSlide>

        {/* ── Upcoming ──────────────────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={260}>
          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
            Próximos Eventos
          </Text>
          {UPCOMING.map((event) => (
            <View key={event.id} style={styles.upcomingCard}>
              <View style={styles.upcomingDate}>
                <Text style={styles.upcomingMonth}>{event.month}</Text>
                <Text style={styles.upcomingDay}>{event.day}</Text>
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingCategory, { color: event.categoryColor }]}>
                  {event.category}
                </Text>
                <Text style={styles.upcomingTitle}>{event.title}</Text>
                <View style={styles.upcomingMeta}>
                  <Ionicons name={event.metaIcon} size={13} color={colors.muted} />
                  <Text style={styles.upcomingMetaText}>{event.meta}</Text>
                </View>
              </View>
            </View>
          ))}
        </AnimatedFadeSlide>

        {/* Progress Banner + Smart Suggestion */}
        <AnimatedFadeSlide delay={360}>
          <View style={styles.progressBanner}>
            <Text style={styles.progressBannerText}>
              {tasks.length > 0
                ? `¡Sigue así! ${completedPct}% de tareas completadas hoy.`
                : 'Agrega tareas para comenzar tu día productivo.'}
            </Text>
          </View>
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>Sugerencia Inteligente</Text>
            <Text style={styles.suggestionBody}>
              Tienes tiempo libre disponible. ¿Deseas revisar tus proyecciones financieras o programar una nueva tarea?
            </Text>
            <TouchableOpacity style={styles.scheduleBtn} activeOpacity={0.85}>
              <Text style={styles.scheduleBtnText}>PROGRAMAR AHORA</Text>
            </TouchableOpacity>
          </View>
        </AnimatedFadeSlide>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  iconBtn: { padding: 4 },
  headerLogo: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: 0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  calendarTop: { marginBottom: 16 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  monthLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 1.2 },
  monthNav: { flexDirection: 'row', gap: 4 },
  navBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontSize: 30, fontWeight: '800', color: colors.text },
  dayPicker: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 6 },
  dayCard: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14,
    backgroundColor: colors.surface, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  dayCardActive: { backgroundColor: colors.primary },
  dowText: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 0.5 },
  dowTextActive: { color: 'rgba(255,255,255,0.7)' },
  dayNum: { fontSize: 18, fontWeight: '800', color: colors.text },
  dayNumActive: { color: '#FFFFFF' },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  addNewLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
  taskList: {
    backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  taskItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  taskCheckbox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  taskCheckboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  taskContent: { flex: 1, gap: 3 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.muted },
  taskMeta: { fontSize: 12, color: colors.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  upcomingCard: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginBottom: 10, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  upcomingDate: { alignItems: 'center', justifyContent: 'center', minWidth: 36 },
  upcomingMonth: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  upcomingDay: { fontSize: 22, fontWeight: '800', color: colors.text, lineHeight: 28 },
  upcomingInfo: { flex: 1, gap: 3 },
  upcomingCategory: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  upcomingTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  upcomingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  upcomingMetaText: { fontSize: 12, color: colors.muted },
  progressBanner: {
    backgroundColor: colors.primary, borderRadius: 16, padding: 20,
    marginTop: 4, marginBottom: 16, justifyContent: 'flex-end', minHeight: 90,
  },
  progressBannerText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', lineHeight: 20 },
  suggestionCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 22, gap: 12 },
  suggestionTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  suggestionBody: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  scheduleBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  scheduleBtnText: { fontSize: 13, fontWeight: '800', color: colors.primary, letterSpacing: 1.2 },
});
