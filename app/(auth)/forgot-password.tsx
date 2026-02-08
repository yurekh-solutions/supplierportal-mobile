import ForgotPasswordScreen from '../../src/screens/ForgotPasswordScreen';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <ForgotPasswordScreen 
      navigation={{
        goBack: () => router.back(),
      }}
      onBack={() => router.back()}
    />
  );
}
