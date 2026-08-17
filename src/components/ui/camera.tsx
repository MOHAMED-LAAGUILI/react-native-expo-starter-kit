import type { CameraMode, CameraType } from 'expo-camera';
import type { ComponentProps, Ref } from 'react';
import type { ViewStyle } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Camera as CameraIcon,
  Grid3X3,
  SwitchCamera,
  Timer,
  Video,
  Volume2,
  VolumeX,
  X,
  Zap,
  ZapOff,
} from 'lucide-react-native';
import React, {

  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/utils';
import { Button } from './button';
import { Text } from './text';

const { width: screenWidth } = Dimensions.get('window');

type CaptureSuccess = {
  type: CameraMode;
  uri: string;
  cameraHeight: number;
};

type CameraProps = {
  style?: ViewStyle;
  facing?: CameraType;
  enableTorch?: boolean;
  showControls?: boolean;
  timerOptions?: Array<number>;
  enableVideo?: boolean;
  maxVideoDuration?: number;
  onClose?: () => void;
  onCapture?: ({ type, uri, cameraHeight }: CaptureSuccess) => void;
  onVideoCapture?: ({ type, uri, cameraHeight }: CaptureSuccess) => void;
};

type CameraRef = {
  switchCamera: () => void;
  toggleTorch: () => void;
  takePicture: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
};

const ASPECT_RATIOS = ['16:9', '4:3', '1:1'] as const;

function getCameraHeight(aspectRatioIndex: number) {
  const ratio = ASPECT_RATIOS[aspectRatioIndex] ?? ASPECT_RATIOS[1];
  switch (ratio) {
    case '16:9':
      return (screenWidth * 16) / 9;
    case '1:1':
      return screenWidth;
    case '4:3':
    default:
      return (screenWidth * 4) / 3;
  }
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

type PermissionLoadingProps = {
  backgroundColor: string;
  primaryHex: string;
  style?: ViewStyle;
};

function CameraPermissionLoading({
  backgroundColor,
  primaryHex,
  style,
}: PermissionLoadingProps) {
  return (
    <View className={cn('flex-1 items-center justify-center', style)} style={{ backgroundColor }}>
      <ActivityIndicator size="large" color={primaryHex} />
      <Text variant="caption" className="mt-4">
        Loading camera...
      </Text>
    </View>
  );
}

type PermissionDeniedProps = {
  cardColor: string;
  textColor: string;
  requestPermission: () => void;
  style?: ViewStyle;
};

function CameraPermissionDenied({
  cardColor,
  textColor,
  requestPermission,
  style,
}: PermissionDeniedProps) {
  return (
    <View
      className={cn(
        'flex-1 items-center justify-center gap-4 rounded-2xl p-8',
        style,
      )}
      style={{ backgroundColor: cardColor }}
    >
      <CameraIcon size={36} color={textColor} className="mb-4" />
      <Text variant="h2" className="text-center">
        Camera Access Required
      </Text>
      <Text variant="h3" className="text-center">
        We need access to your camera to take pictures and videos
      </Text>
      <View className="w-full">
        <Button title="Grant Permission" onPress={requestPermission} className="w-full" />
      </View>
    </View>
  );
}

function CameraGrid() {
  return (
    <View className="absolute inset-0 z-10">
      <View className="relative flex-1">
        <View className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
        <View className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
        <View className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
        <View className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
      </View>
    </View>
  );
}

type ZoomIndicatorProps = {
  animatedStyle: ComponentProps<typeof Animated.View>['style'];
  zoomFactorText: string;
};

function CameraZoomIndicator({ animatedStyle, zoomFactorText }: ZoomIndicatorProps) {
  return (
    <Animated.View
      className="absolute top-[45%] z-20 self-center rounded-full bg-black/70 px-4 py-2"
      style={animatedStyle}
      pointerEvents="none"
    >
      <Text className="text-center text-sm font-bold text-white">
        {zoomFactorText}
      </Text>
    </Animated.View>
  );
}

type TimerOverlayProps = {
  timerSeconds: number;
  cancelTimer: () => void;
};

function CameraTimerOverlay({ timerSeconds, cancelTimer }: TimerOverlayProps) {
  return (
    <Pressable
      className="absolute inset-0 z-30 items-center justify-center bg-black/50"
      onPress={cancelTimer}
    >
      <Text className="text-center text-7xl font-bold text-white">{timerSeconds}</Text>
      <Pressable
        className="absolute top-15 right-5 size-12 items-center justify-center rounded-full bg-black/70"
      >
        <X size={20} color="white" />
      </Pressable>
      <Text className="absolute bottom-25 text-center text-base text-white">
        Tap to cancel
      </Text>
    </Pressable>
  );
}

type RecordingIndicatorProps = {
  recordingTime: number;
};

function CameraRecordingIndicator({ recordingTime }: RecordingIndicatorProps) {
  return (
    <View className="absolute top-5 left-5 z-20 flex-row items-center rounded-full bg-red-500/80 px-3 py-1.5">
      <View className="mr-2 size-2 rounded-full bg-white" />
      <Text className="text-sm font-bold text-white">
        REC
        {' '}
        {formatTime(recordingTime)}
      </Text>
    </View>
  );
}

type TopControlsProps = {
  onClose?: () => void;
  cardColor: string;
  textColor: string;
  mode: CameraMode;
  showSettings: boolean;
  toggleSettings: () => void;
};

function CameraTopControls({
  onClose,
  cardColor,
  textColor,
  mode,
}: TopControlsProps) {
  return (
    <View className="absolute inset-x-5 top-5 z-10 flex-row items-center justify-between">
      <View className="flex-1 items-start">
        {onClose && (
          <Pressable
            className="size-12 items-center justify-center rounded-full"
            style={{ backgroundColor: cardColor }}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close camera"
          >
            <X size={24} color={textColor} />
          </Pressable>
        )}
      </View>
      <View className="flex-1 items-center">
        <Text
          className="text-base font-bold"
          style={{
            color: textColor,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {mode.toUpperCase()}
        </Text>
      </View>

    </View>
  );
}

type SettingsPanelProps = {
  animatedStyle: ComponentProps<typeof Animated.View>['style'];
  cardColor: string;
  textColor: string;
  showSettings: boolean;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  aspectRatioIndex: number;
  setAspectRatioIndex: (fn: (p: number) => number) => void;
  aspectRatios: readonly string[];
  selectedTimer: number;
  setSelectedTimer: (v: number) => void;
  timerOptions: number[];
  getTimerButtonText: () => string;
};

function CameraSettingsPanel({
  animatedStyle,
  cardColor,
  textColor,
  showSettings,
  showGrid,
  setShowGrid,
  soundEnabled,
  setSoundEnabled,
  aspectRatioIndex,
  setAspectRatioIndex,
  aspectRatios,
  selectedTimer,
  setSelectedTimer,
  timerOptions,
  getTimerButtonText,
}: SettingsPanelProps) {
  return (
    <Animated.View
      className="absolute inset-x-5 top-19 z-20 flex-row items-center justify-around rounded-2xl p-4"
      style={[{ backgroundColor: cardColor }, animatedStyle]}
      pointerEvents={showSettings ? 'auto' : 'none'}
    >
      <Pressable
        className={cn(
          'size-12 items-center justify-center rounded-full',
          showGrid && 'bg-primary',
        )}
        onPress={() => setShowGrid(!showGrid)}
        accessibilityRole="button"
        accessibilityLabel="Toggle grid overlay"
        accessibilityState={{ selected: showGrid }}
      >
        <Grid3X3 size={20} color={showGrid ? cardColor : textColor} />
      </Pressable>
      <Pressable
        className={cn(
          'size-12 items-center justify-center rounded-full',
          soundEnabled ? 'bg-primary' : 'bg-card',
        )}
        onPress={() => setSoundEnabled(!soundEnabled)}
        accessibilityRole="button"
        accessibilityLabel="Toggle sound"
        accessibilityState={{ selected: soundEnabled }}
      >
        {soundEnabled
          ? <Volume2 size={20} color={cardColor} />
          : <VolumeX size={20} color={textColor} />}
      </Pressable>
      <Pressable
        className="bg-card size-12 items-center justify-center rounded-full"
        onPress={() => setAspectRatioIndex(p => (p + 1) % 3)}
      >
        <Text variant="caption" className="font-bold" style={{ color: textColor }}>
          {aspectRatios[aspectRatioIndex]}
        </Text>
      </Pressable>
      <Pressable
        className={cn(
          'size-12 items-center justify-center rounded-full',
          selectedTimer > 0 ? 'bg-primary' : 'bg-card',
        )}
        onPress={() => {
          const ci = timerOptions.indexOf(selectedTimer);
          const ni = (ci + 1) % timerOptions.length;
          setSelectedTimer(timerOptions[ni]);
        }}
      >
        <Timer size={16} color={selectedTimer > 0 ? cardColor : textColor} />
        <Text
          variant="caption"
          className="mt-0.5 font-bold"
          style={{ color: selectedTimer > 0 ? cardColor : textColor }}
        >
          {getTimerButtonText()}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type SideControlsProps = {
  enable: { torch: boolean; video: boolean };
  facing: CameraType;
  torch: boolean;
  toggleTorch: () => void;
  toggleCameraFacing: () => void;
  cardColor: string;
  textColor: string;
  zoomFactorText: string;
  handleZoomButtonTap: () => void;
  mode: CameraMode;
  isRecording: boolean;
  isCapturing: boolean;
  toggleMode: () => void;
};

function CameraSideControls({
  enable,
  facing,
  torch,
  toggleTorch,
  toggleCameraFacing,
  cardColor,
  textColor,
  zoomFactorText,
  handleZoomButtonTap,
  mode,
  isRecording,
  isCapturing,
  toggleMode,
}: SideControlsProps) {
  const { torch: enableTorch, video: enableVideo } = enable;
  return (
    <View className="absolute top-1/2 right-5 z-10 -translate-y-30 gap-4">
      {enableTorch && facing === 'back' && (
        <Pressable
          className={cn(
            'size-12 items-center justify-center rounded-full',
            torch ? 'bg-primary' : 'bg-card',
          )}
          onPress={toggleTorch}
          accessibilityRole="button"
          accessibilityLabel={torch ? 'Turn off flash' : 'Turn on flash'}
          accessibilityState={{ selected: torch }}
        >
          {torch
            ? <Zap size={24} color={cardColor} />
            : <ZapOff size={24} color={textColor} />}
        </Pressable>
      )}
      <Pressable
        className="bg-card size-12 items-center justify-center rounded-full"
        onPress={toggleCameraFacing}
        accessibilityRole="button"
        accessibilityLabel="Switch camera"
      >
        <SwitchCamera size={24} color={textColor} />
      </Pressable>
      <Pressable
        className="bg-card size-12 items-center justify-center rounded-full"
        onPress={handleZoomButtonTap}
      >
        <Text className="font-semibold" style={{ color: textColor }}>
          {zoomFactorText}
        </Text>
      </Pressable>
      {enableVideo && (
        <Pressable
          className="bg-card size-12 items-center justify-center rounded-full"
          onPress={toggleMode}
          disabled={isRecording || isCapturing}
          accessibilityRole="button"
          accessibilityLabel={mode === 'picture' ? 'Switch to video mode' : 'Switch to photo mode'}
        >
          {mode === 'picture'
            ? <Video size={24} color={textColor} />
            : <CameraIcon size={24} color={textColor} />}
        </Pressable>
      )}
    </View>
  );
}

type CaptureButtonProps = {
  mode: CameraMode;
  isRecording: boolean;
  isCapturing: boolean;
  isTimerActive: boolean;
  primaryHex: string;
  destructiveColor: string;
  handleCapture: () => void;
  handleStopRecording: () => void;
};

function CameraCaptureButton({
  mode,
  isRecording,
  isCapturing,
  isTimerActive,
  primaryHex,
  destructiveColor,
  handleCapture,
  handleStopRecording,
}: CaptureButtonProps) {
  return (
    <View className="absolute inset-x-5 bottom-10 z-10 flex-row items-center justify-center">
      <Pressable
        className={cn(
          'size-20 items-center justify-center rounded-full border-4',
          (isCapturing || isTimerActive) && 'scale-90',
        )}
        style={{
          backgroundColor: mode === 'video' && isRecording ? destructiveColor : 'white',
          borderColor: mode === 'video' && isRecording ? destructiveColor : primaryHex,
        }}
        onPress={
          mode === 'picture'
            ? handleCapture
            : isRecording
              ? handleStopRecording
              : handleCapture
        }
        disabled={isCapturing || isTimerActive}
        accessibilityRole="button"
        accessibilityLabel={
          mode === 'video'
            ? isRecording
              ? 'Stop recording'
              : 'Start recording'
            : 'Take picture'
        }
      >
        {isCapturing
          ? <ActivityIndicator size="small" color={primaryHex} />
          : (
              <View
                className="size-8 rounded-full"
                style={{
                  backgroundColor: mode === 'video' && isRecording ? 'white' : primaryHex,
                  borderRadius: mode === 'video' && isRecording ? 4 : 30,
                }}
              />
            )}
      </Pressable>
    </View>
  );
}

type CameraGestures = {
  composedGestures: ReturnType<typeof Gesture.Simultaneous>;
  zoomValue: number;
  animatedContainerStyle: ReturnType<typeof useAnimatedStyle>;
  animatedSettingsStyle: ReturnType<typeof useAnimatedStyle>;
  animatedZoomTextStyle: ReturnType<typeof useAnimatedStyle>;
};

function useCameraGestures(
  setZoomFactorText: (v: string) => void,
  settingsAnim: { value: number },
): CameraGestures {
  const fadeAnim = useSharedValue(0);
  const zoomTextAnim = useSharedValue(0);
  const zoom = useSharedValue(0);
  const baseZoom = useSharedValue(0);
  const [zoomValue, setZoomValue] = useState(0);

  useAnimatedReaction(
    () => zoom.value,
    (currentValue) => {
      const text = currentValue === 0 ? '1\u00D7' : `${(1 + currentValue * 4).toFixed(1)}\u00D7`;
      scheduleOnRN(setZoomFactorText, text);
      scheduleOnRN(setZoomValue, currentValue);
    },
    [],
  );

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));
  const animatedSettingsStyle = useAnimatedStyle(() => ({
    opacity: settingsAnim.value,
    transform: [{ translateY: interpolate(settingsAnim.value, [0, 1], [-100, 0]) }],
  }));
  const animatedZoomTextStyle = useAnimatedStyle(() => ({
    opacity: zoomTextAnim.value,
  }));

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      baseZoom.value = zoom.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newZoom = baseZoom.value + (event.scale - 1) * 0.5;
      zoom.value = Math.min(Math.max(newZoom, 0), 1);
    })
    .onEnd(() => {
      'worklet';
      zoomTextAnim.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1000, withTiming(0, { duration: 200 })),
      );
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      const newZoom = zoom.value > 0 ? 0 : 0.5;
      zoom.value = withTiming(newZoom);
      baseZoom.value = newZoom;
      zoomTextAnim.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1000, withTiming(0, { duration: 200 })),
      );
    });

  const composedGestures = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

  useEffect(() => {
    fadeAnim.set(withTiming(1, { duration: 300 }));
  }, [fadeAnim]);

  return {
    composedGestures,
    zoomValue,
    animatedContainerStyle,
    animatedSettingsStyle,
    animatedZoomTextStyle,
  };
}

