import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { getMyProducts } from '../../src/lib/api';
import { getImageUrl } from '../../src/lib/imageUtils';
import { colors, shadows, borderRadius } from '../../src/styles/colors';
import { predefinedProducts, PRODUCT_IMAGES } from '../../src/data/products';

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

  const renderProduct = ({ item }: { item: any }) => {
    // Try to find a matching predefined product for fallback image
    const matchingPredefinedProduct = predefinedProducts.find(
      p => p.name.toLowerCase() === item.name.toLowerCase()
    );
    
    const fallbackImageKey = matchingPredefinedProduct?.imageKey;
    const fallbackImage = fallbackImageKey ? PRODUCT_IMAGES[fallbackImageKey] : null;

    return (
      <View style={styles.productCard}>
        {/* Use fallback image if database image is broken */}
        {!item.image || getImageUrl(item.image) === null ? (
          fallbackImage ? (
            <Image 
              source={fallbackImage}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={40} color={colors.textLight} />
            </View>
          )
        ) : (
          <ProductImage imageUrl={item.image} style={styles.productImage} />
        )}
        
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
  };

  const renderPredefinedProduct = ({ item }: { item: any }) => {
    const imageKey = item.imageKey;
    const image = imageKey ? PRODUCT_IMAGES[imageKey] : null;

    return (
      <View style={styles.productCard}>
        {image ? (
          <Image 
            source={image}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={40} color={colors.textLight} />
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.statusText, { color: colors.primary }]}>
              Template
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
        <FlatList
          data={predefinedProducts.slice(0, 8)}
          keyExtractor={(item) => item.id}
          renderItem={renderPredefinedProduct}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
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
