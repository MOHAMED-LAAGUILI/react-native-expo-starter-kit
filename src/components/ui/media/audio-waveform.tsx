import { View } from 'react-native';
import { WaveBar } from './audio-wavebar';

export function Waveform({
  reverse = false,
  gradientColors,
}: {
  reverse?: boolean;
  gradientColors: [string, string];
}) {
  const bars = [
    18,
    32,
    48,
    70,
    52,
    38,
    64,
    44,
    30,
    58,
    42,
    28,
  ];

  const items = reverse ? [...bars].reverse() : bars;

  return (
    <View className="flex-row items-center justify-center">
      {items.map((height, index) => (
        <WaveBar
          key={`${reverse ? 'r' : 'l'}-${height}`}
          height={height}
          delay={index * 75}
          duration={500 + (index % 3) * 100}
          gradientColors={gradientColors}
        />
      ))}
    </View>
  );
}
