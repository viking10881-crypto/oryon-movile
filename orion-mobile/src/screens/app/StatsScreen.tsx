import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AnimatedFadeSlide } from '../../theme/AnimatedFadeSlide';

// ─── Data ─────────────────────────────────────────────────────────────────────

const MANAGEMENT_ITEMS = [
  {
    id: 'account',
    title: 'Configuración de Cuenta',
    subtitle: 'Actualiza identidad, recuperación y estado fiscal',
    icon: 'person-outline' as const,
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  {
    id: 'notifications',
    title: 'Preferencias de Notificaciones',
    subtitle: 'Controla alertas en tiempo real y resúmenes semanales',
    icon: 'notifications-outline' as const,
    iconBg: '#FFF3E0',
    iconColor: '#F59E0B',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const handleLogOut = () => {
    router.replace('/');
  };

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
          <TouchableOpacity activeOpacity={0.7}>
            <View style={styles.avatarCircleSmall}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <AnimatedFadeSlide delay={0} offsetY={30}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarRingOuter}>
              <View style={styles.avatarRingInner}>
                <View style={styles.avatarBg}>
                  <Ionicons name="person" size={52} color={colors.primary} />
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </AnimatedFadeSlide>

        {/* User Info */}
        <AnimatedFadeSlide delay={80}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Adrian Thorne</Text>
            <Text style={styles.userEmail}>adrian.thorne@oryon360.com</Text>
            <View style={styles.badgeRow}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>Arquitecto Premium</Text>
              </View>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>Miembro desde Oct 2023</Text>
              </View>
            </View>
          </View>
        </AnimatedFadeSlide>

        {/* ── Personal Management ───────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={160}>
          <View style={styles.managementCard}>
            <Text style={styles.managementLabel}>GESTIÓN PERSONAL</Text>
            {MANAGEMENT_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.managementRow,
                  index < MANAGEMENT_ITEMS.length - 1 && styles.managementRowBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.mgIconBg, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.mgContent}>
                  <Text style={styles.mgTitle}>{item.title}</Text>
                  <Text style={styles.mgSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedFadeSlide>

        {/* ── Privacy & Security ────────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={240}>
          <View style={styles.securityCard}>
            <View style={styles.securityIconBg}>
              <MaterialCommunityIcons name="shield-check" size={26} color="#FFFFFF" />
            </View>
            <Text style={styles.securityTitle}>Privacidad y Seguridad</Text>
            <Text style={styles.securityBody}>
              Gestiona 2FA, historial de sesiones y cifrado de datos.
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.securityLink}>Ver Auditoría de Seguridad →</Text>
            </TouchableOpacity>
          </View>
        </AnimatedFadeSlide>

        {/* ── Help & Support ────────────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={320}>
          <View style={styles.helpCard}>
            <View style={styles.helpIconBg}>
              <Ionicons name="help" size={24} color={colors.textSecondary} />
            </View>
            <Text style={styles.helpTitle}>Ayuda y Soporte</Text>
            <Text style={styles.helpBody}>
              Accede a la base de conocimiento o habla con un estratega senior.
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.helpLink}>Contactar Oryon →</Text>
            </TouchableOpacity>
          </View>
        </AnimatedFadeSlide>

        {/* ── Log Out + Footer ──────────────────────────────────────────────── */}
        <AnimatedFadeSlide delay={400}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>
            ORYON360 ARQUITECTURA V4.2.0  •  CIFRADO DE EXTREMO A EXTREMO
          </Text>
        </AnimatedFadeSlide>

        <View style={{ height: 16 }} />
      </ScrollView>
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  iconBtn: { padding: 4 },
  headerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  avatarCircleSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  avatarRingOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBg: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    bottom: 4,
    right: '50%',
    marginRight: -46,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  // User Info
  userInfo: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  infoBadge: {
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  // Personal Management
  managementCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  managementLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1.4,
    marginBottom: 16,
  },
  managementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  managementRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mgIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mgContent: {
    flex: 1,
    gap: 2,
  },
  mgTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  mgSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  // Security Card
  securityCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 22,
    marginBottom: 12,
    gap: 10,
  },
  securityIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  securityBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  securityLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  // Help Card
  helpCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  helpBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  helpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  // Log Out
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF1F1',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },
  // Footer
  footer: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
});