type CameraActions = {
  cameraRef: React.RefObject<CameraView | null>;
  permission: ReturnType<typeof useCameraPermissions>[0];
  requestPermission: ReturnType<typeof useCameraPermissions>[1];
  torch: boolean;
  isCapturing: boolean;
  isRecording: boolean;
  recordingTime: number;
  mode: CameraMode;
  facing: CameraType;
  showGrid: boolean;
  timerSeconds: number;
  selectedTimer: number;
  isTimerActive: boolean;
  soundEnabled: boolean;
  showSettings: boolean;
  aspectRatioIndex: number;
  currentZoomIndex: number;
  zoomFactorText: string;
  settingsAnim: { value: number };
  composedGestures: ReturnType<typeof Gesture.Simultaneous>;
  zoomValue: number;
  animatedContainerStyle: any;
  animatedSettingsStyle: any;
  animatedZoomTextStyle: any;
  toggleCameraFacing: () => void;
  toggleTorchFn: () => void;
  toggleMode: () => void;
  toggleSettingsFn: () => void;
  handleCapture: () => Promise<void>;
  handleStopRecording: () => Promise<void>;
  startTimer: (seconds: number) => void;
  cancelTimer: () => void;
  getTimerButtonText: () => string;
  handleZoomButtonTap: () => void;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setAspectRatioIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTimer: React.Dispatch<React.SetStateAction<number>>;
};

