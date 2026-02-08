import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addProduct, getCategories } from '../lib/api';
import { colors, gradients, shadows, borderRadius } from '../styles/colors';
import { predefinedProducts, Product, PRODUCT_IMAGES } from '../data/products';

const COLORS = {
  primary: colors.primary,
  background: colors.background,
  card: colors.card,
  text: colors.text,
  textLight: colors.textLight,
  border: colors.border,
  success: colors.success,
};

interface AddProductScreenProps {
  navigation: any;
  prefillProduct?: Product;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AddProductScreen({ navigation, prefillProduct }: AddProductScreenProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    minOrder: '10',
    deliveryTime: '3-5 days',
    quality: 'Premium',
    materialStandard: '',
    packaging: '',
    testingCertificate: '',
    availability: 'In Stock',
    brands: [] as string[],
    grades: [] as string[],
    features: [] as string[],
  });

  useEffect(() => {
    fetchCategories();
    // Handle prefill from AI recommendations
    if (prefillProduct) {
      handleSelectProduct(prefillProduct);
    }
  }, [prefillProduct]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    // Handle array fields (brands, grades, features)
    if (name === 'brands' || name === 'grades' || name === 'features') {
      const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
      setFormData(prev => ({ ...prev, [name]: arrayValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Show suggestions when typing product name
    if (name === 'name' && value.trim().length >= 1) {
      const searchTerm = value.toLowerCase().trim();
      const results = predefinedProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm) &&
        (formData.category === '' || product.category === formData.category)
      );
      setSuggestions(results);
      setShowSuggestions(true);
    } else if (name === 'name') {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectProduct = async (product: Product) => {
    // Auto-fill form fields
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: '',
      minOrder: '10',
      deliveryTime: product.specifications?.delivery || '3-5 days',
      quality: product.specifications?.quality || 'Premium',
      materialStandard: product.specifications?.materialStandard || '',
      packaging: product.specifications?.packaging || '',
      testingCertificate: product.specifications?.testingCertificate || '',
      availability: product.specifications?.availability || 'In Stock',
      brands: product.specifications?.brand || [],
      grades: product.specifications?.grades || [],
      features: product.features || [],
    });

    // Auto-fill product image if available
    // First try to use imageKey to lookup from PRODUCT_IMAGES (works after serialization)
    // Then fallback to direct image reference (works for direct selection)
    let imageSource: ImageSourcePropType | null = null;
    
    if (product.imageKey && PRODUCT_IMAGES[product.imageKey]) {
      imageSource = PRODUCT_IMAGES[product.imageKey];
      console.log('📸 Using imageKey to load image:', product.imageKey);
    } else if (product.image && typeof product.image !== 'string') {
      // Direct image reference (number in native, object in web)
      imageSource = product.image;
      console.log('📸 Using direct image reference');
    }
    
    if (imageSource) {
      try {
        // Handle both web and native platforms
        if (Platform.OS === 'web') {
          // On web, require() returns a string URL or object with default property
          let uri: string | null = null;
          if (typeof imageSource === 'string') {
            uri = imageSource;
          } else if (typeof imageSource === 'object' && imageSource !== null) {
            // Webpack might return { default: 'url' } or just the URL
            const src = imageSource as any;
            uri = src.default || src.uri || src;
          }
          if (uri && typeof uri === 'string') {
            setImageUri(uri);
            setImageRetryCount(0);
            setImageLoadError(false);
            console.log('✅ Product image loaded (web):', uri);
          }
        } else {
          // On native, use resolveAssetSource
          const resolved = Image.resolveAssetSource(imageSource);
          if (resolved && resolved.uri) {
            setImageUri(resolved.uri);
            setImageRetryCount(0);
            setImageLoadError(false);
            console.log('✅ Product image loaded (native):', resolved.uri);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load product image:', error);
        // If loading fails, continue without image
      }
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageRetryCount(0);
        setImageLoadError(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.description) {
      Alert.alert('Required Fields', 'Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('category', formData.category);
      productData.append('description', formData.description);
      
      // Optional fields
      if (formData.price) {
        productData.append('price', JSON.stringify({
          amount: parseFloat(formData.price),
          currency: 'INR',
          unit: 'per piece',
        }));
      }
      
      productData.append('stock', JSON.stringify({
        available: true,
        minimumOrder: parseInt(formData.minOrder) || 10,
      }));

      // Additional product fields
      if (formData.materialStandard) {
        productData.append('materialStandard', formData.materialStandard);
      }
      if (formData.packaging) {
        productData.append('packaging', formData.packaging);
      }
      if (formData.testingCertificate) {
        productData.append('testingCertificate', formData.testingCertificate);
      }
      if (formData.deliveryTime) {
        productData.append('deliveryTime', formData.deliveryTime);
      }
      if (formData.quality) {
        productData.append('quality', formData.quality);
      }
      if (formData.availability) {
        productData.append('availability', formData.availability);
      }

      // Arrays
      if (formData.brands.length > 0) {
        productData.append('brands', JSON.stringify(formData.brands));
      }
      if (formData.grades.length > 0) {
        productData.append('grades', JSON.stringify(formData.grades));
      }
      if (formData.features.length > 0) {
        productData.append('features', JSON.stringify(formData.features));
      }

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'product.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        productData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const response = await addProduct(productData);

      if (response.success) {
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          name: '',
          category: '',
          description: '',
          price: '',
          minOrder: '10',
          deliveryTime: '3-5 days',
          quality: 'Premium',
          materialStandard: '',
          packaging: '',
          testingCertificate: '',
          availability: 'In Stock',
          brands: [],
          grades: [],
          features: [],
        });
        setImageUri(null);
        // Auto-close modal and navigate after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }, 3000);
      } else {
        Alert.alert('Error', response.message || 'Failed to add product');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundPink, colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Upload */}
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {imageUri && !imageLoadError ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.uploadedImage}
                  onError={() => {
                    // Retry up to 2 times on failure
                    if (imageRetryCount < 2) {
                      console.log(`Image load failed, retry ${imageRetryCount + 1}/2`);
                      setImageRetryCount(prev => prev + 1);
                      // Force re-render with cache-busted URL
                      const separator = imageUri.includes('?') ? '&' : '?';
                      setImageUri(`${imageUri.split('?')[0]}${separator}_retry=${Date.now()}`);
                    } else {
                      console.log('Image load failed after 2 retries');
                      setImageLoadError(true);
                    }
                  }}
                  onLoad={() => {
                    setImageRetryCount(0);
                    setImageLoadError(false);
                  }}
                />
                <View style={styles.imageOverlay}>
                  <View style={styles.changeImageButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <LinearGradient
                  colors={gradients.premium}
                  style={styles.cameraIcon}
                >
                  <Ionicons name="camera" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.uploadText}>Add Product Image</Text>
                <Text style={styles.uploadSubtext}>Tap to upload or select from suggestions</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            {/* Product Name with Suggestions */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., TMT Bars Fe 500D"
                  value={formData.name}
                  onChangeText={(v) => handleInputChange('name', v)}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <View style={styles.suggestionsHeader}>
                    <Text style={styles.suggestionsHeaderText}>
                      Products ({suggestions.length})
                    </Text>
                    <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                      <Ionicons name="close" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={suggestions.slice(0, 6)}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.suggestionsList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSelectProduct(item)}
                      >
                        <View style={styles.suggestionImageContainer}>
                          {item.image ? (
                            <Image 
                              source={item.image}
                              style={styles.suggestionImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.suggestionImagePlaceholder}>
                              <Ionicons name="cube" size={20} color={colors.primary} />
                            </View>
                          )}
                        </View>
                        <View style={styles.suggestionDetails}>
                          <Text style={styles.suggestionName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.suggestionCategory} numberOfLines={1}>
                            {categories.find(c => c.slug === item.category)?.name || item.category}
                          </Text>
                          {item.specifications?.brand && (
                            <View style={styles.suggestionBrands}>
                              <Text style={styles.suggestionBrandText} numberOfLines={1}>
                                {item.specifications.brand.slice(0, 2).join(', ')}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.suggestionVerifiedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryChip,
                      formData.category === cat.slug && styles.categoryChipActive,
                    ]}
                    onPress={() => handleInputChange('category', cat.slug)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formData.category === cat.slug && styles.categoryChipTextActive,
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start' }]}>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Describe your product specifications..."
                  value={formData.description}
                  onChangeText={(v) => handleInputChange('description', v)}
                  multiline
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Price & Min Order */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price (₹)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="500"
                    value={formData.price}
                    onChangeText={(v) => handleInputChange('price', v)}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Min Order</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    value={formData.minOrder}
                    onChangeText={(v) => handleInputChange('minOrder', v)}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
            </View>

            {/* Delivery Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery Time</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="3-5 days"
                  value={formData.deliveryTime}
                  onChangeText={(v) => handleInputChange('deliveryTime', v)}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Quality/Grade & Material Standard */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Quality/Grade</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="ISI, BIS Certified"
                    value={formData.quality}
                    onChangeText={(v) => handleInputChange('quality', v)}
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Availability</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="In Stock"
                    value={formData.availability}
                    onChangeText={(v) => handleInputChange('availability', v)}
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
            </View>

            {/* Material Standard & Packaging */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Material Standard</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="IS 1786, ASTM A36"
                    value={formData.materialStandard}
                    onChangeText={(v) => handleInputChange('materialStandard', v)}
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Packaging</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Bundle, Pallet"
                    value={formData.packaging}
                    onChangeText={(v) => handleInputChange('packaging', v)}
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
            </View>

            {/* Testing Certificate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Testing Certificate</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="MTC, CTC Available"
                  value={formData.testingCertificate}
                  onChangeText={(v) => handleInputChange('testingCertificate', v)}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Brands */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brands (comma-separated)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="JSW Steel, Tata Steel, SAIL"
                  value={formData.brands.join(', ')}
                  onChangeText={(v) => handleInputChange('brands', v)}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Grades */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grades/Specifications (comma-separated)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Fe 500D, Fe 550D, Fe 600"
                  value={formData.grades.join(', ')}
                  onChangeText={(v) => handleInputChange('grades', v)}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Key Features */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Key Features (comma-separated)</Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start' }]}>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Earthquake Resistant, Superior Ductility, Corrosion Resistant"
                  value={formData.features.join(', ')}
                  onChangeText={(v) => handleInputChange('features', v)}
                  multiline
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={gradients.premium}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={22} color="#fff" />
                    <Text style={styles.submitText}>Add Product</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark-circle" size={60} color="#fff" />
              </LinearGradient>
            </View>

            {/* Success Text */}
            <Text style={styles.successTitle}>Product Added Successfully!</Text>
            <Text style={styles.successMessage}>
              Your product has been submitted and is under admin review. You will be notified once it is approved.
            </Text>

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
              <View style={styles.statusIconWrapper}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statusBadgeText}>Status: Under Admin Review</Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
            >
              <LinearGradient
                colors={gradients.premium}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Go to Products</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Checkbox Confirmation */}
            <View style={styles.confirmationRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.confirmationText}>
                I confirm that the product information is accurate and complete.
              </Text>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageUpload: {
    marginBottom: 20,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: borderRadius.xl,
  },
  cameraIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  uploadSubtext: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 20,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    fontSize: 15,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Suggestions Dropdown Styles
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionsHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  suggestionsList: {
    maxHeight: 260,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '20',
  },
  suggestionImageContainer: {
    marginRight: 12,
  },
  suggestionImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
  },
  suggestionImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionDetails: {
    flex: 1,
    marginRight: 8,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  suggestionBrands: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionBrandText: {
    fontSize: 11,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  suggestionVerifiedBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.lg,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 24,
    width: '100%',
  },
  statusIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  modalButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.md,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  confirmationText: {
    fontSize: 12,
    color: colors.textLight,
    flex: 1,
    lineHeight: 16,
  },
});
