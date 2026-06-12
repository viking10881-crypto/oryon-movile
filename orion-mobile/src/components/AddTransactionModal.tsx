import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { transactionsApi } from '../services/api';

type TxType = 'expense' | 'income';
type StatusType = 'Completado' | 'Pendiente' | 'Recurrente';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultType?: TxType;
}

const CATEGORIES = ['Comida y Restaurantes', 'Transporte', 'Salud', 'Entretenimiento', 'Inversión', 'Alquiler', 'Electrónica', 'Otro'];
const STATUSES: StatusType[] = ['Completado', 'Pendiente', 'Recurrente'];

export default function AddTransactionModal({ visible, onClose, onCreated, defaultType = 'expense' }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TxType>(defaultType);
  const [category, setCategory] = useState('Otro');
  const [status, setStatus] = useState<StatusType>('Completado');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle(''); setAmount(''); setType(defaultType);
    setCategory('Otro'); setStatus('Completado');
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Campo requerido', 'Escribe un título'); return; }
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || num <= 0) { Alert.alert('Monto inválido', 'Ingresa un monto válido'); return; }

    setLoading(true);
    try {
      await transactionsApi.create({
        title: title.trim(),
        amount: type === 'expense' ? -Math.abs(num) : Math.abs(num),
        type,
        status,
      });
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nueva Transacción</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            {(['expense', 'income'] as TxType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && (t === 'expense' ? styles.typeBtnExpense : styles.typeBtnIncome)]}
                onPress={() => setType(t)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={t === 'expense' ? 'arrow-down-circle' : 'arrow-up-circle'}
                  size={18}
                  color={type === t ? '#fff' : colors.muted}
                />
                <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                  {t === 'expense' ? 'Gasto' : 'Ingreso'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Title */}
          <TextInput
            style={styles.input}
            placeholder="Descripción (ej. Supermercado)"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Category */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status */}
          <Text style={styles.label}>Estado</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, status === s && styles.statusChipActive]}
                onPress={() => setStatus(s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: type === 'expense' ? colors.expense : colors.income }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>GUARDAR TRANSACCIÓN</Text>}
          </TouchableOpacity>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  typeToggle: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: colors.inputBg,
  },
  typeBtnExpense: { backgroundColor: colors.expense },
  typeBtnIncome: { backgroundColor: colors.income },
  typeBtnText: { fontSize: 15, fontWeight: '700', color: colors.muted },
  typeBtnTextActive: { color: '#fff' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { fontSize: 32, fontWeight: '800', color: colors.text },
  amountInput: {
    flex: 1, fontSize: 36, fontWeight: '800', color: colors.text,
    borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 4,
  },
  input: {
    backgroundColor: colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: colors.text,
  },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.inputBg },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.inputBg, alignItems: 'center' },
  statusChipActive: { backgroundColor: colors.primary },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
