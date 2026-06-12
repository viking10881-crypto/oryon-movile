import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { accountsApi } from '../services/api';

type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'credit';

const TYPES: { key: AccountType; label: string; icon: string; iconBg: string; iconColor: string }[] = [
  { key: 'checking',   label: 'Corriente',  icon: 'bank-outline',       iconBg: '#EFF6FF', iconColor: '#3B82F6' },
  { key: 'savings',    label: 'Ahorro',     icon: 'piggy-bank-outline',  iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { key: 'cash',       label: 'Efectivo',   icon: 'cash-multiple',       iconBg: '#F1F5F9', iconColor: '#64748B' },
  { key: 'investment', label: 'Inversión',  icon: 'trending-up',         iconBg: '#FFF3E0', iconColor: '#F59E0B' },
  { key: 'credit',     label: 'Crédito',    icon: 'credit-card-outline', iconBg: '#FFF1F2', iconColor: '#E11D48' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddAccountModal({ visible, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const reset = () => { setName(''); setType('checking'); setBalance(''); setCurrency('USD'); };

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert('Campo requerido', 'Escribe un nombre para la cuenta'); return; }
    const num = balance.trim() ? parseFloat(balance.replace(',', '.')) : 0;
    if (isNaN(num)) { Alert.alert('Saldo inválido', 'Ingresa un número válido'); return; }

    setLoading(true);
    try {
      await accountsApi.create({ name: name.trim(), type, balance: num, currency });
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nueva Cuenta</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <TextInput
              style={styles.input}
              placeholder="Nombre de la cuenta"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            {/* Type */}
            <Text style={styles.label}>TIPO DE CUENTA</Text>
            <View style={styles.typeGrid}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeCard, type === t.key && styles.typeCardActive]}
                  onPress={() => setType(t.key)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.typeIconBg, { backgroundColor: t.iconBg }]}>
                    <MaterialCommunityIcons name={t.icon as any} size={22} color={t.iconColor} />
                  </View>
                  <Text style={[styles.typeLabel, type === t.key && styles.typeLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Balance inicial */}
            <Text style={styles.label}>SALDO INICIAL</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                style={styles.balanceInput}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                value={balance}
                onChangeText={setBalance}
              />
              {/* Currency toggle */}
              <TouchableOpacity
                style={styles.currencyToggle}
                onPress={() => setCurrency((c) => (c === 'USD' ? 'COP' : 'USD'))}
                activeOpacity={0.75}
              >
                <Text style={styles.currencyToggleText}>{currency}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.submitText}>CREAR CUENTA</Text>
                  </>
                )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  input: {
    backgroundColor: colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: colors.text, marginBottom: 20,
  },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1.2, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: colors.inputBg, minWidth: '45%',
  },
  typeCardActive: {
    backgroundColor: colors.primary + '18',
    borderWidth: 1.5, borderColor: colors.primary,
  },
  typeIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  typeLabelActive: { color: colors.primary, fontWeight: '700' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  currency: { fontSize: 28, fontWeight: '800', color: colors.text },
  balanceInput: {
    flex: 1, fontSize: 32, fontWeight: '800', color: colors.text,
    borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 4,
  },
  currencyToggle: {
    backgroundColor: colors.inputBg, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  currencyToggleText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, marginTop: 4,
  },
  submitText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