function useCameraState(initialFacing: CameraType) {
  const cameraRef = useRef<CameraView>(null);
  const _recordingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const _timerIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsAnim = useSharedValue(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<CameraMode>('picture');
  const [facing, setFacing] = useState<CameraType>(initialFacing);
  const [showGrid, setShowGrid] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatioIndex, setAspectRatioIndex] = useState(1);
  const [currentZoomIndex, setCurrentZoomIndex] = useState(0);
  const [zoomFactorText, setZoomFactorText] = useState('1\u00D7');
  const { composedGestures, zoomValue, animatedContainerStyle, animatedSettingsStyle, animatedZoomTextStyle } = useCameraGestures(setZoomFactorText, settingsAnim);
  return {
    cameraRef,
    _recordingIntervalRef,
    _timerIntervalRef,
    settingsAnim,
    permission,
    requestPermission,
    torch,
    setTorch,
    isCapturing,
    setIsCapturing,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    mode,
    setMode,
    facing,
    setFacing,
    showGrid,
    setShowGrid,
    timerSeconds,
    setTimerSeconds,
    selectedTimer,
    setSelectedTimer,
    isTimerActive,
    setIsTimerActive,
    soundEnabled,
    setSoundEnabled,
    showSettings,
    setShowSettings,
    aspectRatioIndex,
    setAspectRatioIndex,
    currentZoomIndex,
    setCurrentZoomIndex,
    zoomFactorText,
    composedGestures,
    zoomValue,
    animatedContainerStyle,
    animatedSettingsStyle,
    animatedZoomTextStyle,
  };
}

