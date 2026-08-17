import type { AssetInfo } from 'expo-media-library';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ButtonSize, ButtonVariant } from './button';
import * as ImagePicker from 'expo-image-picker';
import { Video, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Pressable,
  View,
} from 'react-native';
import { loadExpoMediaLibrary } from '@/utils/permission-utils';
import { isWeb } from '@/utils/platform';
import { cn } from '@/utils/utils';
import { Button } from './button';
import { Image } from './image';
import { Text } from './text';

export type MediaType = 'image' | 'video' | 'all';
export type MediaQuality = 'low' | 'medium' | 'high';

export type MediaAsset = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  filename?: string;
  fileSize?: number;
};

export type MediaPickerProps = {
  children?: ReactNode;
  style?: ViewStyle;
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  mediaType?: MediaType;
  multiple?: boolean;
  maxSelection?: number;
  quality?: MediaQuality;
  buttonText?: string;
  placeholder?: string;
  gallery?: boolean;
  showPreview?: boolean;
  previewSize?: number;
  selectedAssets?: MediaAsset[];
  onSelectionChange?: (assets: MediaAsset[]) => void;
  onError?: (error: string) => void;
};

const { width: screenWidth } = Dimensions.get('window');

function isVideoAsset(item: AssetInfo): boolean {
  return (item.mediaType as string) === 'video';
}

function arraysEqual(a: MediaAsset[], b: MediaAsset[]): boolean {
  if (a.length !== b.length)
    return false;
  return a.every((item, index) => {
    const bItem = b[index];
    return (
      item.id === bItem.id && item.uri === bItem.uri && item.type === bItem.type
    );
  });
}

function resolveTitle(mediaType: MediaType, buttonText?: string): string {
  if (buttonText)
    return buttonText;
  if (mediaType === 'image')
    return 'Select Images';
  if (mediaType === 'video')
    return 'Select Videos';
  return 'Select Media';
}

function appendAssets(opts: {
  current: MediaAsset[];
  incoming: MediaAsset[];
  multiple: boolean;
  maxSelection: number;
}): MediaAsset[] {
  const { current, incoming, multiple, maxSelection } = opts;
  return multiple
    ? [...current, ...incoming].slice(0, maxSelection)
    : incoming;
}

function toggleAsset(opts: {
  current: MediaAsset[];
  newAsset: MediaAsset;
  multiple: boolean;
  maxSelection: number;
}): { assets: MediaAsset[]; close: boolean } {
  const { current, newAsset, multiple, maxSelection } = opts;

  if (!multiple)
    return { assets: [newAsset], close: true };

  const exists = current.some(asset => asset.id === newAsset.id);
  if (exists) {
    return {
      assets: current.filter(asset => asset.id !== newAsset.id),
      close: false,
    };
  }
  if (current.length >= maxSelection) {
    return { assets: current, close: false };
  }

  return { assets: [...current, newAsset], close: false };
}

function buildMediaAsset(galleryAsset: AssetInfo): MediaAsset {
  return {
    id: galleryAsset.id,
    uri: galleryAsset.uri,
    type: isVideoAsset(galleryAsset) ? 'video' : 'image',
    width: galleryAsset.width,
    height: galleryAsset.height,
    duration: galleryAsset.duration || undefined,
    filename: galleryAsset.filename,
  };
}

async function fetchGalleryAssets(
  mediaType: MediaType,
): Promise<AssetInfo[]> {
  const MediaLibrary = await loadExpoMediaLibrary();
  const query = new MediaLibrary.Query();

  if (mediaType === 'image') {
    query.eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.IMAGE);
  }
  else if (mediaType === 'video') {
    query.eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.VIDEO);
  }
  else {
    query.within(MediaLibrary.AssetField.MEDIA_TYPE, [
      MediaLibrary.MediaType.IMAGE,
      MediaLibrary.MediaType.VIDEO,
    ]);
  }

  const found = await query
    .orderBy({
      key: MediaLibrary.AssetField.CREATION_TIME,
      ascending: false,
    })
    .limit(100)
    .exe();

  return Promise.all(found.map(asset => asset.getInfo()));
}

async function pickFromLibrary(opts: {
  mediaType: MediaType;
  multiple: boolean;
  maxSelection: number;
  quality: MediaQuality;
}): Promise<MediaAsset[] | null> {
  const { mediaType, multiple, maxSelection, quality } = opts;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:
      mediaType === 'image'
        ? ['images']
        : mediaType === 'video'
          ? ['videos']
          : ['images', 'videos'],
    allowsMultipleSelection: multiple,
    quality: quality === 'high' ? 1 : quality === 'medium' ? 0.7 : 0.3,
    selectionLimit: multiple ? maxSelection : 1,
  });

  if (result.canceled || !result.assets)
    return null;

  return result.assets.map((asset, index) => ({
    id: `gallery_${Date.now()}_${index}`,
    uri: asset.uri,
    type: asset.type === 'video' ? ('video' as const) : ('image' as const),
    width: asset.width,
    height: asset.height,
    duration: asset.duration || undefined,
    filename: asset.fileName || undefined,
    fileSize: asset.fileSize,
  }));
}

