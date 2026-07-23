import { ScrollView, View } from 'react-native';
import {
  BadgeDemo,
  ButtonsDemo,
  CalendarDemo,
  CardListDemo,
  CenteredActionDemo,
  CenteredDemo,
  CheckboxDemo,
  DateTimePickerDemo,
  DropdownDemo,
  IconDemo,
  ImageCardDemo,
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
} from '@/components/home';
import { CardsDemo } from '@/components/home/cards-demo';
import { Text } from '@/components/ui';

function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6 gap-2">

      <Text variant="h2" className="mb-2">Component Demo</Text>
      <Text variant="body" className="text-muted-foreground mb-2">All UI components with available variants.</Text>

      <SectionTitle>Card</SectionTitle>
      <CardsDemo />

      <SectionTitle>Card List</SectionTitle>
      <CardListDemo />

      <SectionTitle>Image Cards</SectionTitle>
      <ImageCardDemo />

      <SectionTitle>Typography</SectionTitle>
      <TypographyDemo />

      <SectionTitle>Icons</SectionTitle>
      <IconDemo />

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

      <SectionTitle>Dropdown</SectionTitle>
      <DropdownDemo />

      <SectionTitle>Video Player</SectionTitle>
      <VideoDemo />

      <SectionTitle>Calendar</SectionTitle>
      <CalendarDemo />

      <SectionTitle>Modals</SectionTitle>
      <View className="flex-row flex-wrap gap-3">
        <CenteredDemo />
        <CenteredActionDemo />
      </View>

      <SectionTitle>Context Menu</SectionTitle>
      <MenuDemo />

      <SectionTitle>QR Code</SectionTitle>
      <QRCodeDemo />

    </ScrollView>
  );
}

export { HomeScreen };
