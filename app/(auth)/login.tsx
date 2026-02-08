import LoginScreen from '../../src/screens/LoginScreen';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  return (
    <LoginScreen 
      navigation={{
        navigate: (screen: string) => {
          if (screen === 'Onboarding') {
            router.push('/(auth)/onboarding');
          } else if (screen === 'ForgotPassword') {
            router.push('/(auth)/forgot-password');
          } else if (screen === 'Status') {
            router.push('/(auth)/status');
          }
        },
        goBack: () => router.back(),
      }}
      onLoginSuccess={() => router.replace('/(tabs)/dashboard')}
      onCheckStatusPress={(email: string) => router.push({ pathname: '/(auth)/status', params: { email } })}
    />
  );
}