function useMediaLibraryPermissions(opts: {
  onError?: (error: string) => void;
}) {
  const { onError } = opts;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const requestPermissions = async () => {
    try {
      const MediaLibrary = await loadExpoMediaLibrary();
      const { status, canAskAgain: canAsk }
        = await MediaLibrary.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      setCanAskAgain(canAsk);

      if (!granted) {
        onError?.(
          canAsk
            ? 'Media library permission is required to access photos and videos'
            : 'Media library permission was denied. Enable it in Settings to continue.',
        );
      }

      return { granted, canAskAgain: canAsk };
    }
    catch {
      onError?.('Failed to request permissions');
      setHasPermission(false);
      return { granted: false, canAskAgain: true };
    }
  };

  return { hasPermission, canAskAgain, requestPermissions };
}

async function ensureGalleryPermission(opts: {
  hasPermission: boolean | null;
  canAskAgain: boolean;
  requestPermissions: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
  onError?: (error: string) => void;
}): Promise<boolean> {
  const { hasPermission, canAskAgain, requestPermissions, onError } = opts;

  if (isWeb) {
    onError?.('Media library gallery is not available on web');
    return false;
  }

  if (hasPermission)
    return true;

  if (hasPermission === false && !canAskAgain) {
    Linking.openSettings();
    return false;
  }

  const { granted, canAskAgain: canAsk } = await requestPermissions();
  if (!granted) {
    if (!canAsk)
      Linking.openSettings();
    return false;
  }

  return true;
}

function useMediaPickerController(opts: {
  mediaType: MediaType;
  multiple: boolean;
  gallery: boolean;
  maxSelection: number;
  quality: MediaQuality;
  selectedAssets: MediaAsset[];
  onSelectionChange?: (assets: MediaAsset[]) => void;
  onError?: (error: string) => void;
}) {
  const {
    mediaType,
    multiple,
    gallery,
    maxSelection,
    quality,
    selectedAssets,
    onSelectionChange,
    onError,
  } = opts;

  const [assets, setAssets] = useState<MediaAsset[]>(selectedAssets);
  const [prevSelectedAssets, setPrevSelectedAssets] = useState(selectedAssets);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryAssets, setGalleryAssets] = useState<AssetInfo[]>([]);
  const { hasPermission, canAskAgain, requestPermissions }
    = useMediaLibraryPermissions({ onError });

  if (!arraysEqual(prevSelectedAssets, selectedAssets)) {
    setPrevSelectedAssets(selectedAssets);
    setAssets(selectedAssets);
  }

  const handleAssetSelection = (incoming: MediaAsset[]) => {
    const updated = appendAssets({
      current: assets,
      incoming,
      multiple,
      maxSelection,
    });
    setAssets(updated);
    onSelectionChange?.(updated);
  };

  const handleGalleryAssetSelect = (galleryAsset: AssetInfo) => {
    const { assets: updated, close } = toggleAsset({
      current: assets,
      newAsset: buildMediaAsset(galleryAsset),
      multiple,
      maxSelection,
    });
    setAssets(updated);
    onSelectionChange?.(updated);
    if (close)
      setIsGalleryVisible(false);
  };

  const removeAsset = (assetId: string) => {
    const updated = assets.filter(asset => asset.id !== assetId);
    setAssets(updated);
    onSelectionChange?.(updated);
  };

  const pickFromGallery = async () => {
    if (gallery) {
      const granted = await ensureGalleryPermission({
        hasPermission,
        canAskAgain,
        requestPermissions,
        onError,
      });
      if (!granted)
        return;

      try {
        setGalleryAssets(await fetchGalleryAssets(mediaType));
        setIsGalleryVisible(true);
      }
      catch {
        onError?.('Failed to load gallery assets');
      }
      return;
    }

    try {
      const picked = await pickFromLibrary({
        mediaType,
        multiple,
        maxSelection,
        quality,
      });
      if (picked)
        handleAssetSelection(picked);
    }
    catch {
      onError?.('Failed to pick media from gallery');
    }
  };

  return {
    assets,
    galleryAssets,
    isGalleryVisible,
    handleGalleryAssetSelect,
    pickFromGallery,
    removeAsset,
    setIsGalleryVisible,
  };
}

