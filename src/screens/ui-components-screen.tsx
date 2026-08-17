import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AccordionDemo,
  AlertDemo,
  BadgeDemo,
  ButtonsDemo,
  CalendarDemo,
  CardListDemo,
  CenteredActionDemo,
  CenteredDemo,
  CheckboxDemo,
  ColorPickerDemo,
  DropdownDemo,
  GroupedInputDemo,
  IconDemo,
  ImageCardDemo,
  ImageDemo,
  InputDemo,
  MenubarDemo,
  OutlineInputDemo,
  PopoverDemo,
  ProgressDemo,
  QRCodeDemo,
  RadioGroupDemo,
  SelectDemo,
  SeparatorDemo,
  SkeletonDemo,
  SliderDemo,
  SpinnerDemo,
  SwitchDemo,
  TabsDemo,
  ToastDemo,
  ToggleDemo,
  TooltipDemo,
  TypographyDemo,
} from '@/components/demos';
import { CardsDemo } from '@/components/demos/cards-demo';
import { Button, SectionTitle, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, Text } from '@/components/ui';
import { isIOS } from '@/utils/platform';

type SheetDemoProps = {
  side: 'left' | 'right';
  title: string;
  description: string;
};

function SheetDemo({ side, title, description }: SheetDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} side={side}>
      <SheetTrigger>
        {side === 'right' ? 'Open Right Sheet' : 'Open Left Sheet'}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <View className="gap-4 px-6">
          <Text>
            This themed side sheet slides in from the edge with a spring-like
            animation and a fading backdrop.
          </Text>
          <Button
            title="Close Sheet"
            onPress={() => setOpen(false)}
            className="rounded-full"
          />
        </View>
      </SheetContent>
    </Sheet>
  );
}

function CoreSections() {
  return (
    <>
      <SectionTitle title="Cards" />
      <CardsDemo />
      <SectionTitle title="Card List" />
      <CardListDemo />
      <SectionTitle title="Typography" />
      <TypographyDemo />
      <SectionTitle title="Icons" />
      <IconDemo />
      <SectionTitle title="Buttons" />
      <ButtonsDemo />
    </>
  );
}

function SelectionSections() {
  return (
    <>
      <SectionTitle title="Switch" />
      <SwitchDemo />
      <SectionTitle title="Checkbox" />
      <CheckboxDemo />
      <SectionTitle title="Radio Group" />
      <RadioGroupDemo />
      <SectionTitle title="Toggle" />
      <ToggleDemo />
      <SectionTitle title="Slider" />
      <SliderDemo />
    </>
  );
}

function FeedbackSections() {
  return (
    <>
      <SectionTitle title="Progress" />
      <ProgressDemo />
      <SectionTitle title="Spinner" />
      <SpinnerDemo />
      <SectionTitle title="Badge" />
      <BadgeDemo />
      <SectionTitle title="Toast" />
      <ToastDemo />
      <SectionTitle title="Image" />
      <ImageDemo />
      <SectionTitle title="Input" />
      <InputDemo />
      <SectionTitle title="Outline Input" />
      <OutlineInputDemo />
      <SectionTitle title="Grouped Input" />
      <GroupedInputDemo />
      <SectionTitle title="Color Picker" />
      <ColorPickerDemo />
      <SectionTitle title="Image Cards" />
      <ImageCardDemo />
    </>
  );
}

function ContentSections() {
  return (
    <>
      <SectionTitle title="Dropdown" />
      <DropdownDemo />
      <SectionTitle title="Accordion" />
      <AccordionDemo />
      <SectionTitle title="Alert" />
      <AlertDemo />
      <SectionTitle title="Tabs" />
      <TabsDemo />
      <SectionTitle title="Select" />
      <SelectDemo />
      <SectionTitle title="Separator" />
      <SeparatorDemo />
      <SectionTitle title="Skeleton" />
      <SkeletonDemo />
    </>
  );
}

function OverlaySections() {
  return (
    <>
      <SectionTitle title="Popover" />
      <PopoverDemo />
      <SectionTitle title="Menubar" />
      <MenubarDemo />
      <SectionTitle title="Tooltip" />
      <TooltipDemo />
      <SectionTitle title="QR Code" />
      <QRCodeDemo />
      <SectionTitle title="Calendar" />
      <CalendarDemo />
      <SectionTitle title="Modals" />
      <View className="flex-row flex-wrap gap-3">
        <CenteredDemo />
        <CenteredActionDemo />
      </View>
      <SectionTitle title="Side Sheets" />
      <SheetDemo
        side="right"
        title="Right Sheet"
        description="Slides in from the right edge of the screen."
      />
      <SheetDemo
        side="left"
        title="Left Sheet"
        description="Slides in from the left edge of the screen."
      />
    </>
  );
}

function UiComponentsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-2 p-6">
        <Text variant="h2" className="mb-1">UI Components</Text>
        <Text variant="body" className="mb-4 text-muted-foreground">
          Core UI building blocks with all available variants.
        </Text>

        <CoreSections />
        <SelectionSections />
        <FeedbackSections />
        <ContentSections />
        <OverlaySections />
      </View>
    </ScrollView>
  );
}

export { UiComponentsScreen };
