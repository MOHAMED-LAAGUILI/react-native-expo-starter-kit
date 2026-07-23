import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeStore } from '@/store/theme-store';
import { Text } from './text';

type DateTimePickerMode = 'date' | 'time' | 'datetime';

type DateTimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  mode?: DateTimePickerMode;
  label?: string;
  display?: 'default' | 'spinner' | 'clock' | 'calendar';
};

function formatDate(date: Date, mode: string) {
  if (mode === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function DateTimePickerField({ value, onChange, mode = 'date', label, display }: DateTimePickerProps) {
  const [show, setShow] = React.useState(false);
  const primaryHex = usePrimaryHex();
  const themeMode = useThemeStore(s => s.mode);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className="gap-1">
      {label && <Text variant="label" className="text-muted-foreground">{label}</Text>}
      <Pressable
        onPress={() => setShow(true)}
        className="border-border bg-secondary h-11 flex-row items-center rounded-md border px-3"
      >
        <Text className="text-foreground">{formatDate(value, mode)}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={display ?? 'default'}
          onChange={handleChange}
          accentColor={primaryHex}
          themeVariant={themeMode === 'system' ? undefined : themeMode}
          {...(Platform.OS === 'android' && {
            positiveButton: { label: 'OK', textColor: primaryHex },
          })}
        />
      )}
    </View>
  );
}

export type { DateTimePickerMode, DateTimePickerProps };
export { DateTimePickerField };
