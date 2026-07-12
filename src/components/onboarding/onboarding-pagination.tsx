import type { SharedValue } from 'react-native-reanimated';
import type { OnboardingSlide } from '@/data/onboarding-slides';
import { Pagination } from 'react-native-reanimated-carousel';

type OnboardingPaginationProps = {
  data: OnboardingSlide[];
  progress: SharedValue<number>;
};

function OnboardingPagination({ data, progress }: OnboardingPaginationProps) {
  return (
    <Pagination.Basic
      data={data}
      progress={progress}
      size={8}
      dotStyle={{
        backgroundColor: '#9CA3AF',
        borderRadius: 4,
        height: 8,
        opacity: 0.3,
        width: 8,
      }}
      activeDotStyle={{
        backgroundColor: '#000000',
        borderRadius: 4,
        height: 8,
        width: 24,
      }}
      containerStyle={{ gap: 6 }}
    />
  );
}

export { OnboardingPagination };
export type { OnboardingPaginationProps };
