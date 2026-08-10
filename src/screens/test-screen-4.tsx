import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from '@/components/test/camera';
import { Text } from '@/components/ui';

const CARD = 'w-full rounded-xl border border-border bg-card p-4 mb-4';

export function TestScreen4() {
  const insets = useSafeAreaInsets();
  const handleCapture = ({ uri }: { uri: string }) => {
    Alert.alert('Picture Captured', `Saved to: ${uri}`);
  };
  const handleVideoCapture = ({ uri }: { uri: string }) => {
    Alert.alert('Video Recorded', `Saved to: ${uri}`);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className={CARD}>
        <Text variant="h2" className="mb-3">Camera Default</Text>
        <Camera
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      </View>

      <View className={CARD}>
        <Text variant="h2" className="mb-3">Custom Controls</Text>
        <Camera
          facing="front"
          enableTorch={false}
          timerOptions={[0, 5, 15]}
          maxVideoDuration={30}
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      </View>

      <View className={CARD}>
        <Text variant="h2" className="mb-3">Picture Only Mode</Text>
        <Camera
          enableVideo={false}
          onCapture={handleCapture}
          style={{ height: 400 }}
        />
      </View>

      <View className={CARD}>
        <Text variant="h2" className="mb-3">Video Recording</Text>
        <Camera
          maxVideoDuration={120}
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      </View>

      <View className={CARD}>
        <Text variant="h2" className="mb-3">Timer Features</Text>
        <Camera
          timerOptions={[0, 3, 5, 10, 15]}
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      </View>

      <View className={CARD}>
        <Text variant="h2" className="mb-3">Settings Panel</Text>
        <Camera
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      </View>
    </ScrollView>
  );
}
