import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');

// Colors matching web theme
const COLORS = {
  primary: '#C94F31',
  primaryLight: '#d47050',
  secondary: '#8B4513',
  background: '#F5F0EB',
  backgroundLight: '#fef2f0',
  text: '#352f28',
  textLight: '#6b6258',
  white: '#ffffff',
  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#eab308',
  warningLight: '#fef9c3',
  error: '#ef4444',
  errorLight: '#fee2e2',
};

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface StatusData {
  status: ApplicationStatus;
  email: string;
  companyName: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface SupplierStatusScreenProps {
  navigation: any;
  route?: {
    params?: {
      email?: string;
    };
  };
  email?: string;
  onLoginPress?: () => void;
  onReapplyPress?: () => void;
  onBackPress?: () => void;
}

export default function SupplierStatusScreen({
  navigation,
  route,
  email: propEmail,
  onLoginPress,
  onReapplyPress,
  onBackPress,
}: SupplierStatusScreenProps) {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  const email = propEmail || route?.params?.email;

  useEffect(() => {
    if (email) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [email]);

  const fetchStatus = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backendmatrix.onrender.com/api';
      const response = await fetch(`${API_URL}/supplier/check-status?email=${encodeURIComponent(email!)}`);
      const data = await response.json();

      if (data.success) {
        setStatusData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = () => {
    if (!statusData) return null;

    switch (statusData.status) {
      case 'approved':
        return {
          icon: 'checkmark-circle' as const,
          iconBgColors: [COLORS.success, '#16a34a'] as const,
          title: 'Application Approved! 🎉',
          description: 'Congratulations! Your supplier application has been approved. You can now login to your dashboard.',
          statusColor: COLORS.success,
          statusBgColor: COLORS.successLight,
        };
      case 'rejected':
        return {
          icon: 'close-circle' as const,
          iconBgColors: [COLORS.error, '#dc2626'] as const,
          title: 'Application Rejected',
          description: statusData.rejectionReason || 'Unfortunately, your application was not approved at this time. Please contact support for more information.',
          statusColor: COLORS.error,
          statusBgColor: COLORS.errorLight,
        };
      default:
        return {
          icon: 'time' as const,
          iconBgColors: [COLORS.warning, '#ca8a04'] as const,
          title: 'Application Under Review',
          description: 'Your application is currently being reviewed by our team. You will receive an email notification once the review is complete.',
          statusColor: COLORS.warning,
          statusBgColor: COLORS.warningLight,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading status...</Text>
        </View>
      </View>
    );
  }

  if (!statusData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>No Application Found</Text>
          <Text style={styles.errorDescription}>
            We couldn't find an application with this email. Please submit a new application.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onReapplyPress || onBackPress}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Submit Application</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const config = getStatusConfig()!;

  return (
    <View style={styles.container}>
      {/* Background Orbs */}
      <View style={styles.orbContainer}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Badge */}
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>Supplier Dashboard</Text>
        </View>

        <Text style={styles.pageTitle}>Application <Text style={styles.pageTitleGradient}>Status</Text></Text>
        <Text style={styles.pageSubtitle}>Track your supplier application progress</Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          {/* Status Header */}
          <View style={styles.statusHeader}>
            <View style={styles.orbSmall} />
            <View style={styles.iconContainer}>
              <LinearGradient colors={config.iconBgColors} style={styles.iconGradient}>
                <Ionicons name={config.icon} size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.statusTitle}>{config.title}</Text>
            <Text style={styles.statusDescription}>{config.description}</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            {/* Company Name Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.infoIconGradient}>
                  <Ionicons name="business" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Company Name</Text>
                <Text style={styles.infoValue}>{statusData.companyName}</Text>
              </View>
            </View>

            {/* Status Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.infoIconGradient}>
                  <Ionicons name="document-text" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: config.statusBgColor }]}>
                  <Text style={[styles.statusBadgeText, { color: config.statusColor }]}>
                    {statusData.status.charAt(0).toUpperCase() + statusData.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Submitted On Card */}
            <View style={styles.infoCardFull}>
              <View style={styles.infoIconContainer}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.infoIconGradient}>
                  <Ionicons name="time" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Submitted On</Text>
                <Text style={styles.infoValue}>{formatDate(statusData.submittedAt)}</Text>
              </View>
            </View>

            {/* Reviewed On Card (if available) */}
            {statusData.reviewedAt && (
              <View style={styles.infoCardFull}>
                <View style={styles.infoIconContainer}>
                  <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.infoIconGradient}>
                    <Ionicons name="checkmark-done" size={20} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Reviewed On</Text>
                  <Text style={styles.infoValue}>{formatDate(statusData.reviewedAt)}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Pending Note */}
          {statusData.status === 'pending' && (
            <View style={[styles.alertBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.3)' }]}>
              <View style={styles.alertIconContainer}>
                <LinearGradient colors={[COLORS.warning, '#ca8a04']} style={styles.alertIconGradient}>
                  <Ionicons name="mail" size={16} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Your application is under review</Text>
                <Text style={styles.alertText}>
                  We will notify you via email at <Text style={styles.alertEmail}>{statusData.email}</Text> once a decision has been made.
                </Text>
              </View>
            </View>
          )}

          {/* Approved Action */}
          {statusData.status === 'approved' && (
            <View style={[styles.alertBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }]}>
              <View style={styles.alertIconContainer}>
                <LinearGradient colors={[COLORS.success, '#16a34a']} style={styles.alertIconGradient}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: '#166534' }]}>Next Steps</Text>
                <Text style={[styles.alertText, { color: '#15803d' }]}>
                  • Check your email for login credentials{'\n'}
                  • Visit the supplier login to access your dashboard{'\n'}
                  • Set up your password and start adding products
                </Text>
              </View>
            </View>
          )}

          {/* Rejected Reason */}
          {statusData.status === 'rejected' && statusData.rejectionReason && (
            <View style={[styles.alertBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <View style={styles.alertIconContainer}>
                <LinearGradient colors={[COLORS.error, '#dc2626']} style={styles.alertIconGradient}>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: '#991b1b' }]}>Rejection Reason</Text>
                <Text style={[styles.alertText, { color: '#b91c1c' }]}>{statusData.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {statusData.status === 'approved' && (
              <TouchableOpacity style={styles.primaryButton} onPress={onLoginPress}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>Login to Dashboard</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {statusData.status === 'rejected' && (
              <TouchableOpacity style={styles.primaryButton} onPress={onReapplyPress}>
                <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>Reapply with Corrections</Text>
                  <Ionicons name="refresh" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={onBackPress}>
              <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(201, 79, 49, 0.08)',
    top: -50,
    left: -100,
  },
  orb2: {
    width: 350,
    height: 350,
    backgroundColor: 'rgba(139, 69, 19, 0.06)',
    bottom: -100,
    right: -150,
  },
  orbSmall: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(201, 79, 49, 0.1)',
    borderRadius: 999,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  headerBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 79, 49, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 79, 49, 0.2)',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  pageTitleGradient: {
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusHeader: {
    backgroundColor: 'rgba(201, 79, 49, 0.05)',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 79, 49, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusDescription: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  infoSection: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    width: (width - 72) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 79, 49, 0.1)',
  },
  infoCardFull: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 79, 49, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    marginBottom: 12,
  },
  infoIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#a16207',
    lineHeight: 20,
  },
  alertEmail: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(201, 79, 49, 0.3)',
    backgroundColor: 'rgba(201, 79, 49, 0.05)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  errorCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});
