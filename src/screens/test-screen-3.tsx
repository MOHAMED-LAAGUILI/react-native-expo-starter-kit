import type { MediaAsset } from '@/components/test/media-picker';
import {
  Archive,
  Bookmark,
  Camera,
  Copy,
  Download,
  Edit,
  EyeOff,
  FileText,
  Flag,
  Heart,
  Image as ImageIcon,
  Mic,
  Pin,
  Send,
  Share,
  Star,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionSheet } from '@/components/test/action-sheet';
import { InputOTP } from '@/components/test/input-otp';
import { MediaPicker } from '@/components/test/media-picker';
import { useActionSheet } from '@/components/test/use-action-sheet';
import { Button, Icon, Text } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

const mediaActions = [
  { title: 'Take Photo', onPress: () => console.log('Take photo'), icon: <Icon as={Camera} /> },
  { title: 'Choose from Gallery', onPress: () => console.log('Choose from gallery'), icon: <Icon as={ImageIcon} /> },
  { title: 'Record Audio', onPress: () => console.log('Record audio'), icon: <Icon as={Mic} /> },
  { title: 'Add Document', onPress: () => console.log('Add document'), icon: <Icon as={FileText} /> },
];

const allActions = [
  { title: 'Edit Document', onPress: () => console.log('Edit'), icon: <Icon as={Edit} /> },
  { title: 'Share', onPress: () => console.log('Share'), icon: <Icon as={Share} /> },
  { title: 'Download', onPress: () => console.log('Download'), icon: <Icon as={Download} /> },
  { title: 'Copy Link', onPress: () => console.log('Copy link'), icon: <Icon as={Copy} /> },
  { title: 'Archive', onPress: () => console.log('Archive'), icon: <Icon as={Archive} /> },
  { title: 'Pin to Top', onPress: () => console.log('Pin'), icon: <Icon as={Pin} /> },
  { title: 'Add to Favorites', onPress: () => console.log('Favorite'), icon: <Icon as={Heart} /> },
  { title: 'Rate & Review', onPress: () => console.log('Rate'), icon: <Icon as={Star} /> },
  { title: 'Bookmark', onPress: () => console.log('Bookmark'), icon: <Icon as={Bookmark} /> },
  { title: 'Send Message', onPress: () => console.log('Send message'), icon: <Icon as={Send} /> },
  { title: 'Hide from Feed', onPress: () => console.log('Hide'), icon: <Icon as={EyeOff} /> },
  { title: 'Report Issue', onPress: () => console.log('Report'), icon: <Icon as={Flag} /> },
  { title: 'Delete', onPress: () => console.log('Delete'), destructive: true, icon: <Icon as={Trash2} /> },
];

const confirmationActions = [
  { title: 'Yes, Continue', onPress: () => console.log('Confirmed'), destructive: true, centered: true },
];

function ActionSheetSection() {
  const [visible, setVisible] = useState(false);
  const { show, ActionSheet: HookActionSheet } = useActionSheet();

  return (
    <View className="gap-3">
      <Button
        title="Open Action Sheet"
        onPress={() => setVisible(true)}
        className="rounded-full"
      />
      <Button
        title="Add Media"
        onPress={() =>
          show({
            title: 'Add Media',
            message: 'Choose the type of media to add',
            options: mediaActions,
          })}
        className="rounded-full"
      />
      <Button
        title="Show Confirmation"
        variant="outline"
        onPress={() =>
          show({
            title: 'Confirm Action',
            message: 'This action cannot be undone',
            options: confirmationActions,
          })}
        className="rounded-full"
      />
      <ActionSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title="All Actions"
        message="Scroll to see all available options"
        options={allActions}
      />
      {HookActionSheet}
    </View>
  );
}

function OtpSection() {
  const [otp1, setOtp1] = useState('');
  const [otp2, setOtp2] = useState('');
  const [otp3, setOtp3] = useState('');
  const primary = usePrimaryHex();
  const success = '#10B981';
  const red = '#e93030ff';

  return (
    <View className="gap-6">
      <View className="items-center gap-2">
        <Text variant="label">Rounded Style</Text>
        <InputOTP
          length={6}
          value={otp1}
          onChangeText={setOtp1}
          slotStyle={{
            borderRadius: 25,
            borderWidth: 2,
            borderColor: primary,
          }}
        />
      </View>
      <View className="items-center gap-2">
        <Text variant="label">Success Theme</Text>
        <InputOTP
          length={4}
          value={otp2}
          onChangeText={setOtp2}
          slotStyle={{
            borderColor: success,
            backgroundColor: `${success}10`,
            borderRadius: 8,
          }}
        />
      </View>
      <View className="items-center gap-2">
        <Text variant="label">Large & Red</Text>
        <InputOTP
          length={4}
          value={otp3}
          onChangeText={setOtp3}
          slotStyle={{
            width: 50,
            height: 50,
            borderColor: red,
            borderWidth: 2,
            borderRadius: 12,
            backgroundColor: `${red}05`,
          }}
          containerStyle={{ gap: 12 }}
        />
      </View>
    </View>
  );
}

function MediaPickerSection() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  return (
    <View style={{ gap: 16 }}>
      <MediaPicker
        mediaType="all"
        onSelectionChange={(assets) => {
          console.log('Selected assets:', assets);
        }}
        onError={(error) => {
          console.error('Media picker error:', error);
        }}
      />
      <MediaPicker
        mediaType="all"
        multiple={true}
        maxSelection={6}
        showPreview={true}
        previewSize={100}
        buttonText="Add Media"
        icon={ImageIcon}
        selectedAssets={assets}
        onSelectionChange={(newAssets) => {
          setAssets(newAssets);
          console.log('Assets with preview:', newAssets);
        }}
      />
      {assets.length > 0 && (
        <View>
          <Text variant="caption">
            {assets.length}
            {' '}
            item
            {assets.length !== 1 ? 's' : ''}
            {' '}
            selected
          </Text>
          <Text variant="caption">
            Types:
            {' '}
            {assets.map(a => a.type).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

export function TestScreen3() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      contentInset={{ bottom: insets.bottom }}
    >
      <View className="gap-6 p-6">

        <Text variant="h2">Action Sheet</Text>
        <ActionSheetSection />

        <Text variant="h2">OTP</Text>
        <OtpSection />

        <Text variant="h2">Media Picker</Text>
        <MediaPickerSection />

      </View>
    </ScrollView>
  );
}
