import type { CardData } from '@/data/cards';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpoAudioCards, PermissionCards, VideoDemo } from '@/components/demos';
import { ImageCardDemo } from '@/components/demos/image-card-demo';
import { AudioPlayer, AudioRecorder, BottomSheet, Camera, Gallery, Image, SectionTitle, Text } from '@/components/ui';
import { gridImages } from '@/data/gallery-images';
import { isIOS } from '@/utils/platform';

const SAMPLE_AUDIO_URL = 'https://www.thesoundarchive.com/ringtones/old-phone-ringing.wav';

function AudioSection() {
  return (
    <>
      <Text variant="h3" className="mb-2">Audio Player</Text>
      <AudioPlayer
        source={{ uri: SAMPLE_AUDIO_URL }}
        show={{ controls: true, waveform: true, timer: true, progressBar: true }}
        autoPlay={false}
        onPlaybackStatusUpdate={status => console.log('Playback:', status)}
      />

      <Text variant="h3" className="mt-4 mb-2">Audio Recorder</Text>
      <AudioRecorder
        quality="high"
        showWaveform={true}
        showTimer={true}
        maxDuration={300}
        onRecordingComplete={uri => console.log('Saved to:', uri)}
        onRecordingStart={() => console.log('Recording started')}
        onRecordingStop={() => console.log('Recording stopped')}
      />
    </>
  );
}

function GallerySection() {
  return (
    <>
      <Text variant="h3" className="mb-2">4 Columns, No Spacing</Text>
      <Gallery items={gridImages} columns={4} spacing={0} borderRadius={0} aspectRatio={1} />

      <Text variant="h3" className="mt-4 mb-2">3 Columns with Spacing</Text>
      <Gallery
        items={gridImages.slice(0, 6)}
        columns={3}
        spacing={12}
        paddingHorizontal={16}
        borderRadius={8}
        aspectRatio={1.2}
      />

      <Text variant="h3" className="mt-4 mb-2">2 Columns, Large Spacing</Text>
      <Gallery
        items={gridImages}
        columns={2}
        spacing={16}
        borderRadius={12}
        aspectRatio={1}
        show={{ titles: true, descriptions: true, pages: true }}
        enable={{ fullscreen: true, zoom: true }}
      />
    </>
  );
}

function ImageCardsSection() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <>
      <ImageCardDemo onCardSelect={setSelectedCard} />

      <BottomSheet
        open={selectedCard !== null}
        onOpenChange={(v) => {
          if (!v)
            setSelectedCard(null);
        }}
        title={selectedCard?.title ?? ''}
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
    </>
  );
}

function CameraSection() {
  const handleCapture = ({ uri }: { uri: string }) => Alert.alert('Picture Captured', `Saved to: ${uri}`);
  const handleVideoCapture = ({ uri }: { uri: string }) => Alert.alert('Video Recorded', `Saved to: ${uri}`);

  return (
    <>
      <Text variant="h3" className="mb-2">Camera Default</Text>
      <Camera onCapture={handleCapture} onVideoCapture={handleVideoCapture} style={{ height: 400 }} />

      <Text variant="h3" className="mt-4 mb-2">Custom Controls</Text>
      <Camera
        facing="front"
        enableTorch={false}
        timerOptions={[0, 5, 15]}
        maxVideoDuration={30}
        onCapture={handleCapture}
        onVideoCapture={handleVideoCapture}
        style={{ height: 400 }}
      />

      <Text variant="h3" className="mt-4 mb-2">Picture Only Mode</Text>
      <Camera enableVideo={false} onCapture={handleCapture} style={{ height: 400 }} />

      <Text variant="h3" className="mt-4 mb-2">Video Recording</Text>
      <Camera
        maxVideoDuration={120}
        onCapture={handleCapture}
        onVideoCapture={handleVideoCapture}
        style={{ height: 400 }}
      />
    </>
  );
}

function MediaAudioScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-6 p-6">
        <Text variant="h2" className="mb-1">Media & Audio</Text>
        <Text variant="body" className="mb-2 text-muted-foreground">
          Audio playback, recording, video, gallery, camera, and image demos.
        </Text>
        <SectionTitle title="Audio" />
        <AudioSection />

        <SectionTitle title="Video Player" />
        <VideoDemo />

        <SectionTitle title="Gallery" />
        <GallerySection />

        <SectionTitle title="Image Cards" />
        <ImageCardsSection />

        <SectionTitle title="Camera" />
        <CameraSection />

        <SectionTitle title="Audio Cards" />
        <ExpoAudioCards />

        <SectionTitle title="Permissions" />
        <PermissionCards />
      </View>
    </ScrollView>
  );
}

export { MediaAudioScreen };