function MediaPreviewItem({
  item,
  previewSize,
  onRemove,
}: {
  item: MediaAsset;
  previewSize: number;
  onRemove: (id: string) => void;
}) {
  return (
    <View className="relative mx-1 overflow-hidden rounded-lg border border-border">
      <Image
        source={{ uri: item.uri }}
        style={{ width: previewSize, height: previewSize, borderRadius: 8 }}
      />
      {item.type === 'video' && (
        <View className="absolute top-2 left-2 rounded-full bg-black/60 p-1">
          <Video size={16} color="white" />
        </View>
      )}
      <Pressable
        onPress={() => onRemove(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.type}`}
        className="absolute top-1.5 right-1.5 size-5 items-center justify-center rounded-full bg-primary"
      >
        <X size={12} color="white" />
      </Pressable>
    </View>
  );
}

function MediaPreview({
  assets,
  previewSize,
  onRemove,
}: {
  assets: MediaAsset[];
  previewSize: number;
  onRemove: (id: string) => void;
}) {
  return (
    <FlatList
      data={assets}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <MediaPreviewItem
          item={item}
          previewSize={previewSize}
          onRemove={onRemove}
        />
      )}
      style={{ marginTop: 12 }}
      contentContainerStyle={{ paddingHorizontal: 4 }}
    />
  );
}

function MediaGalleryItem({
  item,
  assets,
  multiple,
  itemWidth,
  onPress,
}: {
  item: AssetInfo;
  assets: MediaAsset[];
  multiple: boolean;
  itemWidth: number;
  onPress: () => void;
}) {
  const isSelected = assets.some(asset => asset.id === item.id);
  const isVideo = isVideoAsset(item);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${isVideo ? 'Video' : 'Photo'} ${item.filename ?? ''}`}
      accessibilityState={{ selected: isSelected }}
      className={cn('relative m-px overflow-hidden rounded-sm', isSelected && 'border-primary')}
      style={{ width: itemWidth, height: itemWidth, borderWidth: isSelected ? 3 : 0 }}
    >
      <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} />
      {isVideo && (
        <View className="absolute top-2 left-2 rounded-full bg-black/60 p-1">
          <Video size={20} color="white" />
        </View>
      )}
      {multiple && isSelected && (
        <View className="absolute top-2 right-2 size-6 items-center justify-center rounded-full bg-primary">
          <Text className="text-xs font-bold text-white">
            {assets.findIndex(asset => asset.id === item.id) + 1}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function MediaGalleryModal({
  visible,
  title,
  galleryAssets,
  assets,
  multiple,
  maxSelection,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  galleryAssets: AssetInfo[];
  assets: MediaAsset[];
  multiple: boolean;
  maxSelection: number;
  onClose: () => void;
  onSelect: (item: AssetInfo) => void;
}) {
  const itemWidth = screenWidth / 3 - 4;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-card">
        <View className="flex-row items-center justify-between border-b border-border p-4">
          <Text variant="h3">{title}</Text>
          <View className="flex-row items-center gap-4">
            {multiple && (
              <Text className="font-medium text-muted-foreground">
                {assets.length}
                /
                {maxSelection}
              </Text>
            )}
            <Button size="sm" variant="success" title="Done" onPress={onClose} />
          </View>
        </View>

        <FlatList
          data={galleryAssets}
          keyExtractor={item => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <MediaGalleryItem
              item={item}
              assets={assets}
              multiple={multiple}
              itemWidth={itemWidth}
              onPress={() => onSelect(item)}
            />
          )}
          contentContainerStyle={{ padding: 2 }}
        />
      </View>
    </Modal>
  );
}

export function MediaPicker({
  children,
  mediaType = 'all',
  multiple = false,
  gallery = false,
  maxSelection = 10,
  quality = 'high',
  onSelectionChange,
  onError,
  buttonText,
  showPreview = true,
  previewSize = 80,
  style,
  variant,
  size,
  icon,
  disabled = false,
  selectedAssets = [],
  ref,
}: MediaPickerProps & { ref?: React.Ref<View> }) {
  const {
    assets,
    galleryAssets,
    isGalleryVisible,
    handleGalleryAssetSelect,
    pickFromGallery,
    removeAsset,
    setIsGalleryVisible,
  } = useMediaPickerController({
    mediaType,
    multiple,
    gallery,
    maxSelection,
    quality,
    selectedAssets,
    onSelectionChange,
    onError,
  });

  const title = resolveTitle(mediaType, buttonText);

  return (
    <View ref={ref} style={style}>
      {children ?? (
        <Button
          onPress={pickFromGallery}
          disabled={disabled}
          variant={variant}
          size={size}
          title={title}
          leftIconComponent={icon}
        />
      )}

      {showPreview && assets.length > 0 && (
        <MediaPreview
          assets={assets}
          previewSize={previewSize}
          onRemove={removeAsset}
        />
      )}

      {gallery && (
        <MediaGalleryModal
          visible={isGalleryVisible}
          title={title}
          galleryAssets={galleryAssets}
          assets={assets}
          multiple={multiple}
          maxSelection={maxSelection}
          onClose={() => setIsGalleryVisible(false)}
          onSelect={handleGalleryAssetSelect}
        />
      )}
    </View>
  );
}

MediaPicker.displayName = 'MediaPicker';