function useCameraCapture(args: {
  cameraRef: React.RefObject<CameraView | null>;
  aspectRatioIndex: number;
  maxVideoDuration: number;
  onCapture?: CameraProps['onCapture'];
  onVideoCapture?: CameraProps['onVideoCapture'];
}) {
  const { cameraRef, aspectRatioIndex, maxVideoDuration, onCapture, onVideoCapture } = args;
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const _recordingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingElapsedRef = useRef(0);

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || isRecording)
      return;
    try {
      setIsCapturing(true);
      const picture = await cameraRef.current.takePictureAsync({ quality: 1, base64: false, exif: true });
      if (picture && onCapture)
        onCapture({ type: 'picture', uri: picture.uri, cameraHeight: getCameraHeight(aspectRatioIndex) });
    }
    catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
    setIsCapturing(false);
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording)
      return;
    try {
      await cameraRef.current.stopRecording();
      if (_recordingIntervalRef.current)
        clearInterval(_recordingIntervalRef.current);
    }
    catch (error) {
      console.error('Error stopping recording:', error);
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording || isCapturing)
      return;
    try {
      setIsRecording(true);
      recordingElapsedRef.current = 0;
      setRecordingTime(0);
      _recordingIntervalRef.current = setInterval(() => {
        recordingElapsedRef.current += 1;
        if (recordingElapsedRef.current >= maxVideoDuration) {
          if (_recordingIntervalRef.current) {
            clearInterval(_recordingIntervalRef.current);
            _recordingIntervalRef.current = null;
          }
          stopRecording();
        }
        else {
          setRecordingTime(recordingElapsedRef.current);
        }
      }, 1000);
      const video = await cameraRef.current.recordAsync({ maxDuration: maxVideoDuration });
      if (video && onVideoCapture)
        onVideoCapture({ type: 'video', uri: video.uri, cameraHeight: getCameraHeight(aspectRatioIndex) });
    }
    catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  useEffect(() => () => {
    if (_recordingIntervalRef.current)
      clearInterval(_recordingIntervalRef.current);
  }, []);

  return {
    isCapturing,
    isRecording,
    recordingTime,
    _recordingIntervalRef,
    takePicture,
    startRecording,
    stopRecording,
    setIsCapturing,
    setIsRecording,
    setRecordingTime,
  };
}

