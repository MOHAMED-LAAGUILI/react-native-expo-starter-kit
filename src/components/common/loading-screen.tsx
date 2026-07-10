import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { useThemeStore } from '@/store';

function LoadingScreen() {
  const isDark = useThemeStore(s => s.mode) === 'dark';
  const background = isDark ? '#000000' : '#ffffff';

  return (
    <View
      className="flex-1 items-center justify-center gap-4"
      style={{ backgroundColor: background }}
    >
      <LottieView
        source={require('@assets/lottie/loading_animation_blue.json')}
        autoPlay
        loop
      />
    </View>
  );
}

export { LoadingScreen };
