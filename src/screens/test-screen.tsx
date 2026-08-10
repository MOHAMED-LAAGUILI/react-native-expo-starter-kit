import type { DateRange } from '@/components/test/date-picker';
import type { GalleryItem } from '@/components/test/gallery';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioPlayer } from '@/components/test/audio-player';
import { AudioRecorder } from '@/components/test/audio-recorder';
import { DatePicker } from '@/components/test/date-picker';
import { Gallery } from '@/components/test/gallery';
import { Text } from '@/components/ui';

const SAMPLE_AUDIO_URL = 'https://www.thesoundarchive.com/ringtones/old-phone-ringing.wav';

const gridImages: GalleryItem[] = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'City Skyline',
    description: 'Modern architecture at sunset',
    thumbnail:
      'https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1644190022446-04b99df7259a?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Winter Wonderland',
    description: 'Snow-covered peaks and pristine wilderness',
    thumbnail:
      'https://images.unsplash.com/photo-1644190022446-04b99df7259a?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1717732596477-04f8c5d53387?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Ocean Waves',
    description: 'Peaceful ocean scene with rolling waves',
    thumbnail:
      'https://images.unsplash.com/photo-1717732596477-04f8c5d53387?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '4',
    uri: 'https://images.unsplash.com/photo-1575737698350-52e966f924d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Forest Path',
    description: 'A winding path through ancient trees',
    thumbnail:
      'https://images.unsplash.com/photo-1575737698350-52e966f924d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '5',
    uri: 'https://images.unsplash.com/photo-1667830867718-da7f5a45d20d?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Desert Dunes',
    description: 'Golden sand dunes stretching to the horizon',
    thumbnail:
      'https://images.unsplash.com/photo-1667830867718-da7f5a45d20d?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: '6',
    uri: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=2334&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Beautiful Landscape',
    description: 'A stunning view of mountains and valleys',
    thumbnail:
      'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=2334&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

function AudioSection() {
  const handleRecordingComplete = (uri: string) => {
    console.log('Recording saved to:', uri);
  };
  const handleRecordingStart = () => {
    console.log('Recording started');
  };
  const handleRecordingStop = () => {
    console.log('Recording stopped');
  };

  return (
    <>
      <Text variant="h3">AudioPlayer</Text>

      <AudioPlayer
        source={{ uri: SAMPLE_AUDIO_URL }}
        showControls
        showWaveform
        showTimer
        showProgressBar
        autoPlay={false}
        onPlaybackStatusUpdate={(status) => {
          console.log('Playback status:', status);
        }}
      />

      <Text variant="h3">AudioRecorder</Text>

      <AudioRecorder
        quality="high"
        showWaveform={true}
        showTimer={true}
        maxDuration={300} // 5 minutes
        onRecordingComplete={handleRecordingComplete}
        onRecordingStart={handleRecordingStart}
        onRecordingStop={handleRecordingStop}
      />
    </>
  );
}
function DatePickersSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateTime, setDateTime] = useState<Date | undefined>();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  return (
    <>
      <Text variant="h3">DatePicker</Text>

      <DatePicker
        label="Select Date"
        value={selectedDate}
        onChange={setSelectedDate}
        placeholder="Choose a date"
      />

      <DatePicker
        label="Date & Time"
        mode="datetime"
        value={dateTime}
        onChange={setDateTime}
        placeholder="Select date and time"
        timeFormat="12"
      />
      <DatePicker
        mode="range"
        label="Select Date"
        value={selectedRange}
        onChange={setSelectedRange}
        placeholder="Choose a range"
      />
    </>
  );
}
function GalleryGridSection() {
  return (
    <>
      <Text variant="h3">Gallery</Text>

      <Text variant="h3" style={{ marginBottom: 12 }}>
        4 Columns, No Spacing
      </Text>
      <Gallery
        items={gridImages}
        columns={4}
        spacing={0}
        borderRadius={0}
        aspectRatio={1}
      />
    </>
  );
}

function GallerySpacingSection() {
  return (
    <>
      <Text variant="h3">
        3 Columns with Spacing
      </Text>

      <Gallery
        items={gridImages.slice(0, 6)}
        columns={3}
        spacing={12}
        paddingHorizontal={16}
        borderRadius={8}
        aspectRatio={1.2}
      />

      <Text variant="h3" style={{ marginBottom: 12 }}>
        2 Columns, Large Spacing
      </Text>

      <Gallery
        items={gridImages}
        columns={2}
        spacing={16}
        borderRadius={12}
        aspectRatio={1}
        showTitles={true}
        showDescriptions={true}
        showPages={true}
        enableFullscreen={true}
        enableZoom={true}
      />
    </>
  );
}

function TestScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      contentInset={{ bottom: insets.bottom }}
    >
      <View className="gap-8 p-6">
        <AudioSection />
        <DatePickersSection />
        <GalleryGridSection />
      </View>

      <View className="gap-8 p-6">
        <GallerySpacingSection />
      </View>
    </ScrollView>
  );
}

export { TestScreen };