function useCameraTimer(args: {
  mode: CameraMode;
  takePicture: () => Promise<void>;
  startRecording: () => Promise<void>;
}) {
  const { mode, takePicture, startRecording } = args;
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const _timerIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerElapsedRef = useRef(0);

  const cancelTimer = () => {
    if (_timerIntervalRef.current)
      clearInterval(_timerIntervalRef.current);
    setIsTimerActive(false);
    setTimerSeconds(0);
  };

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerActive(true);
    timerElapsedRef.current = 0;
    _timerIntervalRef.current = setInterval(() => {
      timerElapsedRef.current += 1;
      if (timerElapsedRef.current >= seconds) {
        if (_timerIntervalRef.current) {
          clearInterval(_timerIntervalRef.current);
          _timerIntervalRef.current = null;
        }
        setIsTimerActive(false);
        setTimerSeconds(0);
        setTimeout(() => {
          mode === 'picture' ? takePicture() : startRecording();
        }, 100);
      }
      else {
        setTimerSeconds(seconds - timerElapsedRef.current);
      }
    }, 1000);
  };

  const getTimerButtonText = () => selectedTimer === 0 ? 'OFF' : `${selectedTimer}s`;

  useEffect(() => () => {
    if (_timerIntervalRef.current)
      clearInterval(_timerIntervalRef.current);
  }, []);

  return {
    timerSeconds,
    setTimerSeconds,
    selectedTimer,
    setSelectedTimer,
    isTimerActive,
    setIsTimerActive,
    startTimer,
    cancelTimer,
    getTimerButtonText,
  };
}

