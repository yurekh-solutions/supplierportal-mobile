import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { useRouter } from 'expo-router';

export default function Onboarding() {
  const router = useRouter();

  return (
    <OnboardingScreen 
      navigation={{
        navigate: (screen: string, params?: any) => {
          if (screen === 'Login') {
            router.replace('/(auth)/login');
          } else if (screen === 'Status') {
            // Navigate to status screen with email parameter
            router.replace({
              pathname: '/(auth)/status',
              params: { email: params?.email || '' }
            });
          }
        },
        goBack: () => router.back(),
      }}
      onSubmitSuccess={(email: string) => {
        // Navigate to status screen after successful submission
        router.replace({
          pathname: '/(auth)/status',
          params: { email }
        });
      }}
    />
  );
}
