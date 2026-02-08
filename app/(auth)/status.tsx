import SupplierStatusScreen from '../../src/screens/SupplierStatusScreen';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Status() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <SupplierStatusScreen 
      email={email}
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Login') {
            router.replace('/(auth)/login');
          } else if (screen === 'Onboarding') {
            router.replace('/(auth)/onboarding');
          }
        },
        goBack: () => router.back(),
      }}
      onLoginPress={() => router.replace('/(auth)/login')}
      onReapplyPress={() => router.replace('/(auth)/onboarding')}
      onBackPress={() => router.replace('/(auth)/login')}
    />
  );
}