function useCameraActions(
  ref: Ref<CameraRef> | undefined,
  props: Pick<CameraProps, 'onCapture' | 'onVideoCapture' | 'maxVideoDuration' | 'facing'>,
): CameraActions {
  const { onCapture, onVideoCapture, maxVideoDuration = 60, facing: initialFacing = 'back' } = props;
  const s = useCameraState(initialFacing);
  const { settingsAnim } = s;
  const cap = useCameraCapture({
    cameraRef: s.cameraRef,
    aspectRatioIndex: s.aspectRatioIndex,
    maxVideoDuration,
    onCapture,
    onVideoCapture,
  });
  const timer = useCameraTimer({ mode: s.mode, takePicture: cap.takePicture, startRecording: cap.startRecording });

  const toggleCameraFacing = () => s.setFacing(c => c === 'back' ? 'front' : 'back');
  const toggleTorchFn = () => s.setTorch(c => !c);
  const toggleMode = () => {
    if (!cap.isRecording && !cap.isCapturing)
      s.setMode(c => c === 'picture' ? 'video' : 'picture');
  };
  const toggleSettingsFn = () => {
    s.setShowSettings(prev => !prev);
  };

  useEffect(() => {
    settingsAnim.set(withTiming(s.showSettings ? 1 : 0, { duration: 300 }));
  }, [s.showSettings, settingsAnim]);

  const handleCapture = async () => {
    if (cap.isCapturing || cap.isRecording || timer.isTimerActive)
      return;
    if (timer.selectedTimer > 0)
      timer.startTimer(timer.selectedTimer);
    else if (s.mode === 'picture')
      cap.takePicture();
    else cap.startRecording();
  };

  const handleZoomButtonTap = () => {
    const factors = [0, 0.25, 0.5, 0.75, 1.0];
    const nextIndex = (s.currentZoomIndex + 1) % factors.length;
    s.setCurrentZoomIndex(nextIndex);
  };

  useImperativeHandle(ref, () => ({
    switchCamera: toggleCameraFacing,
    toggleTorch: toggleTorchFn,
    takePicture: handleCapture,
    startRecording: cap.startRecording,
    stopRecording: cap.stopRecording,
  }));

  return {
    cameraRef: s.cameraRef,
    permission: s.permission,
    requestPermission: s.requestPermission,
    torch: s.torch,
    isCapturing: cap.isCapturing,
    isRecording: cap.isRecording,
    recordingTime: cap.recordingTime,
    mode: s.mode,
    facing: s.facing,
    showGrid: s.showGrid,
    timerSeconds: timer.timerSeconds,
    selectedTimer: timer.selectedTimer,
    isTimerActive: timer.isTimerActive,
    soundEnabled: s.soundEnabled,
    showSettings: s.showSettings,
    aspectRatioIndex: s.aspectRatioIndex,
    currentZoomIndex: s.currentZoomIndex,
    zoomFactorText: s.zoomFactorText,
    settingsAnim: s.settingsAnim,
    composedGestures: s.composedGestures,
    zoomValue: s.zoomValue,
    animatedContainerStyle: s.animatedContainerStyle,
    animatedSettingsStyle: s.animatedSettingsStyle,
    animatedZoomTextStyle: s.animatedZoomTextStyle,
    toggleCameraFacing,
    toggleTorchFn,
    toggleMode,
    toggleSettingsFn,
    handleCapture,
    handleStopRecording: cap.stopRecording,
    startTimer: timer.startTimer,
    cancelTimer: timer.cancelTimer,
    getTimerButtonText: timer.getTimerButtonText,
    handleZoomButtonTap,
    setShowGrid: s.setShowGrid,
    setSoundEnabled: s.setSoundEnabled,
    setAspectRatioIndex: s.setAspectRatioIndex,
    setSelectedTimer: timer.setSelectedTimer,
  };
}

