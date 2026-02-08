import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { getMyProducts } from '../../src/lib/api';
import { colors, shadows, borderRadius } from '../../src/styles/colors';

// Helper to sanitize and get the proper image URL
const getImageUrl = (imageUrl: string | undefined | null): string | null => {
  if (!imageUrl || imageUrl.trim() === '') return null;
  
  const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://backendmatrix.onrender.com';
  
  // If URL contains filesystem paths like /opt/render/project/src/uploads/, extract just the /uploads/ part
  if (imageUrl.includes('/uploads/')) {
    const uploadsIndex = imageUrl.indexOf('/uploads/');
    const cleanPath = imageUrl.substring(uploadsIndex);
    return `${API_BASE}${cleanPath}`;
  }
  
  // If it's a Cloudinary URL or other external URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Check if it's NOT a malformed URL with filesystem paths
    if (!imageUrl.includes('/opt/') && !imageUrl.includes('/render/')) {
      return imageUrl;
    }
  }
  
  // Relative URL - prepend API base
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${API_BASE}${cleanPath}`;
};

// Product Image Component with error handling and retry logic
const ProductImage = ({ imageUrl, style }: { imageUrl: string | undefined | null; style: any }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  
  const validUrl = getImageUrl(imageUrl);
  
  // Update currentUrl when validUrl changes
  useEffect(() => {
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
      <View style={[style, styles.imagePlaceholder]}>
        <Ionicons name="cube-outline" size={40} color={colors.textLight} />
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
        <View style={[style, styles.imagePlaceholder]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

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
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <ProductImage imageUrl={item.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'active' && styles.statusActive,
          item.status === 'pending' && styles.statusPending,
        ]}>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.backgroundPink, colors.background]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <Text style={styles.headerSubtitle}>{products.length} products listed</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Products Yet</Text>
          <Text style={styles.emptySubtitle}>Add your first product to start selling</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  productList: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.sm,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
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
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});
