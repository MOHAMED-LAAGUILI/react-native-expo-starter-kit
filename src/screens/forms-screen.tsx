import type { DateRange, MediaAsset } from '@/components/ui';
import { Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DateTimePickerDemo,
  TextAreaDemo,
} from '@/components/demos';
import { ActionSheet, Button, DatePicker, InputOTP, MediaPicker, SectionTitle, Text } from '@/components/ui';
import { allActions, confirmationActions, mediaActions } from '@/data/forms';
import { useActionSheet } from '@/hooks/use-action-sheet';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { isIOS } from '@/utils/platform';

function ActionSheetSection() {
  const [visible, setVisible] = useState(false);
  const { show, hide, isVisible, config } = useActionSheet();

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
      <ActionSheet visible={isVisible} onClose={hide} {...config} />
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
          slotStyle={{ borderRadius: 25, borderWidth: 2, borderColor: primary }}
        />
      </View>
      <View className="items-center gap-2">
        <Text variant="label">Success Theme</Text>
        <InputOTP
          length={4}
          value={otp2}
          onChangeText={setOtp2}
          slotStyle={{ borderColor: success, backgroundColor: `${success}10`, borderRadius: 8 }}
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
        onSelectionChange={a => console.log('Selected:', a)}
        onError={e => console.error('Media error:', e)}
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
            {assets.map(a => a.type).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

function DatePickersSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateTime, setDateTime] = useState<Date | undefined>();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  return (
    <>
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
        label="Select Range"
        value={selectedRange}
        onChange={setSelectedRange}
        placeholder="Choose a range"
      />
    </>
  );
}

function FormsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-6 p-6">
        <Text variant="h2" className="mb-1">Forms & Inputs</Text>
        <Text variant="body" className="mb-2 text-muted-foreground">
          Form controls, pickers, and input patterns.
        </Text>

        <SectionTitle title="Action Sheet" />
        <ActionSheetSection />

        <SectionTitle title="OTP Input" />
        <OtpSection />

        <SectionTitle title="Media Picker" />
        <MediaPickerSection />

        <SectionTitle title="Date Pickers" />
        <DatePickersSection />

        <SectionTitle title="Date Time Picker" />
        <DateTimePickerDemo />

        <SectionTitle title="Text Area" />
        <TextAreaDemo />
      </View>
    </ScrollView>
  );
}

export { FormsScreen };
