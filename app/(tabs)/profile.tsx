import ProfileScreen from '../../src/screens/ProfileScreen';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  return (
    <ProfileScreen 
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Dashboard') {
            router.push('/(tabs)/dashboard');
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
