import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients, shadows, borderRadius } from '../styles/colors';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();

  // WhatsApp contact numbers
  const WHATSAPP_PRODUCTS = '919559434242';
  const WHATSAPP_SUPPORT = '919559262525';
  const SUPPORT_EMAIL = 'ritzyard.ai@gmail.com';

  const openWhatsApp = (number: string, message: string) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const openEmail = () => {
    const subject = `Support Request - ${user?.companyName || 'Supplier'}`;
    const body = `Company: ${user?.companyName}\nEmail: ${user?.email}\nPhone: ${user?.phone}\n\nPlease describe your issue:\n`;
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const callSupport = () => {
    Linking.openURL(`tel:+91${WHATSAPP_SUPPORT}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, showChevron = true, danger = false }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && { backgroundColor: colors.errorLight }]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={danger ? colors.error : colors.primary} 
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && { color: colors.error }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundPink, colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.logo ? (
              <Image source={{ uri: user.logo }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={gradients.premium}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {user?.companyName?.charAt(0) || 'S'}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
          </View>

          <Text style={styles.companyName}>{user?.companyName || 'Supplier'}</Text>
          <Text style={styles.contactName}>{user?.contactPerson}</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color={colors.textLight} />
              <Text style={styles.contactText}>{user?.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color={colors.textLight} />
              <Text style={styles.contactText}>{user?.phone}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="person-outline" 
              title="Edit Profile" 
              subtitle="Update your business information"
            />
            <MenuItem 
              icon="lock-closed-outline" 
              title="Change Password" 
              subtitle="Update your password"
            />
            <MenuItem 
              icon="notifications-outline" 
              title="Notifications" 
              subtitle="Manage notification preferences"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="cube-outline" 
              title="My Products" 
              subtitle="Manage your product listings"
              onPress={() => navigation.navigate('Dashboard')}
            />
            <MenuItem 
              icon="chatbubble-outline" 
              title="Inquiries" 
              subtitle="View customer inquiries"
            />
            <MenuItem 
              icon="analytics-outline" 
              title="Analytics" 
              subtitle="View your business insights"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="logo-whatsapp" 
              title="WhatsApp Support" 
              subtitle="Chat with us on WhatsApp"
              onPress={() => openWhatsApp(WHATSAPP_SUPPORT, `Hi, I need help with my supplier account.\n\nCompany: ${user?.companyName}\nEmail: ${user?.email}`)}
            />
            <MenuItem 
              icon="mail-outline" 
              title="Email Support" 
              subtitle={SUPPORT_EMAIL}
              onPress={openEmail}
            />
            <MenuItem 
              icon="call-outline" 
              title="Call Support" 
              subtitle="+91 95592 62525"
              onPress={callSupport}
            />
            <MenuItem 
              icon="help-circle-outline" 
              title="Help Center" 
              subtitle="Get help and support"
            />
            <MenuItem 
              icon="document-text-outline" 
              title="Terms & Conditions" 
              subtitle="Read our terms"
            />
            <MenuItem 
              icon="shield-checkmark-outline" 
              title="Privacy Policy" 
              subtitle="How we protect your data"
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="log-out-outline" 
              title="Logout" 
              showChevron={false}
              danger={true}
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* App Version */}
        <Text style={styles.version}>ritz yard - Where Value Meets Velocity</Text>
        <Text style={styles.versionNumber}>v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 28,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 2,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 15,
    color: colors.textLight,
    marginBottom: 12,
  },
  contactInfo: {
    gap: 6,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 16,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  version: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
  versionNumber: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
