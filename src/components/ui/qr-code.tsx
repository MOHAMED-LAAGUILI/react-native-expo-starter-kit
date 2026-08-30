import * as React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';

type QRCodeProps = {
  value: string;
  size?: number;
  className?: string;
};

function QRCodeView({ value, size = 150, className }: QRCodeProps) {
  const { text } = useThemeColors();

  return (
    <View className={cn('items-center justify-center', className)}>
      <QRCode
        value={value}
        size={size}
        color={text}
        backgroundColor="transparent"
      />
    </View>
  );
}

export type { QRCodeProps };
export { QRCodeView };
