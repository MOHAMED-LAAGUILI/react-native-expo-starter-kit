import type { RecordingOptions } from 'expo-audio';
import type { ViewStyle } from 'react-native';
import {
  AudioModule,

  RecordingPresets,
  useAudioRecorder,
} from 'expo-audio';
import { Circle, Download, Mic, Square, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { saveAudioRecording } from '@/hooks/permission-utils';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { isIOS } from '@/utils/platform';
import { LiveWaveform } from './audio-live-waveform';
import { AudioPlayer } from './audio-player';
import { Text } from './text';
import { showToast } from './toaster';

export type AudioRecorderProps = {
  style?: ViewStyle;
  quality?: 'high' | 'low';
  showWaveform?: boolean;
  showTimer?: boolean;
  maxDuration?: number; // in seconds
  onRecordingComplete?: (uri: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  customRecordingOptions?: RecordingOptions;
};

type Recorder = ReturnType<typeof useAudioRecorder>;

const RED_COLOR = '#ef4444';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centisecs = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${centisecs
    .toString()
    .padStart(2, '0')}`;
}

type PermissionRequiredViewProps = {
  style?: ViewStyle;
  textColor: string;
};

function PermissionRequiredView({ style, textColor }: PermissionRequiredViewProps) {
  return (
    <View
      className="w-82 items-center self-center rounded-md border border-border bg-card px-4 py-4.5"
      style={style}
    >
      <Text variant="body" style={{ color: textColor, textAlign: 'center' }}>
        Microphone permission is required to record audio.
      </Text>
    </View>
  );
}

function RecordingIndicator({ isRecording }: { isRecording: boolean }) {
  if (!isRecording)
    return <View className="h-9" />;

  return (
    <View className="h-9">
      <View className="flex-row items-center justify-center">
        <Circle size={8} color={RED_COLOR} fill={RED_COLOR} />
        <Text variant="caption" className="ml-2 text-red-500">
          Recording
        </Text>
      </View>
    </View>
  );
}

type TimerDisplayProps = {
  duration: number;
  maxDuration?: number;
  isRecording: boolean;
  textColor: string;
  mutedColor: string;
};

function TimerDisplay({
  duration,
  maxDuration,
  isRecording,
  textColor,
  mutedColor,
}: TimerDisplayProps) {
  return (
    <View className="mb-5 items-center">
      <Text
        variant="body"
        className="font-mono"
        style={{
          color: isRecording ? RED_COLOR : textColor,
          fontFamily: isIOS ? 'Menlo' : 'monospace',
        }}
      >
        {formatTime(duration)}
      </Text>
      {maxDuration
        ? (
            <Text variant="caption" style={{ color: mutedColor }}>
              Max:
              {' '}
              {formatTime(maxDuration)}
            </Text>
          )
        : null}
    </View>
  );
}

type WaveformDisplayProps = {
  data: number[];
  isRecording: boolean;
  primaryColor: string;
};

function WaveformDisplay({
  data,
  isRecording,
  primaryColor,
}: WaveformDisplayProps) {
  return (
    <View className="mb-3.5 items-center">
      <LiveWaveform
        data={data}
        active={isRecording}
        mode="scrolling"
        height={60}
        barWidth={4}
        barGap={2}
        barColor={isRecording ? RED_COLOR : primaryColor}
      />
    </View>
  );
}

type RecordControlsProps = {
  isRecording: boolean;
  showStart: boolean;
  onStart: () => void;
  onStop: () => void;
};

function RecordControls({ isRecording, showStart, onStart, onStop }: RecordControlsProps) {
  const animatedRecordButtonStyle = useRecordingPulse(isRecording);

  const shadowStyle = {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 5,
  };

  return (
    <View className="mb-3 items-center">
      {showStart && (
        <Animated.View style={animatedRecordButtonStyle}>
          <Pressable
            accessibilityLabel="Start recording"
            onPress={onStart}
            className="size-20 items-center justify-center rounded-full bg-red-500"
            style={({ pressed }) => [
              { ...shadowStyle, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Mic size={28} color="#ffffff" />
          </Pressable>
        </Animated.View>
      )}

      {isRecording && (
        <Pressable
          accessibilityLabel="Stop recording"
          onPress={onStop}
          className="size-20 items-center justify-center rounded-full bg-red-500"
          style={({ pressed }) => [
            { ...shadowStyle, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Square size={28} color="#ffffff" fill="#ffffff" />
        </Pressable>
      )}
    </View>
  );
}

type PlaybackControlsProps = {
  saving: boolean;
  onDelete: () => void;
  onSave: () => void;
};

function PlaybackControls({ saving, onDelete, onSave }: PlaybackControlsProps) {
  return (
    <View className="mt-4 w-full flex-row items-center justify-center gap-4">
      <Pressable
        accessibilityLabel="Delete recording"
        onPress={onDelete}
        className="size-10 items-center justify-center rounded-full border border-red-500 bg-secondary"
        style={({ pressed }) => [
          { opacity: pressed ? 0.82 : 1 },
        ]}
      >
        <Trash2 size={18} color={RED_COLOR} />
      </Pressable>

      <Pressable
        accessibilityLabel="Save recording"
        onPress={onSave}
        disabled={saving}
        className="min-w-27.5 flex-row items-center justify-center rounded-2xl bg-green-600 px-[18px] py-3"
        style={({ pressed }) => [
          { opacity: saving ? 0.6 : pressed ? 0.88 : 1 },
        ]}
      >
        <Download size={18} color="#ffffff" />
        <Text variant="label" className="ml-2 font-bold text-white">
          {saving ? 'Saving…' : 'Save'}
        </Text>
      </Pressable>
    </View>
  );
}

function PlayerSection({ recordingUri }: { recordingUri: string }) {
  return (
    <AudioPlayer
      source={{ uri: recordingUri }}
      show={{ controls: true, waveform: true, timer: true }}
      autoPlay={false}
      bordered={false}
    />
  );
}

type RecorderBodyProps = {
  style?: ViewStyle;
  recordingUri: string | null;
  isRecording: boolean;
  waveformData: number[];
  duration: number;
  maxDuration?: number;
  showWaveform: boolean;
  showTimer: boolean;
  saving: boolean;
  primaryColor: string;
  mutedColor: string;
  textColor: string;
  onDelete: () => void;
  onSave: () => void;
  onStart: () => void;
  onStop: () => void;
};

function RecorderBody({
  style,
  recordingUri,
  isRecording,
  waveformData,
  duration,
  maxDuration,
  showWaveform,
  showTimer,
  saving,
  primaryColor,
  mutedColor,
  textColor,
  onDelete,
  onSave,
  onStart,
  onStop,
}: RecorderBodyProps) {
  return (
    <View
      className="w-[328px] items-center self-center rounded-md border border-border bg-card px-4 py-[18px]"
      style={style}
    >
      {recordingUri && !isRecording
        ? (
            <View className="items-center">
              <PlayerSection recordingUri={recordingUri} />
              <PlaybackControls
                saving={saving}
                onDelete={onDelete}
                onSave={onSave}
              />
            </View>
          )
        : (
            <View className="w-full items-center">
              <RecordingIndicator isRecording={isRecording} />
              {showWaveform && (
                <WaveformDisplay
                  data={waveformData}
                  isRecording={isRecording}
                  primaryColor={primaryColor}
                />
              )}
              {showTimer && (
                <TimerDisplay
                  duration={duration}
                  maxDuration={maxDuration}
                  isRecording={isRecording}
                  textColor={textColor}
                  mutedColor={mutedColor}
                />
              )}
              <RecordControls
                isRecording={isRecording}
                showStart={!isRecording && !recordingUri}
                onStart={onStart}
                onStop={onStop}
              />
            </View>
          )}
    </View>
  );
}

function useRecordingPermission() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        setPermissionGranted(status.granted);

        if (!status.granted) {
          Alert.alert(
            'Permission Required',
            'Please grant microphone permission to record audio.',
            [{ text: 'OK' }],
          );
        }
      }
      catch (error) {
        console.error('Error requesting permissions:', error);
        setPermissionGranted(false);
      }
    })();
  }, []);

  return permissionGranted;
}

function useRecordingPulse(isRecording: boolean) {
  const recordingPulse = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      recordingPulse.set(withRepeat(
        withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ));
    }
    else {
      cancelAnimation(recordingPulse);
      recordingPulse.set(withTiming(1, { duration: 300 }));
    }

    return () => {
      cancelAnimation(recordingPulse);
    };
  }, [isRecording, recordingPulse]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: recordingPulse.value }],
  }));
}

function useWaveformMetering(recorder: Recorder, isRecording: boolean) {
  const [waveformData, setWaveformData] = useState<number[]>(
    Array.from<number>({ length: 30 }).fill(0.2),
  );
  const meteringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      meteringIntervalRef.current = setInterval(async () => {
        try {
          const status = recorder.getStatus();
          let level = 0.3;

          if (status && typeof status.metering === 'number') {
            const dbLevel = status.metering;
            level = Math.max(0.1, Math.min(1.0, (dbLevel + 50) / 50));
          }
          else {
            const time = Date.now() / 1000;
            const baseLevel = 0.3 + Math.sin(time * 2) * 0.2;
            const variation = (Math.random() - 0.5) * 0.4;
            const spike = Math.random() < 0.1 ? Math.random() * 0.3 : 0;
            level = Math.max(0.1, Math.min(0.9, baseLevel + variation + spike));
          }

          setWaveformData(prevData => [...prevData.slice(1), level]);
        }
        catch {
          console.log('Using simulated audio data');
          const time = Date.now() / 1000;
          const baseLevel = 0.4 + Math.sin(time * 3) * 0.2;
          const noise = (Math.random() - 0.5) * 0.3;
          const level = Math.max(0.15, Math.min(0.85, baseLevel + noise));

          setWaveformData(prevData => [...prevData.slice(1), level]);
        }
      }, 80);
    }

    return () => {
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
        meteringIntervalRef.current = null;
      }
    };
  }, [isRecording, recorder]);

  if (!isRecording) {
    return Array.from<number>({ length: 30 }).fill(0.2);
  }

  return waveformData;
}

function useDurationTimer() {
  const [duration, setDuration] = useState(0);
  const durationIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startDurationTimer = () => {
    setDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 0.1);
    }, 100);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  return { duration, setDuration, startDurationTimer, stopDurationTimer };
}

type StartRecordingOptions = {
  recorder: Recorder;
  recordingOptions: RecordingOptions;
  permissionGranted: boolean;
  onRecordingStart?: () => void;
  setRecordingUri: (uri: string | null) => void;
  setIsRecording: (value: boolean) => void;
  startDurationTimer: () => void;
  stopDurationTimer: () => void;
};

async function startRecording({
  recorder,
  recordingOptions,
  permissionGranted,
  onRecordingStart,
  setRecordingUri,
  setIsRecording,
  startDurationTimer,
  stopDurationTimer,
}: StartRecordingOptions) {
  if (!permissionGranted) {
    Alert.alert(
      'Permission Required',
      'Microphone permission is required to record audio.',
    );
    return;
  }

  try {
    console.log('Starting recording...');
    setRecordingUri(null);
    setIsRecording(true);
    startDurationTimer();

    const meteringOptions = {
      ...recordingOptions,
      isMeteringEnabled: true,
    };

    await recorder.prepareToRecordAsync(meteringOptions);
    await recorder.record();

    onRecordingStart?.();
    console.log('Recording started successfully');
  }
  catch (error) {
    console.error('Error starting recording:', error);
    setIsRecording(false);
    stopDurationTimer();
    Alert.alert('Error', 'Failed to start recording. Please try again.');
  }
}

type StopRecordingOptions = {
  recorder: Recorder;
  setRecordingUri: (uri: string | null) => void;
  setIsRecording: (value: boolean) => void;
  stopDurationTimer: () => void;
  onRecordingComplete?: (uri: string) => void;
  onRecordingStop?: () => void;
};

async function stopRecording({
  recorder,
  setRecordingUri,
  setIsRecording,
  stopDurationTimer,
  onRecordingComplete,
  onRecordingStop,
}: StopRecordingOptions) {
  try {
    console.log('Stopping recording...');
    setIsRecording(false);
    stopDurationTimer();

    await recorder.stop();
    const uri = recorder.uri;
    console.log('Recording stopped, URI:', uri);

    if (uri) {
      setRecordingUri(uri);
      onRecordingComplete?.(uri);
    }

    onRecordingStop?.();
  }
  catch (error) {
    console.error('Error stopping recording:', error);
    Alert.alert('Error', 'Failed to stop recording. Please try again.');
  }
}

type SaveRecordingOptions = {
  recordingUri: string;
  onRecordingComplete?: (uri: string) => void;
  setRecordingUri: (uri: string | null) => void;
  setDuration: (value: number) => void;
  setSaving: (value: boolean) => void;
};

async function saveRecording({
  recordingUri,
  onRecordingComplete,
  setRecordingUri,
  setDuration,
  setSaving,
}: SaveRecordingOptions) {
  onRecordingComplete?.(recordingUri);
  setSaving(true);

  try {
    const result = await saveAudioRecording(recordingUri);

    if (result === 'saved') {
      showToast({
        title: 'Saved',
        message: 'Audio recording saved to device',
        variant: 'success',
      });
      setRecordingUri(null);
      setDuration(0);
    }
    else {
      showToast({
        title: 'Permission Denied',
        message: 'Media library access is required to save recordings',
        variant: 'error',
      });
    }
  }
  catch {
    showToast({
      title: 'Save Failed',
      message: 'Could not save audio recording',
      variant: 'error',
    });
  }
  finally {
    setSaving(false);
  }
}

export function AudioRecorder({
  style,
  quality = 'high',
  showWaveform = true,
  showTimer = true,
  maxDuration,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  customRecordingOptions,
}: AudioRecorderProps) {
  const recordingOptions
    = customRecordingOptions
      || (quality === 'high'
        ? RecordingPresets.HIGH_QUALITY
        : RecordingPresets.LOW_QUALITY);

  const recorder = useAudioRecorder(recordingOptions);
  const permissionGranted = useRecordingPermission();
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const waveformData = useWaveformMetering(recorder, isRecording);
  const { duration, setDuration, startDurationTimer, stopDurationTimer } = useDurationTimer();

  const { text: textColor, muted: mutedColor } = useThemeColors();
  const primaryColor = usePrimaryHex();

  const handleStartRecording = async () => {
    await startRecording({
      recorder,
      recordingOptions,
      permissionGranted,
      onRecordingStart,
      setRecordingUri,
      setIsRecording,
      startDurationTimer,
      stopDurationTimer,
    });
  };

  const handleStopRecording = async () => {
    await stopRecording({
      recorder,
      setRecordingUri,
      setIsRecording,
      stopDurationTimer,
      onRecordingComplete,
      onRecordingStop,
    });
  };

  // Rebuilt every render, so call the latest instance via a ref to keep this effect stable.
  const handleStopRecordingRef = useRef(handleStopRecording);
  useEffect(() => {
    handleStopRecordingRef.current = handleStopRecording;
  });

  // Auto-stop recording when max duration is reached
  useEffect(() => {
    if (maxDuration && duration >= maxDuration && isRecording) {
      handleStopRecordingRef.current();
    }
  }, [duration, maxDuration, isRecording]);

  const handleDeleteRecording = () => {
    setRecordingUri(null);
    setDuration(0);
  };

  const handleSaveRecording = async () => {
    if (!recordingUri)
      return;

    await saveRecording({
      recordingUri,
      onRecordingComplete,
      setRecordingUri,
      setDuration,
      setSaving,
    });
  };

  if (!permissionGranted) {
    return (
      <PermissionRequiredView style={style} textColor={textColor} />
    );
  }

  return (
    <RecorderBody
      style={style}
      recordingUri={recordingUri}
      isRecording={isRecording}
      waveformData={waveformData}
      duration={duration}
      maxDuration={maxDuration}
      showWaveform={showWaveform}
      showTimer={showTimer}
      saving={saving}
      primaryColor={primaryColor}
      mutedColor={mutedColor}
      textColor={textColor}
      onDelete={handleDeleteRecording}
      onSave={handleSaveRecording}
      onStart={handleStartRecording}
      onStop={handleStopRecording}
    />
  );
}
