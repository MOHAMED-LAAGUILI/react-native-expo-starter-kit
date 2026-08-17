import type { DateRange, MediaAsset } from '@/components/ui';
import { Calendar, CreditCard, Eye, EyeOff, Image as ImageIcon, Lock, Mail, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ColorPickerDemo,
  DateTimePickerDemo,
  TextAreaDemo,
} from '@/components/demos';
import { ActionSheet, Button, DatePicker, GroupedInput, GroupedInputItem, Input, InputOTP, MediaPicker, SectionTitle, Text } from '@/components/ui';
import { allActions, confirmationActions, mediaActions } from '@/data/forms';
import { useActionSheet } from '@/hooks/use-action-sheet';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
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

const INITIAL_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
};

function GroupedFormSection() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { muted } = useThemeColors();

  const setField = (field: keyof typeof INITIAL_FORM_DATA, text: string) => {
    setFormData(prev => ({ ...prev, [field]: text }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.firstName)
      next.firstName = 'First name is required';
    if (!formData.email)
      next.email = 'Email is required';
    else if (!formData.email.includes('@'))
      next.email = 'Invalid email format';
    if (!formData.password)
      next.password = 'Password is required';
    else if (formData.password.length < 6)
      next.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setErrors({});
    }
  };

  return (
    <View className="gap-4">
      <GroupedInput title="Account Information">
        <GroupedInputItem label="First Name" placeholder="John" icon={User} value={formData.firstName} onChangeText={text => setField('firstName', text)} error={errors.firstName} />
        <GroupedInputItem label="Last Name" placeholder="Doe" icon={User} value={formData.lastName} onChangeText={text => setField('lastName', text)} />
        <GroupedInputItem label="Email" placeholder="john@example.com" icon={Mail} value={formData.email} onChangeText={text => setField('email', text)} error={errors.email} keyboardType="email-address" />
        <GroupedInputItem label="Phone" placeholder="+1 (555) 123-4567" icon={Phone} value={formData.phone} onChangeText={text => setField('phone', text)} keyboardType="phone-pad" />
      </GroupedInput>

      <View className="gap-3">
        <Input
          label="Password"
          placeholder="Create password"
          icon={Lock}
          value={formData.password}
          onChangeText={text => setField('password', text)}
          error={errors.password}
          secureTextEntry={!showPassword}
          variant="outline"
          rightComponent={(
            <Pressable onPress={() => setShowPassword(c => !c)}>
              {showPassword ? <EyeOff size={22} color={muted} /> : <Eye size={22} color={muted} />}
            </Pressable>
          )}
        />
        <Input
          label="Confirm Password"
          placeholder="Confirm password"
          icon={Lock}
          value={formData.confirmPassword}
          onChangeText={text => setField('confirmPassword', text)}
          error={errors.confirmPassword}
          secureTextEntry={!showConfirm}
          variant="outline"
          rightComponent={(
            <Pressable onPress={() => setShowConfirm(c => !c)}>
              {showConfirm ? <EyeOff size={22} color={muted} /> : <Eye size={22} color={muted} />}
            </Pressable>
          )}
        />
      </View>

      <GroupedInput title="Payment Information">
        <GroupedInputItem label="Card Number" placeholder="1234 5678 9012 3456" icon={CreditCard} value={formData.cardNumber} onChangeText={text => setField('cardNumber', text)} keyboardType="numeric" />
        <GroupedInputItem label="Expiry Date" placeholder="MM/YY" icon={Calendar} value={formData.expiryDate} onChangeText={text => setField('expiryDate', text)} keyboardType="numeric" />
        <GroupedInputItem label="CVV" placeholder="123" value={formData.cvv} onChangeText={text => setField('cvv', text)} keyboardType="numeric" />
      </GroupedInput>

      <Button title="Submit Form" onPress={handleSubmit} className="rounded-full" />
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

        <SectionTitle title="Grouped Form" />
        <GroupedFormSection />

        <SectionTitle title="OTP Input" />
        <OtpSection />

        <SectionTitle title="Media Picker" />
        <MediaPickerSection />

        <SectionTitle title="Date Time Pickers (Custom)" />
        <DatePickersSection />

        <SectionTitle title="Date Time Picker (System)" />
        <DateTimePickerDemo />

        <SectionTitle title="Text Area" />
        <TextAreaDemo />

        <SectionTitle title="Color Picker" />
        <ColorPickerDemo />
      </View>
    </ScrollView>
  );
}

export { FormsScreen };