type ViewfinderProps = {
  style?: ViewStyle;
  onClose?: () => void;
  aspectRatioIndex: number;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  destructiveColor: string;
  primaryHex: string;
  show: { grid: boolean; controls: boolean; settings: boolean };
  isTimerActive: boolean;
  timerSeconds: number;
  isRecording: boolean;
  recordingTime: number;
  mode: CameraMode;
  facing: CameraType;
  torch: boolean;
  zoomFactorText: string;
  enable: { torch: boolean; video: boolean };
  isCapturing: boolean;
  soundEnabled: boolean;
  selectedTimer: number;
  aspectRatios: readonly string[];
  timerOptions: number[];
  animatedContainerStyle: any;
  animatedSettingsStyle: any;
  animatedZoomTextStyle: any;
  zoomValue: number;
  composedGestures: ReturnType<typeof Gesture.Simultaneous>;
  cameraRef: React.RefObject<CameraView | null>;
  cancelTimer: () => void;
  toggleSettings: () => void;
  toggleTorch: () => void;
  toggleCameraFacing: () => void;
  handleZoomButtonTap: () => void;
  toggleMode: () => void;
  handleCapture: () => void;
  handleStopRecording: () => void;
  setShowGrid: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setAspectRatioIndex: (fn: (p: number) => number) => void;
  setSelectedTimer: (v: number) => void;
  getTimerButtonText: () => string;
};

