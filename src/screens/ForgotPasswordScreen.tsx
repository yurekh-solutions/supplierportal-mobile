import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword } from '../lib/api';
import { colors, gradients, borderRadius, shadows } from '../styles/colors';

const COLORS = {
  primary: colors.primary,
  background: colors.background,
  backgroundPink: colors.backgroundPink,
  text: colors.text,
  textLight: colors.textLight,
};

interface ForgotPasswordScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export default function ForgotPasswordScreen({ navigation, onBack }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        Alert.alert('Success', 'Password reset link has been sent to your email');
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset link');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onBack?.();
    navigation?.goBack?.();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundPink, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient colors={gradients.premium} style={styles.iconGradient}>
              <Ionicons name="key" size={40} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {!success ? (
            <>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <LinearGradient colors={gradients.premium} style={styles.inputIcon}>
                    <Ionicons name="mail-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  <LinearGradient colors={gradients.premium} style={styles.submitGradient}>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitText}>Send Reset Link</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successCard}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successText}>
                We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
              </Text>
              <TouchableOpacity style={styles.backToLoginButton} onPress={handleBack}>
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login Link */}
          {!success && (
            <TouchableOpacity style={styles.loginLink} onPress={handleBack}>
              <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
              <Text style={styles.loginLinkText}>Back to Login</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...shadows.sm,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    ...shadows.md,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backToLoginButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
