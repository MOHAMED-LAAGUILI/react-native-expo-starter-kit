import { router } from 'expo-router';
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { useOnboardingStore } from '@/store';

const steps = [
  {
    name: 'code-thinking',
    title: 'Hassle free\nshopping experience',
    description:
      'Everything is set up to help you build faster, scale smarter, and deliver high-quality applications from day one.',
  },
  {
    name: 'join-us',
    title: 'Earn margins\nlike never before',
    description:
      'Access the latest updates, features, and best practices. Stay aligned with modern development standards.',
  },
  {
    name: 'meet-the-team',
    title: 'Quick & free\ndelivery to the store',
    description:
      'You\'re ready to go. Explore the project structure, customize your setup, and start building with confidence.',
  },
] as const;

function Screen() {
  const complete = useOnboardingStore(s => s.complete);

  function completeOnboarding() {
    complete();
    router.replace('/(auth)/login');
  }

  return <OnboardingScreen steps={steps} onComplete={completeOnboarding} />;
}

export { Screen as OnboardingScreen };