function CameraViewfinder({
  style,
  onClose,
  aspectRatioIndex,
  backgroundColor,
  cardColor,
  textColor,
  destructiveColor,
  primaryHex,
  show,
  isTimerActive,
  timerSeconds,
  isRecording,
  recordingTime,
  mode,
  facing,
  torch,
  zoomFactorText,
  enable,
  isCapturing,
  soundEnabled,
  selectedTimer,
  aspectRatios,
  timerOptions,
  animatedContainerStyle,
  animatedSettingsStyle,
  animatedZoomTextStyle,
  zoomValue,
  composedGestures,
  cameraRef,
  cancelTimer,
  toggleSettings,
  toggleTorch,
  toggleCameraFacing,
  handleZoomButtonTap,
  toggleMode,
  handleCapture,
  handleStopRecording,
  setShowGrid,
  setSoundEnabled,
  setAspectRatioIndex,
  setSelectedTimer,
  getTimerButtonText,
}: ViewfinderProps) {
  const { grid: showGrid, controls: showControls, settings: showSettings } = show;
  const { torch: enableTorch, video: enableVideo } = enable;
  return (
    <Animated.View
      className={cn('flex-1 items-center justify-center', style)}
      style={[{ backgroundColor }, animatedContainerStyle]}
    >
      <View className="w-full overflow-hidden rounded-2xl" style={{ height: getCameraHeight(aspectRatioIndex) }}>
        <GestureDetector gesture={composedGestures}>
          <CameraView
            ref={cameraRef}
            mode={mode}
            style={{ flex: 1 }}
            facing={facing}
            enableTorch={torch}
            animateShutter
            mirror={mode === 'picture' && facing === 'front'}
            ratio={aspectRatios[aspectRatioIndex] as any}
            zoom={zoomValue}
          >
            {showGrid && <CameraGrid />}
            <CameraZoomIndicator animatedStyle={animatedZoomTextStyle} zoomFactorText={zoomFactorText} />
            {isTimerActive && <CameraTimerOverlay timerSeconds={timerSeconds} cancelTimer={cancelTimer} />}
            {isRecording && <CameraRecordingIndicator recordingTime={recordingTime} />}
            {showControls && (
              <>
                <CameraTopControls onClose={onClose} cardColor={cardColor} textColor={textColor} mode={mode} showSettings={showSettings} toggleSettings={toggleSettings} />
                <CameraSettingsPanel animatedStyle={animatedSettingsStyle} cardColor={cardColor} textColor={textColor} showSettings={showSettings} showGrid={showGrid} setShowGrid={setShowGrid} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} aspectRatioIndex={aspectRatioIndex} setAspectRatioIndex={setAspectRatioIndex} aspectRatios={aspectRatios} selectedTimer={selectedTimer} setSelectedTimer={setSelectedTimer} timerOptions={timerOptions} getTimerButtonText={getTimerButtonText} />
                <CameraSideControls enable={{ torch: enableTorch, video: enableVideo }} facing={facing} torch={torch} toggleTorch={toggleTorch} toggleCameraFacing={toggleCameraFacing} cardColor={cardColor} textColor={textColor} zoomFactorText={zoomFactorText} handleZoomButtonTap={handleZoomButtonTap} mode={mode} isRecording={isRecording} isCapturing={isCapturing} toggleMode={toggleMode} />
                <CameraCaptureButton mode={mode} isRecording={isRecording} isCapturing={isCapturing} isTimerActive={false} primaryHex={primaryHex} destructiveColor={destructiveColor} handleCapture={handleCapture} handleStopRecording={handleStopRecording} />
              </>
            )}
          </CameraView>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

export function Camera({ ref, ...props }: CameraProps & { ref?: Ref<CameraRef> }) {
  const { style, onClose, enableTorch = true, showControls = true, enableVideo = true, timerOptions = [0, 3, 10], facing: initialFacing = 'back' } = props;

  const { background: backgroundColor, text: textColor, card: cardColor, destructive: destructiveColor } = useThemeColors();
  const primaryHex = usePrimaryHex();

  const actions = useCameraActions(ref, {
    ...props,
    facing: initialFacing,
  });

  if (!actions.permission)
    return <CameraPermissionLoading backgroundColor={backgroundColor} primaryHex={primaryHex} style={style} />;
  if (!actions.permission.granted)
    return <CameraPermissionDenied cardColor={cardColor} textColor={textColor} requestPermission={actions.requestPermission} style={style} />;

  return (
    <CameraViewfinder
      style={style}
      onClose={onClose}
      aspectRatioIndex={actions.aspectRatioIndex}
      backgroundColor={backgroundColor}
      cardColor={cardColor}
      textColor={textColor}
      destructiveColor={destructiveColor}
      primaryHex={primaryHex}
      show={{ grid: actions.showGrid, controls: showControls, settings: actions.showSettings }}
      isTimerActive={actions.isTimerActive}
      timerSeconds={actions.timerSeconds}
      isRecording={actions.isRecording}
      recordingTime={actions.recordingTime}
      mode={actions.mode}
      facing={actions.facing}
      torch={actions.torch}
      zoomFactorText={actions.zoomFactorText}
      enable={{ torch: enableTorch, video: enableVideo }}
      isCapturing={actions.isCapturing}
      soundEnabled={actions.soundEnabled}
      selectedTimer={actions.selectedTimer}
      aspectRatios={ASPECT_RATIOS}
      timerOptions={timerOptions}
      animatedContainerStyle={actions.animatedContainerStyle}
      animatedSettingsStyle={actions.animatedSettingsStyle}
      animatedZoomTextStyle={actions.animatedZoomTextStyle}
      zoomValue={actions.zoomValue}
      composedGestures={actions.composedGestures}
      cameraRef={actions.cameraRef}
      cancelTimer={actions.cancelTimer}
      toggleSettings={actions.toggleSettingsFn}
      toggleTorch={actions.toggleTorchFn}
      toggleCameraFacing={actions.toggleCameraFacing}
      handleZoomButtonTap={actions.handleZoomButtonTap}
      toggleMode={actions.toggleMode}
      handleCapture={actions.handleCapture}
      handleStopRecording={actions.handleStopRecording}
      setShowGrid={actions.setShowGrid}
      setSoundEnabled={actions.setSoundEnabled}
      setAspectRatioIndex={actions.setAspectRatioIndex}
      setSelectedTimer={actions.setSelectedTimer}
      getTimerButtonText={actions.getTimerButtonText}
    />
  );
}

Camera.displayName = 'Camera';

export type { CameraProps, CameraRef };
