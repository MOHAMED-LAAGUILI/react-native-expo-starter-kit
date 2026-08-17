import { LinearGradient } from 'expo-linear-gradient';
import { Mic } from 'lucide-react-native';
import React from 'react';
import {
  useWindowDimensions,
  View,
} from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { Waveform } from './audio-waveform';

function lighten(hex: string, amount: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

export default function VoiceVisualizer() {
  const { width } = useWindowDimensions();
  const primary = usePrimaryHex();

  const circleSize = Math.min(Math.max(width * 0.46, 190), 120);
  const microphoneSize = circleSize * 0.32;

  const primaryLight = lighten(primary, 0.35);
  const barColors: [string, string] = [primary, primaryLight];
  const circleColors: [string, string] = [primaryLight, primary];

  return (
    <View className="w-full items-center justify-center bg-background px-4 py-10">
      <View className="w-full flex-row items-center justify-center">
        <View className="flex-1 items-end overflow-hidden">
          <Waveform reverse gradientColors={barColors} />
        </View>

        <View
          className="mx-3 shrink-0 overflow-hidden rounded-full"
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          }}
        >
          <LinearGradient
            colors={circleColors}
            start={{ x: 0.05, y: 0.05 }}
            end={{ x: 0.95, y: 0.95 }}
            className="size-full items-center justify-center"
          >
            <Mic
              size={microphoneSize}
              color="#FFFFFF"
              strokeWidth={2.2}
            />
          </LinearGradient>
        </View>

        <View className="flex-1 items-start overflow-hidden">
          <Waveform gradientColors={barColors} />
        </View>
      </View>
    </View>
  );
}
