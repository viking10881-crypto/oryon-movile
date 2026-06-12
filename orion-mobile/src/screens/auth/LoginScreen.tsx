import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { AnimatedFadeSlide } from '../../theme/AnimatedFadeSlide';
import { authApi } from '../../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email.trim(), password);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Error al ingresar', err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <AnimatedFadeSlide delay={0}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconBg}>
                <MaterialCommunityIcons name="bank" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>Oryon360</Text>
            </View>
          </AnimatedFadeSlide>

          {/* Header */}
          <AnimatedFadeSlide delay={80}>
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>
              Ingresa tus credenciales para acceder a tu portal.
            </Text>
          </AnimatedFadeSlide>

          {/* Form */}
          <AnimatedFadeSlide delay={160} style={styles.form as any}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="nombre@empresa.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Contraseña</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stay signed in */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setStaySignedIn(!staySignedIn)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, staySignedIn && styles.checkboxActive]}>
                {staySignedIn && (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Mantener sesión por 30 días</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.75 }]}
              onPress={handleSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>INGRESAR</Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </AnimatedFadeSlide>

          {/* Divider + Create Account */}
          <AnimatedFadeSlide delay={280}>
            <View style={styles.divider} />
            <View style={styles.createAccountArea}>
              <Text style={styles.createAccountHint}>¿No tienes una cuenta?</Text>
              <TouchableOpacity
                onPress={() => router.push('/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.createAccountLink}>Crear una Cuenta</Text>
              </TouchableOpacity>
            </View>
          </AnimatedFadeSlide>
        </ScrollView>

        {/* Footer */}
        <AnimatedFadeSlide delay={340}>
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLink}>Política de Privacidad</Text>
            </TouchableOpacity>
            <Text style={styles.footerSep}> | </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLink}>Términos de Uso</Text>
            </TouchableOpacity>
            <Text style={styles.footerCopy}>  © 2024 Oryon360</Text>
          </View>
        </AnimatedFadeSlide>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
    paddingBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 52,
  },
  logoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 36,
  },
  form: {
    gap: 20,
    marginBottom: 36,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  eyeBtn: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 60,
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 30,
  },
  createAccountArea: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  createAccountHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  createAccountLink: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLink: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  footerSep: {
    fontSize: 11,
    color: colors.border,
  },
  footerCopy: {
    fontSize: 11,
    color: colors.muted,
  },
});
