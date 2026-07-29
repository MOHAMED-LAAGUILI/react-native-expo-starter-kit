import type { CardData } from '@/components/home/image-card-demo';
import * as React from 'react';
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
  ExpoAudioCards,
  IconDemo,
  ImageCardDemo,
  ImageDemo,
  InputDemo,
  MenuDemo,
  PermissionCards,
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
import { BottomSheet, Image, Text } from '@/components/ui';

function DemoSections({ onCardSelect }: { onCardSelect: (card: CardData) => void }) {
  return (
    <>
      <Text variant="h2" className="mb-2">Component Demo</Text>
      <Text variant="body" className="mb-2 text-muted-foreground">All UI components with available variants.</Text>

      <SectionTitle>Card</SectionTitle>
      <CardsDemo />

      <SectionTitle>Card List</SectionTitle>
      <CardListDemo />

      <SectionTitle>Image Cards</SectionTitle>
      <ImageCardDemo onCardSelect={onCardSelect} />

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

      <SectionTitle>Audio Demos</SectionTitle>
      <ExpoAudioCards />

      <SectionTitle>Permission Demos</SectionTitle>
      <PermissionCards />
    </>
  );
}

function HomeScreen() {
  const [selectedCard, setSelectedCard] = React.useState<CardData | null>(null);

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-6 gap-2">
        <DemoSections onCardSelect={setSelectedCard} />
      </ScrollView>

      <BottomSheet
        open={selectedCard !== null}
        onOpenChange={(v) => {
          if (!v)
            setSelectedCard(null);
        }}
        title={selectedCard?.title ?? ''}
        snapPoints={['50%', '75%']}
      >
        {selectedCard && (
          <>
            <Image
              source={{ uri: selectedCard.imageUrl }}
              className="h-64 w-full"
               contentFit="cover"
              style={{ height: '100%', width: '100%' }}
            />
            <View className="gap-2 p-4">
              <Text variant="h4">{selectedCard.title}</Text>
              <Text variant="body" className="text-muted-foreground">{selectedCard.subtitle}</Text>
              <Text variant="caption" className="text-muted-foreground">
                Orientation:
                {' '}
                {selectedCard.orientation}
              </Text>
            </View>
          </>
        )}
      </BottomSheet>
    </View>
  );
}

export { HomeScreen };
