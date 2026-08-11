import { router } from 'expo-router';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { steps } from '@/data/onboarding-steps';
import { useOnboardingStore } from '@/store';

function Screen() {
  const complete = useOnboardingStore(s => s.complete);

  function completeOnboarding() {
    complete();
    router.replace('/(auth)/login');
  }

  return <OnboardingScreen steps={steps} onComplete={completeOnboarding} />;
}

export { Screen as OnboardingScreen };
