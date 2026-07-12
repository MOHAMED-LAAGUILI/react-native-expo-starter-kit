type OnboardingSlide = {
  title: string;
  description: string;
  animation: string;
};

const ONBOARDING_ANIMATIONS: Record<string, any> = {
  hello: require('@assets/lottie/hello.json'),
  people_reading_news_on_phone: require('@assets/lottie/people_reading_news_on_phone.json'),
  welcome: require('@assets/lottie/welcome.json'),
};

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    animation: 'welcome',
    description: 'A production-ready React Native starter with Expo Router, Tailwind v4, Zustand, and more.',
    title: 'Welcome',
  },
  {
    animation: 'people_reading_news_on_phone',
    description: 'Navigation, theming, i18n, API client, forms, and reusable UI components out of the box.',
    title: 'Features',
  },
  {
    animation: 'hello',
    description: 'Tap below to start building your app. You can revisit settings anytime.',
    title: 'Get Started',
  },
];

export type { OnboardingSlide };
export { ONBOARDING_ANIMATIONS, ONBOARDING_SLIDES };
