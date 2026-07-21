import type { SharedValue } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { ArrowLeft, ArrowRight, LogIn, SkipForward } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Button, Text } from '@/components/ui';

type Step = {
  image: any;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    image: require('@assets/lottie/welcome.json'),
    title: 'WELCOME',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores soluta',
  },
  {
    image: require('@assets/lottie/people_reading_news_on_phone.json'),
    title: 'NEWS',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Asperiores soluta',
  },
  {
    image: require('@assets/lottie/hello.json'),
    title: 'GET STARTED!',
    description: '',
  },
];

type ControlsProps = {
  currentStep: number;
  direction: 'forward' | 'backward';
  progressPosition: SharedValue<number>;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

function PageOneControls({ currentStep, direction, progressPosition, onBack, onNext, onSkip }: ControlsProps) {
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const animation = direction === 'forward' ? FadeInRight.duration(350) : FadeInLeft.duration(350);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    left: withSpring(`${progressPosition.value * 70 + 2.5}%`, {
      damping: 15,
      stiffness: 100,
    }),
  }));

  return (
    <View className="h-[45%] items-center rounded-t-[80px] bg-blue-800">
      <Animated.View entering={animation} key={`text-${currentStep}`} className="items-center px-6">
        <Text className="mt-6 text-center text-3xl leading-[48px] font-bold text-white">
          {steps[currentStep].title}
        </Text>
        <Text className="mt-4 text-center text-base text-white">
          {steps[currentStep].description}
        </Text>
      </Animated.View>

      <View className="mt-5 h-3.5 w-20 justify-center rounded-full bg-slate-300">
        <Animated.View
          className="absolute h-2.5 w-5 rounded-full bg-blue-800"
          style={progressAnimatedStyle}
        />
      </View>

      <View className="mt-11 w-full flex-row items-center justify-between px-2">
        <Button
          variant="outline"
          size="sm"
          title="Back"
          leftIconComponent={ArrowLeft}
          onPress={onBack}
          disabled={isFirst}
          className="mt-3 rounded-md border-white bg-white active:bg-white/90"
        />

        {isLast
          ? (
              <View>
                <Button
                  variant="outline"
                  title="LOGIN"
                  leftIconComponent={LogIn}
                  onPress={() => console.log('Login')}
                  className="mt-3 rounded-md border-white bg-white active:bg-white/90"
                />
              </View>
            )
          : (
              <Button
                variant="outline"
                title="NEXT"
                rightIconComponent={ArrowRight}
                onPress={onNext}
                className="mt-3 rounded-md border-white bg-white active:bg-white/90"
              />
            )}

        <Button
          variant="outline"
          title="Skip"
          size="sm"
          rightIconComponent={SkipForward}
          onPress={onSkip}
          disabled={isLast}
          className="mt-3 rounded-md border-white bg-white active:bg-white/90"
        />
      </View>
    </View>
  );
}

function PageOneLottie({ currentStep, direction }: { currentStep: number; direction: 'forward' | 'backward' }) {
  const animation = direction === 'forward' ? FadeInRight.duration(350) : FadeInLeft.duration(350);

  return (
    <View className="h-[55%] items-center justify-center">
      <Animated.View entering={animation} key={`image-${currentStep}`} className="size-full">
        <LottieView
          source={steps[currentStep].image}
          autoPlay
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

function PageOneScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const progressPosition = useSharedValue(0);

  useEffect(() => {
    progressPosition.set(currentStep / (steps.length - 1));
  }, [currentStep, progressPosition]);

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipToLastStep = () => {
    setDirection('forward');
    setCurrentStep(steps.length - 1);
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="w-full flex-1">
        <PageOneLottie currentStep={currentStep} direction={direction} />
        <PageOneControls
          currentStep={currentStep}
          direction={direction}
          progressPosition={progressPosition}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
          onSkip={skipToLastStep}
        />
      </View>
    </View>
  );
}

export { PageOneScreen };
