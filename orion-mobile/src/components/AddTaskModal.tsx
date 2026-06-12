import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { tasksApi } from '../services/api';

type Priority = 'ALTA' | 'REUNIÓN' | 'FINANZAS' | 'PERSONAL';

const PRIORITIES: { key: Priority; label: string; color: string; bg: string }[] = [
  { key: 'ALTA',     label: 'Alta',     color: '#0284C7', bg: '#E0F2FE' },
  { key: 'REUNIÓN',  label: 'Reunión',  color: '#64748B', bg: '#F1F5F9' },
  { key: 'FINANZAS', label: 'Finanzas', color: '#F59E0B', bg: '#FFF3E0' },
  { key: 'PERSONAL', label: 'Personal', color: '#3B82F6', bg: '#EFF6FF' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  selectedDate?: Date;
}

export default function AddTaskModal({ visible, onClose, onCreated, selectedDate }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('PERSONAL');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setTitle(''); setPriority('PERSONAL'); setNotes(''); };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Campo requerido', 'Escribe un título para la tarea'); return; }
    setLoading(true);
    try {
      const due = selectedDate ?? new Date();
      await tasksApi.create({
        title: title.trim(),
        priority,
        due_date: due.toISOString(),
        notes: notes.trim() || undefined,
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
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nueva Tarea</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Priority */}
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.priorityGrid}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.priorityBtn,
                  { backgroundColor: priority === p.key ? p.bg : colors.inputBg },
                  priority === p.key && { borderWidth: 1.5, borderColor: p.color },
                ]}
                onPress={() => setPriority(p.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.priorityText, { color: priority === p.key ? p.color : colors.muted }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Notas (opcional)"
            placeholderTextColor={colors.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitText}>CREAR TAREA</Text>
                </>
              )}
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
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, gap: 14,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  input: {
    backgroundColor: colors.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: colors.text,
  },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.8 },
  priorityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priorityBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: '45%', alignItems: 'center' },
  priorityText: { fontSize: 13, fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, marginTop: 4,
  },
  submitText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
