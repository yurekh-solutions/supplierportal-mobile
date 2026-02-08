import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supplierLogin, supplierSetupPassword } from '../lib/api';
import { colors, gradients, shadows, borderRadius, spacing } from '../styles/colors';

// Design System Colors
const COLORS = {
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  primaryDark: colors.primaryDark,
  secondary: colors.backgroundPink,
  background: colors.background,
  white: colors.card,
  text: colors.text,
  textLight: colors.textLight,
  border: colors.border,
  card: colors.card,
  success: colors.success,
  error: colors.error,
};

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess?: () => void;
  onCheckStatusPress?: (email: string) => void;
}

export default function LoginScreen({ navigation, onLoginSuccess, onCheckStatusPress }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCheckStatus = () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email to check application status');
      return;
    }
    onCheckStatusPress?.(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await supplierLogin(email, password);

      if (response.success && response.token && response.user) {
        await login(response.token, response.user);
        Alert.alert('Success', 'Logged in successfully!');
        onLoginSuccess?.();
      } else if (response.message === 'Please set up your password first') {
        setShowPasswordSetup(true);
        Alert.alert('Password Setup Required', 'Please set up your password to continue');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSetup = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await supplierSetupPassword(email, newPassword);

      if (response.success && response.token && response.user) {
        await login(response.token, response.user);
        Alert.alert('Success', 'Password set up successfully!');
        onLoginSuccess?.();
      } else {
        Alert.alert('Error', response.message || 'Failed to set up password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const navigateToOnboarding = () => {
    navigation.navigate('Onboarding');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.secondary, COLORS.background]}
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={gradients.premium}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Image
                  source={require('../assets/ritz.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>
              <Text style={styles.brandR}>r</Text>
              <Text style={styles.brandText}>itz yard</Text>
            </Text>
            <Text style={styles.tagline}>Where Value Meets Velocity</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {showPasswordSetup ? 'Set Up Password' : 'Supplier Login'}
            </Text>
            <Text style={styles.formSubtitle}>
              {showPasswordSetup 
                ? 'Your application was approved! Set your password.' 
                : 'Enter your credentials to access your dashboard'}
            </Text>

            {!showPasswordSetup ? (
              <>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient
                      colors={gradients.premium}
                      style={styles.inputIcon}
                    >
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

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient
                      colors={gradients.premium}
                      style={styles.inputIcon}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={COLORS.textLight} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  ) : (
                    <LinearGradient
                      colors={gradients.premium}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Ionicons name="log-in-outline" size={20} color="#fff" />
                      <Text style={styles.submitText}>Login to Dashboard</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity 
                  style={styles.forgotButton}
                  onPress={navigateToForgotPassword}
                >
                  <Text style={styles.forgotText}>Forgot your password?</Text>
                </TouchableOpacity>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.info} />
                  <Text style={styles.infoText}>
                    You can only login after your supplier application is approved by admin.
                  </Text>
                </View>

                {/* Check Application Status */}
                <TouchableOpacity 
                  style={styles.checkStatusButton}
                  onPress={handleCheckStatus}
                >
                  <LinearGradient
                    colors={['rgba(201, 79, 49, 0.08)', 'rgba(201, 79, 49, 0.03)']}
                    style={styles.checkStatusGradient}
                  >
                    <View style={styles.checkStatusIconWrapper}>
                      <Ionicons name="time" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.checkStatusContent}>
                      <Text style={styles.checkStatusTitle}>Check Application Status</Text>
                      <Text style={styles.checkStatusSubtitle}>Already applied? Check your status</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Password Setup Form */}
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.successText}>
                    Your application was approved! Set your password.
                  </Text>
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient
                      colors={gradients.premium}
                      style={styles.inputIcon}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={COLORS.textLight} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient
                      colors={gradients.premium}
                      style={styles.inputIcon}
                    >
                      <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={COLORS.textLight} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Setup Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handlePasswordSetup}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  ) : (
                    <LinearGradient
                      colors={gradients.premium}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.submitText}>Set Up Password & Login</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setShowPasswordSetup(false)}
                >
                  <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
                  <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* New Supplier CTA */}
          <TouchableOpacity 
            style={styles.newSupplierCard}
            onPress={navigateToOnboarding}
          >
            <LinearGradient
              colors={['rgba(201, 79, 49, 0.1)', 'rgba(100, 53, 38, 0.05)']}
              style={styles.newSupplierGradient}
            >
              <View style={styles.newSupplierIconWrapper}>
                <LinearGradient
                  colors={gradients.premium}
                  style={styles.newSupplierIcon}
                >
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.newSupplierContent}>
                <Text style={styles.newSupplierTitle}>New Supplier?</Text>
                <Text style={styles.newSupplierSubtitle}>
                  Join 500+ suppliers growing with RitzYard
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    marginBottom: 16,
    ...shadows.lg,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  brandR: {
    color: colors.primary,
    fontWeight: '700',
  },
  brandText: {
    color: colors.text,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 24,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  eyeIcon: {
    padding: 14,
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
    color: '#ffffff',
  },
  forgotButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: 16,
    borderRadius: borderRadius.md,
    marginTop: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    lineHeight: 18,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 14,
    borderRadius: borderRadius.md,
    marginBottom: 20,
    gap: 10,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  backText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  newSupplierCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
  },
  newSupplierGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  newSupplierIconWrapper: {
    marginRight: 16,
  },
  newSupplierIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  newSupplierContent: {
    flex: 1,
  },
  newSupplierTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  newSupplierSubtitle: {
    fontSize: 13,
    color: colors.textLight,
  },
  checkStatusButton: {
    marginTop: 16,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  checkStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  checkStatusIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkStatusContent: {
    flex: 1,
  },
  checkStatusTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  checkStatusSubtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
});
