import DashboardScreen from '../../src/screens/DashboardScreen';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();

  return (
    <DashboardScreen 
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === 'AddProduct') {
            // Pass params including prefillProduct
            if (params?.prefillProduct) {
              router.push({
                pathname: '/(tabs)/add-product',
                params: { prefillProduct: params.prefillProduct },
              });
            } else {
              router.push('/(tabs)/add-product');
            }
          } else if (screen === 'Products') {
            router.push('/(tabs)/products');
          } else if (screen === 'ProductDetail') {
            router.push({ pathname: '/(tabs)/products', params });
          } else if (screen === 'Login') {
            router.replace('/(auth)/login');
          }
        },
        goBack: () => router.back(),
        reset: ({ index, routes }: any) => {
          if (routes[0].name === 'Login') {
            router.replace('/(auth)/login');
          }
        },
      }}
    />
  );
}
