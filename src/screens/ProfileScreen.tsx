import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients, shadows, borderRadius } from '../styles/colors';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout, updateUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  // Initialize with user's existing logo
  const [profileImage, setProfileImage] = useState(user?.logo);
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Sync profile image with user data whenever it changes
  useEffect(() => {
    if (user?.logo && profileImage !== user.logo) {
      setProfileImage(user.logo);
    }
  }, [user?.logo]);

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
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      // If no image change, nothing to save
      if (!profileImage || profileImage === user?.logo) {
        Alert.alert('Info', 'No changes to save');
        setEditModalVisible(false);
        return;
      }
      // Get auth token from AuthContext or AsyncStorage
      const authToken = (user as any)?._id;
      if (!authToken) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backendmatrix.onrender.com/api';
      
      // Create FormData for multipart request
      const formData = new FormData();

      // Upload logo if changed
      if (profileImage && profileImage !== user?.logo) {
        // Convert URI to file blob
        const response = await fetch(profileImage);
        const blob = await response.blob();
        formData.append('logo', blob, 'profile-logo.jpg');
      }

      // Send to backend
      const updateResponse = await fetch(`${API_URL}/supplier/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${(user as any)?.token || ''}`,
        },
        body: formData,
      });

      const result = await updateResponse.json();

      if (result.success) {
        // Update AuthContext with new user data
        const updatedUser = {
          ...user,
          logo: result.supplier?.logo || profileImage, // Use new logo from backend
        } as any;
        
        await updateUser(updatedUser);
        
        Alert.alert('Success', 'Profile logo updated successfully!');
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
            {(profileImage || user?.logo) ? (
              <Image source={{ uri: profileImage || user?.logo }} style={styles.avatar} />
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
            {/* Edit Photo Button */}
            <TouchableOpacity 
              style={styles.editPhotoButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Ionicons name="pencil" size={14} color="#fff" />
            </TouchableOpacity>
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
              <Text style={styles.contactText}>{user?.phone || '+91 9XXXXXXXXX'}</Text>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Profile Photo Section */}
              <Text style={styles.editSectionTitle}>Profile Photo</Text>
              <View style={styles.photoSection}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.editAvatar} />
                ) : (
                  <LinearGradient colors={gradients.premium} style={styles.editAvatarGradient}>
                    <Text style={styles.editAvatarText}>{user?.companyName?.charAt(0) || 'S'}</Text>
                  </LinearGradient>
                )}
                <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.saveButtonGradient}>
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutModal}>
            {/* Icon */}
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={40} color={colors.primary} />
            </View>

            {/* Message */}
            <Text style={styles.logoutTitle}>Logout?</Text>
            <Text style={styles.logoutMessage}>Are you sure you want to logout from your account?</Text>

            {/* Buttons */}
            <View style={styles.logoutButtons}>
              <TouchableOpacity 
                style={[styles.logoutButton, styles.logoutCancelButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.logoutButton, styles.logoutConfirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutConfirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 6,
    borderWidth: 3,
    borderColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 20,
  },
  editSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    marginTop: 16,
  },
  photoSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 40,
  },
  editAvatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 44,
    fontWeight: '700',
    color: '#fff',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  changePhotoText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 8,
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
  },
  phoneValue: {
    fontSize: 16,
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  phoneHint: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  logoutButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  logoutCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  logoutConfirmButton: {
    backgroundColor: colors.primary,
  },
  logoutConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
