import * as React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpoAudioCards, PermissionCards, VideoDemo } from '@/components/demos';
import { AudioPlayer, AudioRecorder, Button, Camera, Gallery, SectionTitle, Text } from '@/components/ui';
import VoiceVisualizer from '@/components/ui/media/audio-live-recorder';
import { showToast } from '@/components/ui/toaster';
import { gridImages } from '@/data/gallery-images';
import { saveMediaToDevice } from '@/utils/permission-utils';
import { isIOS, isWeb } from '@/utils/platform';

const SAMPLE_AUDIO_URL = 'https://www.thesoundarchive.com/ringtones/old-phone-ringing.wav';

type CameraDemoKey = 'default' | 'custom' | 'picture' | 'video';

const CAMERA_DEMOS: Array<{ key: CameraDemoKey; title: string }> = [
  { key: 'default', title: 'Default' },
  { key: 'custom', title: 'Custom Controls' },
  { key: 'picture', title: 'Picture Only' },
  { key: 'video', title: 'Video' },
];

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

      <Text variant="h3" className="mt-4 mb-2">Audio Recorder Button</Text>

      <VoiceVisualizer />

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

function CameraSection() {
  const handleSaveMedia = async (type: 'picture' | 'video', uri: string) => {
    if (isWeb) {
      Alert.alert('Not supported', 'Saving to device is not available on web');
      return;
    }
    try {
      const result = await saveMediaToDevice(uri);
      if (result === 'saved') {
        showToast({
          title: type === 'picture' ? 'Picture Saved' : 'Video Saved',
          message: 'Saved to device media library',
          variant: 'success',
        });
      }
      else {
        showToast({
          title: 'Permission Denied',
          message: 'Media library access is required to save photos and videos',
          variant: 'error',
        });
      }
    }
    catch {
      showToast({
        title: 'Save Failed',
        message: `Could not save ${type} to device`,
        variant: 'error',
      });
    }
  };

  const handleCapture = ({ type, uri }: { type: 'picture' | 'video'; uri: string }) => handleSaveMedia(type, uri);
  const handleVideoCapture = ({ type, uri }: { type: 'picture' | 'video'; uri: string }) => handleSaveMedia(type, uri);

  // One live preview at a time — each mounted camera holds a native session,
  // so eager-mounting all demos makes the whole screen lag.
  const [activeDemo, setActiveDemo] = React.useState<CameraDemoKey | null>(null);

  const toggleDemo = (key: CameraDemoKey) => {
    setActiveDemo(current => (current === key ? null : key));
  };

  return (
    <>
      <Text variant="body" className="text-muted-foreground">
        Live camera previews are expensive — pick one demo to mount it.
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {CAMERA_DEMOS.map(demo => (
          <Button
            key={demo.key}
            size="sm"
            variant={activeDemo === demo.key ? 'primary' : 'secondary'}
            title={demo.title}
            onPress={() => toggleDemo(demo.key)}
          />
        ))}
      </View>

      {activeDemo === 'default' && (
        <Camera onCapture={handleCapture} onVideoCapture={handleVideoCapture} style={{ height: 400 }} />
      )}
      {activeDemo === 'custom' && (
        <Camera
          facing="front"
          enableTorch={false}
          timerOptions={[0, 5, 15]}
          maxVideoDuration={30}
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      )}
      {activeDemo === 'picture' && (
        <Camera enableVideo={false} onCapture={handleCapture} style={{ height: 400 }} />
      )}
      {activeDemo === 'video' && (
        <Camera
          maxVideoDuration={120}
          onCapture={handleCapture}
          onVideoCapture={handleVideoCapture}
          style={{ height: 400 }}
        />
      )}
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
