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
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { submitSupplierApplication, wakeUpServer } from '../lib/api';
import { colors, gradients, shadows, borderRadius } from '../styles/colors';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  secondary: colors.backgroundPink,
  background: colors.background,
  white: colors.card,
  text: colors.text,
  textLight: colors.textLight,
  border: colors.border,
  success: colors.success,
  error: colors.error,
  warning: '#eab308',
};

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface OnboardingScreenProps {
  navigation: any;
  onSubmitSuccess?: (email: string) => void;
}

export default function OnboardingScreen({ navigation, onSubmitSuccess }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    contactPerson: '',
    businessType: 'business',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    businessDescription: '',
    productsOffered: '',
    yearsInBusiness: '',
  });

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Document states
  const [documents, setDocuments] = useState<{
    pan: DocumentFile | null;
    gst: DocumentFile | null;
    cin: DocumentFile | null;
    aadhaar: DocumentFile | null;
    businessLicense: DocumentFile | null;
    bankProof: DocumentFile | null;
  }>({
    pan: null,
    gst: null,
    cin: null,
    aadhaar: null,
    businessLicense: null,
    bankProof: null,
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const pickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const pickDocument = async (docType: keyof typeof documents) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/octet-stream',
            size: asset.size,
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const removeDocument = (docType: keyof typeof documents) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
  };

  // Helper function to append file to FormData (handles web vs native)
  const appendFileToFormData = async (
    formData: FormData,
    fieldName: string,
    file: { uri: string; name: string; type: string }
  ) => {
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileObj = new File([blob], file.name, { type: file.type });
        formData.append(fieldName, fileObj);
        console.log(`  ✅ ${fieldName} converted to File object for web`);
      } catch (error) {
        console.error(`  ❌ Failed to convert ${fieldName}:`, error);
        throw new Error(`Failed to process ${fieldName} document`);
      }
    } else {
      // For native platforms, use the uri/name/type format
      formData.append(fieldName, {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }
  };

  const handleSubmit = async () => {
    console.log('🔍 Starting validation...');
    
    // Collect all missing fields
    const missingFields: string[] = [];
    
    // Validate Step 1 fields
    if (!formData.companyName) missingFields.push('Company Name');
    if (!formData.email) missingFields.push('Email');
    if (!formData.phone) missingFields.push('Phone');
    if (!formData.contactPerson) missingFields.push('Contact Person');
    if (!formData.password) missingFields.push('Password');
    if (!formData.confirmPassword) missingFields.push('Confirm Password');
    
    // Validate address fields
    if (!formData.address.street) missingFields.push('Street Address');
    if (!formData.address.city) missingFields.push('City');
    if (!formData.address.state) missingFields.push('State');
    if (!formData.address.pincode) missingFields.push('Pincode');
    if (!formData.address.country) missingFields.push('Country');
    
    // Check if any Step 1 fields are missing
    if (missingFields.length > 0) {
      console.error('❌ Missing Step 1 fields:', missingFields);
      Alert.alert(
        'Missing Required Fields - Step 1',
        `Please fill the following fields:\n\n${missingFields.map(f => `• ${f}`).join('\n')}`,
        [{ text: 'OK', onPress: () => setStep(1) }]
      );
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 6 characters long.',
        [{ text: 'OK', onPress: () => setStep(1) }]
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Passwords do not match. Please re-enter them.',
        [{ text: 'OK', onPress: () => setStep(1) }]
      );
      return;
    }

    // Validate Step 2 fields
    const missingStep2Fields: string[] = [];
    if (!formData.businessDescription) missingStep2Fields.push('Business Description');
    if (!formData.productsOffered) missingStep2Fields.push('Products/Services Offered');
    if (!formData.yearsInBusiness) missingStep2Fields.push('Years in Business');
    
    if (missingStep2Fields.length > 0) {
      console.error('❌ Missing Step 2 fields:', missingStep2Fields);
      Alert.alert(
        'Missing Required Fields - Step 2',
        `Please fill the following fields:\n\n${missingStep2Fields.map(f => `• ${f}`).join('\n')}`,
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
      return;
    }

    // Validate Step 3 - PAN and Bank Proof are REQUIRED
    if (!documents.pan) {
      console.error('❌ PAN document missing');
      Alert.alert(
        'Document Required',
        'PAN Card is mandatory for verification. Please upload your PAN Card document.',
        [{ text: 'OK', onPress: () => setStep(3) }]
      );
      return;
    }

    if (!documents.bankProof) {
      console.error('❌ Bank Proof document missing');
      Alert.alert(
        'Document Required',
        'Bank Proof is mandatory for verification. Please upload your bank statement or cancelled cheque.',
        [{ text: 'OK', onPress: () => setStep(3) }]
      );
      return;
    }

    if (!termsAccepted) {
      Alert.alert(
        'Terms & Conditions',
        'Please read and accept the Terms and Conditions to proceed.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('✅ All validation passed!');
    setLoading(true);

    try {
      // Wake up the server first (Render free tier goes to sleep after inactivity)
      // This helps prevent timeout on the main submission
      await wakeUpServer();
      
      console.log('🔧 Creating FormData...');
      const submitData = new FormData();
      
      // Append form fields
      console.log('📋 Appending form fields...');
      submitData.append('companyName', formData.companyName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('contactPerson', formData.contactPerson);
      submitData.append('businessType', formData.businessType);
      submitData.append('password', formData.password);
      submitData.append('address', JSON.stringify(formData.address));
      submitData.append('businessDescription', formData.businessDescription);
      // Parse products offered as array, then stringify it (backend will parse once)
      const productsArray = formData.productsOffered.split(',').map(p => p.trim()).filter(p => p.length > 0);
      submitData.append('productsOffered', JSON.stringify(productsArray));
      submitData.append('yearsInBusiness', formData.yearsInBusiness);
      
      console.log('📄 Form fields:', {
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        businessType: formData.businessType,
        productsOffered: productsArray,
        yearsInBusiness: formData.yearsInBusiness,
      });

      // Append logo if selected
      if (logoUri) {
        console.log('🖼️ Appending logo:', logoUri);
        const filename = logoUri.split('/').pop() || 'logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // For web platform, convert to File object
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(logoUri);
            const blob = await response.blob();
            const file = new File([blob], filename, { type });
            submitData.append('logo', file);
            console.log('✅ Logo converted to File object for web');
          } catch (error) {
            console.error('❌ Failed to convert logo:', error);
            // Logo is optional, so just log and continue
          }
        } else {
          submitData.append('logo', {
            uri: logoUri,
            name: filename,
            type,
          } as any);
        }
        
        console.log('✅ Logo appended:', { name: filename, type });
      }

      // Append documents
      console.log('📎 Appending documents...');
      
      // Check platform and warn about web limitations
      if (Platform.OS === 'web') {
        console.warn('⚠️ Running on web - file uploads may have issues');
      }
      
      if (documents.pan) {
        console.log('  ✅ PAN:', documents.pan.name);
        await appendFileToFormData(submitData, 'pan', documents.pan);
      } else {
        console.error('  ❌ PAN document missing!');
      }

      if (documents.gst) {
        console.log('  ✅ GST:', documents.gst.name);
        await appendFileToFormData(submitData, 'gst', documents.gst);
      }

      if (documents.cin) {
        console.log('  ✅ CIN:', documents.cin.name);
        await appendFileToFormData(submitData, 'cin', documents.cin);
      }

      if (documents.aadhaar) {
        console.log('  ✅ Aadhaar:', documents.aadhaar.name);
        await appendFileToFormData(submitData, 'aadhaar', documents.aadhaar);
      }

      if (documents.businessLicense) {
        console.log('  ✅ Business License:', documents.businessLicense.name);
        await appendFileToFormData(submitData, 'businessLicense', documents.businessLicense);
      }

      if (documents.bankProof) {
        console.log('  ✅ Bank Proof:', documents.bankProof.name);
        await appendFileToFormData(submitData, 'bankProof', documents.bankProof);
      }

      console.log('🚀 Submitting application to backend...');
      console.log('🌐 API URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('📊 Platform:', Platform.OS);
      
      const response = await submitSupplierApplication(submitData);
      console.log('📥 Response received:', response);

      if (response.success) {
        setLoading(false);
        setShowSuccessModal(true);
      } else {
        console.error('❌ Application submission failed:', response.message);
        Alert.alert(
          'Submission Failed',
          response.message || 'Failed to submit application. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Critical error during submission:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      const isNetworkError = errorMessage.includes('Network') || 
                            errorMessage.includes('timeout') || 
                            errorMessage.includes('ECONNABORTED');
      
      Alert.alert(
        isNetworkError ? 'Network Error' : 'Error',
        isNetworkError 
          ? 'Unable to connect to server. Please check your internet connection and try again.'
          : errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.companyName || !formData.email || !formData.phone || !formData.contactPerson) {
        Alert.alert('Required Fields', 'Please fill all required fields');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        Alert.alert('Invalid Password', 'Password must be at least 6 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Password Mismatch', 'Passwords do not match');
        return;
      }
    }
    if (step === 2) {
      if (!formData.businessDescription || !formData.productsOffered || !formData.yearsInBusiness) {
        Alert.alert('Required Fields', 'Please fill all required fields');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const steps = [
    { number: 1, title: 'Company Info', icon: 'business' },
    { number: 2, title: 'Business Details', icon: 'document-text' },
    { number: 3, title: 'Documents', icon: 'folder-open' },
  ];

  const renderDocumentUpload = (
    docKey: keyof typeof documents,
    label: string,
    required: boolean = false,
    showForBusiness: boolean = true,
    showForIndividual: boolean = true
  ) => {
    const shouldShow = (formData.businessType === 'business' && showForBusiness) ||
                       (formData.businessType === 'individual' && showForIndividual);
    
    if (!shouldShow) return null;

    const doc = documents[docKey];
    
    return (
      <View style={styles.documentCard} key={docKey}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <LinearGradient colors={gradients.premium} style={styles.documentIcon}>
              <Ionicons name="document-text" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentLabelRow}>
              <Text style={styles.documentLabel}>{label}</Text>
              {required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredBadgeText}>Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.documentHint}>PDF, JPG, PNG (Max 5MB)</Text>
          </View>
        </View>
        
        {!doc ? (
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={() => pickDocument(docKey)}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.uploadedFile}>
            <View style={styles.fileInfo}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.fileName} numberOfLines={1}>{doc.name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeDocument(docKey)}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // New document upload with badge type support
  const renderDocumentUploadNew = (
    docKey: keyof typeof documents,
    label: string,
    badgeType: 'required' | 'optional' | 'recommended'
  ) => {
    const doc = documents[docKey];
    
    const getBadgeStyle = () => {
      switch (badgeType) {
        case 'required':
          return { bg: '#fee2e2', text: '#dc2626' };
        case 'optional':
          return { bg: '#e0e7ff', text: '#4f46e5' };
        case 'recommended':
          return { bg: '#fef3c7', text: '#d97706' };
      }
    };
    
    const badge = getBadgeStyle();
    const badgeLabel = badgeType.charAt(0).toUpperCase() + badgeType.slice(1);
    
    return (
      <View style={styles.documentCard} key={docKey}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <LinearGradient colors={gradients.premium} style={styles.documentIcon}>
              <Ionicons name="document-text" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentLabelRow}>
              <Text style={styles.documentLabel}>{label}</Text>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badgeLabel}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.filePickerRow}>
          <TouchableOpacity 
            style={styles.chooseFileButton} 
            onPress={() => pickDocument(docKey)}
          >
            <Text style={styles.chooseFileText}>Choose file</Text>
          </TouchableOpacity>
          <Text style={styles.fileNameText} numberOfLines={1}>
            {doc ? doc.name : 'No file chosen'}
          </Text>
          {doc && (
            <TouchableOpacity onPress={() => removeDocument(docKey)}>
              <Ionicons name="close-circle" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={gradients.premium}
                style={styles.logoGradient}
              >
                <Image
                  source={require('../assets/ritz.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>ritz yard</Text>
            <Text style={styles.headerTagline}>Where Value Meets Velocity</Text>
            <Text style={styles.headerSubtitle}>Step {step} of 3 - {steps[step - 1].title}</Text>
          </View>

          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            {steps.map((s, index) => (
              <View key={s.number} style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  step >= s.number && styles.stepCircleActive,
                  step > s.number && styles.stepCircleCompleted,
                ]}>
                  {step > s.number ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <Ionicons 
                      name={s.icon as any} 
                      size={16} 
                      color={step >= s.number ? '#fff' : COLORS.textLight} 
                    />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    step > s.number && styles.stepLineActive,
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Step 1: Company Info */}
            {step === 1 && (
              <View>
                <Text style={styles.sectionTitle}>Company Information</Text>

                {/* Company Logo */}
                <TouchableOpacity style={styles.logoUpload} onPress={pickLogo}>
                  {logoUri ? (
                    <Image source={{ uri: logoUri }} style={styles.uploadedLogo} />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                      <Text style={styles.logoUploadText}>Add Logo</Text>
                      <Text style={styles.logoUploadHint}>(Optional)</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Company Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Name *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="business" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChangeText={(v) => handleInputChange('companyName', v)}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="mail" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="company@example.com"
                      value={formData.email}
                      onChangeText={(v) => handleInputChange('email', v)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="call" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="+91 XXXXXXXXXX"
                      value={formData.phone}
                      onChangeText={(v) => handleInputChange('phone', v)}
                      keyboardType="phone-pad"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                {/* Contact Person */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact Person *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="person" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Full name"
                      value={formData.contactPerson}
                      onChangeText={(v) => handleInputChange('contactPerson', v)}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                {/* Business Type */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Type *</Text>
                  <View style={styles.businessTypeRow}>
                    <TouchableOpacity 
                      style={[
                        styles.businessTypeOption,
                        formData.businessType === 'business' && styles.businessTypeActive
                      ]}
                      onPress={() => handleInputChange('businessType', 'business')}
                    >
                      <Ionicons 
                        name="business" 
                        size={20} 
                        color={formData.businessType === 'business' ? COLORS.primary : COLORS.textLight} 
                      />
                      <Text style={[
                        styles.businessTypeText,
                        formData.businessType === 'business' && styles.businessTypeTextActive
                      ]}>Business/Company</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.businessTypeOption,
                        formData.businessType === 'individual' && styles.businessTypeActive
                      ]}
                      onPress={() => handleInputChange('businessType', 'individual')}
                    >
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={formData.businessType === 'individual' ? COLORS.primary : COLORS.textLight} 
                      />
                      <Text style={[
                        styles.businessTypeText,
                        formData.businessType === 'individual' && styles.businessTypeTextActive
                      ]}>Individual</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="lock-closed" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChangeText={(v) => handleInputChange('password', v)}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="lock-closed" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChangeText={(v) => handleInputChange('confirmPassword', v)}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor={COLORS.textLight}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Address */}
                <Text style={styles.sectionTitle}>Address</Text>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="location" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="Street Address"
                      value={formData.address.street}
                      onChangeText={(v) => handleAddressChange('street', v)}
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <View style={styles.inputContainerSmall}>
                      <TextInput
                        style={styles.inputSmall}
                        placeholder="City"
                        value={formData.address.city}
                        onChangeText={(v) => handleAddressChange('city', v)}
                        placeholderTextColor={COLORS.textLight}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <View style={styles.inputContainerSmall}>
                      <TextInput
                        style={styles.inputSmall}
                        placeholder="State"
                        value={formData.address.state}
                        onChangeText={(v) => handleAddressChange('state', v)}
                        placeholderTextColor={COLORS.textLight}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <View style={styles.inputContainerSmall}>
                      <TextInput
                        style={styles.inputSmall}
                        placeholder="Pincode"
                        value={formData.address.pincode}
                        onChangeText={(v) => handleAddressChange('pincode', v)}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textLight}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <View style={styles.inputContainerSmall}>
                      <TextInput
                        style={styles.inputSmall}
                        placeholder="Country"
                        value={formData.address.country}
                        onChangeText={(v) => handleAddressChange('country', v)}
                        placeholderTextColor={COLORS.textLight}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <View>
                <Text style={styles.sectionTitle}>Business Details</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Description *</Text>
                  <View style={[styles.inputContainerMultiline]}>
                    <TextInput
                      style={[styles.inputMultiline]}
                      placeholder="Describe your business and what you offer..."
                      value={formData.businessDescription}
                      onChangeText={(v) => handleInputChange('businessDescription', v)}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Products/Services Offered *</Text>
                  <View style={[styles.inputContainerMultiline]}>
                    <TextInput
                      style={[styles.inputMultiline, { minHeight: 80 }]}
                      placeholder="Enter products separated by commas (e.g., Steel, Cement, Wood)"
                      value={formData.productsOffered}
                      onChangeText={(v) => handleInputChange('productsOffered', v)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Years in Business *</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient colors={gradients.premium} style={styles.inputIconGradient}>
                      <Ionicons name="calendar" size={18} color="#fff" />
                    </LinearGradient>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 5"
                      value={formData.yearsInBusiness}
                      onChangeText={(v) => handleInputChange('yearsInBusiness', v)}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.info} />
                  <Text style={styles.infoText}>
                    Next step: Upload required documents for verification. PAN Card is mandatory.
                  </Text>
                </View>
              </View>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <View>
                <Text style={styles.sectionTitle}>Document Upload</Text>

                <View style={styles.documentInfoBox}>
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                  <Text style={styles.documentInfoText}>
                    Upload required documents for verification. Your documents are securely stored.
                  </Text>
                </View>

                {/* PAN Card - REQUIRED */}
                {renderDocumentUploadNew('pan', 'PAN Card', 'required')}

                {/* Aadhaar Card - OPTIONAL */}
                {renderDocumentUploadNew('aadhaar', 'Aadhaar Card', 'optional')}

                {/* Bank Proof - REQUIRED */}
                {renderDocumentUploadNew('bankProof', 'Bank Proof', 'required')}

                {/* GST/Business License - RECOMMENDED */}
                {renderDocumentUploadNew('gst', 'GST/Business License', 'recommended')}

                {/* Terms */}
                <TouchableOpacity 
                  style={styles.termsContainer}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                    {termsAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>. I confirm that all information provided is accurate.
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.buttonRow}>
              {step > 1 && (
                <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                  <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                  <Text style={styles.prevButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {step < 3 ? (
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                  <LinearGradient
                    colors={gradients.premium}
                    style={styles.nextButtonGradient}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.nextButton, loading && { opacity: 0.6 }]} 
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={gradients.premium}
                    style={styles.nextButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.nextButtonText}>Submit Application</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Already a Supplier */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Already a supplier? </Text>
            <Text style={[styles.loginLinkText, { color: COLORS.primary, fontWeight: '700' }]}>
              Login here
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal - Admin Approval */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Success Icon */}
            <View style={styles.successIconWrapper}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark-circle" size={50} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Application Submitted!</Text>
            
            {/* Message */}
            <Text style={styles.modalMessage}>
              Your supplier application has been successfully submitted and is now pending admin review.
            </Text>

            {/* Info Box */}
            <View style={styles.modalInfoBox}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              <View style={styles.modalInfoTextWrapper}>
                <Text style={styles.modalInfoTitle}>What happens next?</Text>
                <Text style={styles.modalInfoText}>
                  Our admin team will review your application within 24-48 hours. You'll receive an email notification once your application is approved or if we need any additional information.
                </Text>
              </View>
            </View>

            {/* Status Badges */}
            <View style={styles.statusBadgesRow}>
              <View style={[styles.modalBadge, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="hourglass-outline" size={16} color="#d97706" />
                <Text style={[styles.modalBadgeText, { color: '#d97706' }]}>Pending Review</Text>
              </View>
              <View style={[styles.modalBadge, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="mail-outline" size={16} color="#2563eb" />
                <Text style={[styles.modalBadgeText, { color: '#2563eb' }]}>Email Notification</Text>
              </View>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={() => {
                setShowSuccessModal(false);
                onSubmitSuccess?.(formData.email);
                navigation.navigate('Status', { email: formData.email });
              }}
            >
              <LinearGradient
                colors={gradients.premium}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalPrimaryButtonText}>Check Application Status</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.modalSecondaryButtonText}>Go to Login</Text>
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 12,
    ...shadows.md,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerTagline: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: colors.success,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  logoUpload: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  uploadedLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundPink,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoUploadText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  logoUploadHint: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
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
  inputIconGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputSmall: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  inputContainerMultiline: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMultiline: {
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
  },
  eyeButton: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
  },
  businessTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  businessTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 8,
  },
  businessTypeActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  businessTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  businessTypeTextActive: {
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: 16,
    borderRadius: borderRadius.md,
    marginTop: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    lineHeight: 18,
  },
  documentInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.primary}10`,
    padding: 14,
    borderRadius: borderRadius.md,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  documentInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  documentCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIconContainer: {
    marginRight: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  requiredBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requiredBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dc2626',
  },
  documentHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: `${colors.primary}05`,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  uploadedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.success}10`,
    padding: 12,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  fileName: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${colors.error}10`,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  prevButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  nextButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 15,
    color: colors.textLight,
  },
  // New document upload styles
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  chooseFileButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },
  chooseFileText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  fileNameText: {
    flex: 1,
    fontSize: 13,
    color: colors.textLight,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...shadows.lg,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalInfoBox: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalInfoTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  modalInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalInfoText: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  statusBadgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    width: '100%',
    marginBottom: 12,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalPrimaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSecondaryButton: {
    paddingVertical: 12,
  },
  modalSecondaryButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '500',
  },
});
