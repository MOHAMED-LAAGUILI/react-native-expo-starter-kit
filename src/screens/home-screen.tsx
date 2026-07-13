import { ScrollView } from 'react-native';
import {
  BadgeDemo,
  ButtonsDemo,
  CheckboxDemo,
  ImageDemo,
  InputDemo,
  ProgressDemo,
  RadioGroupDemo,
  SectionTitle,
  SliderDemo,
  SpinnerDemo,
  SwitchDemo,
  ToastDemo,
  ToggleDemo,
  TypographyDemo,
} from '@/components/home';
import { Text } from '@/components/ui';

function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6 gap-2 pb-32">
      <Text variant="h2" className="mb-2">Component Demo</Text>
      <Text variant="body" className="mb-2 text-muted-foreground">All UI components with available variants.</Text>

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
    </ScrollView>
  );
}

export { HomeScreen };
