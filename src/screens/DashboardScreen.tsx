import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getMyProducts } from '../lib/api';
import { colors, gradients, shadows, borderRadius, spacing } from '../styles/colors';
import { predefinedProducts, Product as DataProduct, PRODUCT_IMAGES } from '../data/products';
import { getImageUrl } from '../lib/imageUtils';

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
  warning: colors.warning,
  error: colors.error,
};

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  image?: string;
  price?: { amount?: number };
  createdAt?: string;
}

interface DashboardScreenProps {
  navigation: any;
}

// Product Image Component with error handling and retry logic
const ApiProductImage = ({ imageUrl, style, placeholderStyle }: { imageUrl: string | undefined | null; style: any; placeholderStyle?: any }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  
  const validUrl = getImageUrl(imageUrl);
  
  // Update currentUrl when validUrl changes
  React.useEffect(() => {
    setCurrentUrl(validUrl);
    setRetryCount(0);
    setError(false);
    setLoading(true);
  }, [validUrl]);
  
  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);
  
  const handleError = useCallback(() => {
    // Retry up to 2 times on failure
    if (retryCount < 2 && currentUrl) {
      console.log(`Image load failed, retry ${retryCount + 1}/2:`, currentUrl);
      setRetryCount(prev => prev + 1);
      // Force re-render with cache-busted URL
      const separator = currentUrl.includes('?') ? '&' : '?';
      setCurrentUrl(`${currentUrl.split('?')[0]}${separator}_retry=${Date.now()}`);
    } else {
      console.log('Image load failed after retries:', currentUrl);
      setLoading(false);
      setError(true);
    }
  }, [retryCount, currentUrl]);
  
  if (!currentUrl || error) {
    return (
      <View style={[style, placeholderStyle || { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
      </View>
    );
  }
  
  return (
    <View style={style}>
      <Image
        source={{ uri: currentUrl }}
        style={[style, { position: 'absolute' }]}
        resizeMode="cover"
        onLoad={handleLoad}
        onError={handleError}
      />
      {loading && (
        <View style={[style, placeholderStyle || { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<DataProduct[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Generate dynamic recommendations based on user's products
    if (products.length > 0) {
      const userCategories = [...new Set(products.map(p => p.category))];
      console.log('📦 User has products in categories:', userCategories);
      
      // Get recommendations from different categories than user already has
      const recommendations = predefinedProducts.filter(p => {
        // Prioritize categories user hasn't added yet
        return !userCategories.includes(p.category);
      }).slice(0, 4);
      
      // If user has products in all categories, show popular products
      if (recommendations.length < 4) {
        const fallback = predefinedProducts.slice(0, 4);
        console.log('✅ Showing fallback recommendations (4 products)');
        setRecommendedProducts(fallback);
      } else {
        console.log('✅ Showing dynamic recommendations:', recommendations.map(r => r.name));
        setRecommendedProducts(recommendations);
      }
    } else {
      // For new users, show diverse categories
      const diverseRecommendations = [
        predefinedProducts.find(p => p.category === 'mild-steel'),
        predefinedProducts.find(p => p.category === 'stainless-steel'),
        predefinedProducts.find(p => p.category === 'construction'),
        predefinedProducts.find(p => p.category === 'electrical'),
      ].filter(Boolean) as DataProduct[];
      console.log('✅ New user - showing diverse categories:', diverseRecommendations.map(r => `${r.name} (${r.category})`));
      setRecommendedProducts(diverseRecommendations);
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await getMyProducts();
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    successRate: products.length > 0 
      ? Math.round((products.filter(p => p.status === 'active').length / products.length) * 100) 
      : 0,
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    // Try to find a matching predefined product to use its image as fallback
    const matchingPredefinedProduct = predefinedProducts.find(
      p => p.name.toLowerCase() === product.name.toLowerCase()
    );
    
    // Get the fallback image from predefined products if available
    const fallbackImageKey = matchingPredefinedProduct?.imageKey;
    const fallbackImage = fallbackImageKey ? PRODUCT_IMAGES[fallbackImageKey] : null;

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product })}
      >
        {/* If database image is broken, use predefined product image */}
        {!product.image || getImageUrl(product.image) === null ? (
          fallbackImage ? (
            <Image 
              source={fallbackImage}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.productImagePlaceholder]}>
              <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
            </View>
          )
        ) : (
          <ApiProductImage 
            imageUrl={product.image} 
            style={styles.productImage}
            placeholderStyle={styles.productImagePlaceholder}
          />
        )}
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <View style={[
              styles.statusBadge,
              product.status === 'active' && styles.statusActive,
              product.status === 'pending' && styles.statusPending,
              product.status === 'rejected' && styles.statusRejected,
            ]}>
              <Text style={[
                styles.statusText,
                product.status === 'active' && styles.statusTextActive,
                product.status === 'pending' && styles.statusTextPending,
                product.status === 'rejected' && styles.statusTextRejected,
              ]}>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const AutomationTool = ({ icon, title, subtitle, metric, metricColor, onPress }: any) => (
    <TouchableOpacity style={styles.automationCard} onPress={onPress}>
      <View style={[styles.automationIcon, { backgroundColor: `${COLORS.primary}15` }]}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.automationContent}>
        <Text style={styles.automationTitle}>{title}</Text>
        <Text style={styles.automationSubtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.automationMetric, { color: metricColor || COLORS.success }]}>
        {metric}
      </Text>
    </TouchableOpacity>
  );

  // AI Recommended Product Card - Clean Design
  const RecommendedProductCard = ({ product }: { product: DataProduct }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    
    // Format category name
    const formatCategory = (cat: string) => {
      return cat.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    // Get the actual image source - use imageKey for reliable lookup
    const getImageSource = () => {
      if (product.imageKey && PRODUCT_IMAGES[product.imageKey]) {
        return PRODUCT_IMAGES[product.imageKey];
      }
      return product.image;
    };

    const imageSource = getImageSource();

    return (
      <TouchableOpacity 
        style={styles.recommendedCard}
        onPress={() => {
          console.log('Navigating to AddProduct with:', product.name);
          navigation.navigate('AddProduct', { prefillProduct: JSON.stringify(product) });
        }}
      >
        {/* Product Image */}
        <View style={styles.recommendedImageContainer}>
          {imageSource && !imageError ? (
            <>
              <Image 
                source={imageSource}
                style={styles.recommendedImage}
                resizeMode="cover"
                onLoad={() => {
                  setImageLoading(false);
                  console.log(`\u2705 Image loaded: ${product.name}`);
                }}
                onError={(error) => {
                  setImageLoading(false);
                  setImageError(true);
                  console.error(`\u274c Image failed: ${product.name}`, error.nativeEvent);
                }}
              />
              {imageLoading && (
                <View style={[styles.recommendedImagePlaceholder, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.recommendedImagePlaceholder}>
              <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
            </View>
          )}
        </View>
        
        {/* Product Info */}
        <View style={styles.recommendedInfo}>
          <Text style={styles.recommendedName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.recommendedDescription} numberOfLines={2}>
            {product.description}
          </Text>
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{formatCategory(product.category)}</Text>
          </View>
          
          {/* Add Product Button */}
          <TouchableOpacity 
            style={styles.addProductBtn}
            onPress={() => {
              console.log('Add button clicked for:', product.name);
              navigation.navigate('AddProduct', { prefillProduct: JSON.stringify(product) });
            }}
          >
            <LinearGradient
              colors={['#D84315', '#BF360C']}
              style={styles.addProductBtnGradient}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addProductBtnText}>Add Product</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.background]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoWrapper}>
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>ritz yard</Text>
            <Text style={styles.headerTagline}>Where Value Meets Velocity</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Company Info Card */}
        <View style={styles.companyCard}>
          <View style={styles.companyAvatar}>
            {user?.logo ? (
              <Image source={{ uri: user.logo }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.companyName?.charAt(0) || 'S'}
              </Text>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{user?.companyName || 'Supplier'}</Text>
            <View style={styles.companyMeta}>
              <Ionicons name="cube" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{stats.total} Products</Text>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} style={{ marginLeft: 10 }} />
              <Text style={styles.metaText}>{stats.successRate}% Success</Text>
            </View>
          </View>
          <View style={styles.companyStats}>
            <Text style={[styles.bigStat, { color: COLORS.primary }]}>{stats.total}</Text>
            <Text style={styles.bigStatLabel}>Products</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            title="TOTAL" 
            value={stats.total} 
            icon="cube" 
            color={COLORS.primary}
            subtitle="Products"
          />
          <StatCard 
            title="ACTIVE" 
            value={stats.active} 
            icon="checkmark-circle" 
            color={COLORS.success}
            subtitle="Published"
          />
          <StatCard 
            title="PENDING" 
            value={stats.pending} 
            icon="time" 
            color={COLORS.warning}
            subtitle="In Review"
          />
          <StatCard 
            title="SUCCESS" 
            value={`${stats.successRate}%`} 
            icon="trending-up" 
            color={COLORS.success}
            subtitle="Approval Rate"
          />
        </View>

        {/* Add Product Button */}
        <TouchableOpacity 
          style={styles.addProductButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <LinearGradient
            colors={gradients.premium}
            style={styles.addProductGradient}
          >
            <Ionicons name="add-circle" size={22} color="#fff" />
            <Text style={styles.addProductText}>Add New Product</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recommended by AI Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.aiHeaderIcon}>
              <Ionicons name="sparkles" size={20} color="#D84315" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.sectionTitle}>Recommended by AI ✨</Text>
              <Text style={styles.sectionSubtitle}>AI-powered recommendations based on your product additions</Text>
            </View>
          </View>

          {/* 2x2 Grid Layout */}
          <View style={styles.recommendedGrid}>
            {recommendedProducts.map((product) => (
              <RecommendedProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>

        {/* Business Automation Suite - HIDDEN ON MOBILE */}
        {/* Commented out: Will be visible on website only */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={gradients.premium}
              style={styles.sectionIcon}
            >
              <Ionicons name="flash" size={18} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.sectionTitle}>Business Automation Suite</Text>
              <Text style={styles.sectionSubtitle}>Smart tools to scale your business</Text>
            </View>
          </View>

          <View style={styles.automationGrid}>
            <AutomationTool 
              icon="chatbubble"
              title="Auto Reply Manager"
              subtitle="Respond 24/7"
              metric="+78%"
            />
            <AutomationTool 
              icon="analytics"
              title="Lead Scoring"
              subtitle="Identify leads"
              metric="+45%"
            />
            <AutomationTool 
              icon="layers"
              title="Smart Inventory"
              subtitle="Stock tracking"
              metric="+55%"
            />
            <AutomationTool 
              icon="trending-up"
              title="Price Optimizer"
              subtitle="Dynamic pricing"
              metric="+25%"
            />
          </View>
        </View> */}

        {/* Recent Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length === 0 ? (
            // Show predefined products if no database products exist
            <FlatList
              data={predefinedProducts.slice(0, 4)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RecommendedProductCard product={item} />}
              scrollEnabled={false}
            />
          ) : (
            <FlatList
              data={products.slice(0, 4)}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <ProductCard product={item} />}
              scrollEnabled={false}
            />
          )}
        </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrapper: {
    ...shadows.sm,
  },
  logoGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerTagline: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 20,
    ...shadows.md,
  },
  companyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  companyStats: {
    alignItems: 'center',
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  bigStat: {
    fontSize: 28,
    fontWeight: '700',
  },
  bigStatLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  addProductButton: {
    marginBottom: 24,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  addProductGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  addProductText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textLight,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  automationGrid: {
    gap: 10,
  },
  automationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 14,
    ...shadows.sm,
  },
  automationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  automationContent: {
    flex: 1,
  },
  automationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  automationSubtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
  automationMetric: {
    fontSize: 14,
    fontWeight: '700',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 12,
    ...shadows.sm,
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  statusActive: {
    backgroundColor: colors.successLight,
  },
  statusPending: {
    backgroundColor: colors.warningLight,
  },
  statusRejected: {
    backgroundColor: colors.errorLight,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextRejected: {
    color: colors.error,
  },
  productCategory: {
    fontSize: 13,
    color: colors.textLight,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
  },
  // Recommended by AI Styles - 2x2 Grid Layout
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  recommendedCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.sm,
  },
  recommendedImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  recommendedImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  recommendedDescription: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 8,
    lineHeight: 15,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundPink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  addProductBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addProductBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  addProductBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
