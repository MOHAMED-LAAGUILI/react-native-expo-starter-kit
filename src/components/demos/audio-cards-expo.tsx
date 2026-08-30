import type { ReactNode, SetStateAction } from 'react';
import {
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { RESULTS } from 'react-native-permissions';

import { Badge, Button, Text } from '@/components/ui';
import { showToast } from '@/components/ui/toaster';
import { usePermissionsStatus } from '@/hooks/use-permissions-status';
import { saveAudioRecording } from '@/utils/permission-utils';
import { isWeb } from '@/utils/platform';

const SAMPLE_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function ExpoAudioPlayerCard() {
  const player = useAudioPlayer(SAMPLE_URL, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold">Audio Player (expo-audio)</Text>
        {status.isBuffering && <Badge variant="outline" size="sm">Buffering…</Badge>}
      </View>
      <Text variant="caption" className="text-muted-foreground">Play a remote audio sample via expo-audio</Text>
      <Text variant="body" className="text-center font-mono text-primary">
        {formatTime(status.currentTime)}
        {' / '}
        {formatTime(status.duration)}
      </Text>
      {status.error && (
        <Text variant="caption" className="text-destructive">
          Error:
          {status.error}
        </Text>
      )}
      <View className="flex-row gap-2">
        <Button
          title={status.playing ? 'Pause' : 'Play'}
          onPress={() => (status.playing ? player.pause() : player.play())}
          size="sm"
          className="flex-1"
          disabled={!status.isLoaded}
        />
        <Button
          title="Stop"
          onPress={async () => {
            await player.seekTo(0);
            player.pause();
          }}
          size="sm"
          variant="destructive"
          className="flex-1"
          disabled={!status.isLoaded || (!status.playing && status.currentTime === 0)}
        />
      </View>
    </View>
  );
}

function RecordingPlayback({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    saveAudioRecording(uri)
      .then((result) => {
        if (result === 'saved') {
          showToast({ title: 'Saved', message: 'Audio recording saved to device', variant: 'success' });
        }
        else {
          showToast({ title: 'Permission Denied', message: 'Media library access is required to save recordings', variant: 'error' });
        }
      })
      .catch(() => {
        showToast({ title: 'Save Failed', message: 'Could not save audio recording', variant: 'error' });
      })
      .finally(() => setSaving(false));
  }

  return (
    <View className="mt-2 gap-2">
      <View className="flex-row gap-2">
        <Button
          title={status.playing ? 'Pause' : 'Play Recording'}
          onPress={() => (status.playing ? player.pause() : player.play())}
          size="sm"
          className="flex-1"
        />
        <Button
          title="Stop"
          onPress={async () => {
            await player.seekTo(0);
            player.pause();
          }}
          size="sm"
          variant="destructive"
          className="flex-1"
        />
        <Button
          title={saving ? 'Saving…' : 'Save'}
          onPress={handleSave}
          size="sm"
          variant="outline"
          className="shrink-0"
          disabled={saving}
        />
      </View>
      <Text variant="caption" className="truncate text-muted-foreground">
        Recorded:
        {uri}
      </Text>
    </View>
  );
}

type RecorderPermissionGateProps = {
  micStatus: string | null;
  micGranted: boolean;
  requesting: boolean;
  onRequest: () => void;
  children: ReactNode;
};

function RecorderPermissionGate({
  micStatus,
  micGranted,
  requesting,
  onRequest,
  children,
}: RecorderPermissionGateProps) {
  if (micStatus == null) {
    return <Button title="Checking…" size="sm" disabled />;
  }

  if (!micGranted) {
    return (
      <Button
        title="Enable Microphone"
        onPress={onRequest}
        size="sm"
        variant="secondary"
        loading={requesting}
      />
    );
  }

  return <>{children}</>;
}

function ExpoAudioRecorderCard() {
  const { statuses, loading, requestPermission } = usePermissionsStatus();
  const micStatus = statuses.Microphone;
  const micGranted = micStatus === RESULTS.GRANTED || micStatus === RESULTS.LIMITED;

  const [recorderState, setRecorderState] = useState<'idle' | 'preparing' | 'recording'>('idle');
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (recStatus: { url: SetStateAction<string | null>; hasError: any; error: SetStateAction<string | null>; isFinished: any }) => {
    if (recStatus.url) {
      setRecordedUri(recStatus.url);
    }
    if (recStatus.hasError && recStatus.error) {
      setError(recStatus.error);
    }
    if (recStatus.isFinished) {
      setRecorderState('idle');
    }
  });
  const state = useAudioRecorderState(recorder);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true });
  }, []);

  async function handleStartRecording() {
    setError(null);
    setRecorderState('preparing');
    try {
      await requestPermission('Microphone');
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecorderState('recording');
      setRecordedUri(null);
    }
    catch (e) {
      setError(`Failed to start recording: ${e}`);
      setRecorderState('idle');
    }
  }

  async function handleStopRecording() {
    try {
      await recorder.stop();
      setRecorderState('idle');
    }
    catch (e) {
      setError(`Failed to stop recording: ${e}`);
    }
  }

  if (isWeb) {
    return (
      <View className="gap-2 rounded-xl border border-border bg-card p-4">
        <Text className="font-semibold">Audio Recorder (expo-audio)</Text>
        <Text variant="caption" className="text-muted-foreground">Audio recording not available on web</Text>
      </View>
    );
  }

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold">Audio Recorder (expo-audio)</Text>
        <Badge variant={micGranted ? 'default' : 'outline'} size="sm">
          {micGranted ? 'Mic Ready' : 'No Mic Permission'}
        </Badge>
      </View>
      <Text variant="caption" className="text-muted-foreground">Record and play back audio via expo-audio</Text>
      <Text variant="body" className="text-center font-mono text-primary">
        {formatTime(state.durationMillis / 1000)}
      </Text>
      {error && (
        <Text variant="caption" className="text-destructive">{error}</Text>
      )}
      <RecorderPermissionGate
        micStatus={micStatus}
        micGranted={micGranted}
        requesting={loading.Microphone}
        onRequest={() => requestPermission('Microphone')}
      >
        <View className="flex-row gap-2">
          {recorderState !== 'recording'
            ? (
                <Button
                  title={recorderState === 'preparing' ? 'Preparing…' : 'Start Recording'}
                  onPress={handleStartRecording}
                  size="sm"
                  className="flex-1"
                  disabled={recorderState === 'preparing'}
                />
              )
            : (
                <Button
                  title="Stop Recording"
                  onPress={handleStopRecording}
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                />
              )}
        </View>
      </RecorderPermissionGate>
      {recordedUri && <RecordingPlayback uri={recordedUri} />}
    </View>
  );
}

function ExpoAudioCards() {
  return (
    <View className="gap-4">
      <Text variant="body" className="text-muted-foreground">expo-audio player and recorder demos</Text>
      <ExpoAudioPlayerCard />
      <ExpoAudioRecorderCard />
    </View>
  );
}

export { ExpoAudioCards };
