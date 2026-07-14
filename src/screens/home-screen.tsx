import { ScrollView, View } from 'react-native';
import {
  BadgeDemo,
  BottomSheetDemo,
  ButtonsDemo,
  CalendarDemo,
  CenteredActionDemo,
  CenteredDemo,
  CheckboxDemo,
  DateTimePickerDemo,
  ImageDemo,
  InputDemo,
  MenuDemo,
  ProgressDemo,
  QRCodeDemo,
  RadioGroupDemo,
  SectionTitle,
  SliderDemo,
  SpinnerDemo,
  SwitchDemo,
  TextAreaDemo,
  ToastDemo,
  ToggleDemo,
  TypographyDemo,
  VideoDemo,
  WebViewDemo,
} from '@/components/home';
import { CardsDemo } from '@/components/home/cards-demo';
import { Text } from '@/components/ui';

function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6 gap-2">
      <Text variant="h2" className="mb-2">Component Demo</Text>
      <Text variant="body" className="mb-2 text-muted-foreground">All UI components with available variants.</Text>

      <SectionTitle>Card</SectionTitle>
      <CardsDemo />

      <SectionTitle>Typography</SectionTitle>
      <TypographyDemo />

      <SectionTitle>Buttons</SectionTitle>
      <ButtonsDemo />

      <SectionTitle>Switch</SectionTitle>
      <SwitchDemo />

      <SectionTitle>Checkbox</SectionTitle>
      <CheckboxDemo />

      <SectionTitle>Radio Group</SectionTitle>
      <RadioGroupDemo />

      <SectionTitle>Toggle</SectionTitle>
      <ToggleDemo />

      <SectionTitle>Slider</SectionTitle>
      <SliderDemo />

      <SectionTitle>Progress</SectionTitle>
      <ProgressDemo />

      <SectionTitle>Spinner</SectionTitle>
      <SpinnerDemo />

      <SectionTitle>Badge</SectionTitle>
      <BadgeDemo />

      <SectionTitle>Toast</SectionTitle>
      <ToastDemo />

      <SectionTitle>Image</SectionTitle>
      <ImageDemo />

      <SectionTitle>Input</SectionTitle>
      <InputDemo />

      <SectionTitle>Date Time Picker</SectionTitle>
      <DateTimePickerDemo />

      <SectionTitle>Text Area</SectionTitle>
      <TextAreaDemo />

      <SectionTitle>Calendar</SectionTitle>
      <CalendarDemo />

      <SectionTitle>Modals</SectionTitle>
      <View className="flex-row flex-wrap gap-3">
        <BottomSheetDemo />
        <CenteredDemo />
        <CenteredActionDemo />
      </View>

      <SectionTitle>WebView</SectionTitle>
      <WebViewDemo />

      <SectionTitle>Context Menu</SectionTitle>
      <MenuDemo />

      <SectionTitle>Video Player</SectionTitle>
      <VideoDemo />

      <SectionTitle>QR Code</SectionTitle>
      <QRCodeDemo />

    </ScrollView>
  );
}

export { HomeScreen };
