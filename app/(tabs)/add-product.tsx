import AddProductScreen from '../../src/screens/AddProductScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Product } from '../../src/data/products';

export default function AddProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse prefillProduct if passed as route param
  let prefillProduct: Product | undefined;
  if (params.prefillProduct) {
    try {
      prefillProduct = JSON.parse(params.prefillProduct as string);
    } catch (e) {
      console.error('Failed to parse prefillProduct:', e);
    }
  }

  return (
    <AddProductScreen 
      navigation={{
        navigate: (screen: string, routeParams?: any) => {
          if (routeParams) {
            router.push({
              pathname: `/products` as any,
              params: routeParams,
            });
          } else {
            router.push(`/products` as any);
          }
        },
        goBack: () => router.back(),
      }}
      prefillProduct={prefillProduct}
    />
  );
}
