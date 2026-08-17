import { Calendar, CreditCard, Eye, EyeOff, Lock, Mail, Phone, Search, User } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Button, GroupedInput, GroupedInputItem, Input } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';

function InputDemo() {
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');

  return (
    <View className="mb-4 gap-3">
      <Input label="Default" placeholder="Type something..." value={inputValue} onChangeText={setInputValue} />
      <Input type="search" label="Search" placeholder="Search..." />
      <Input type="email" label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Input type="password" label="Password" placeholder="Enter password" />
      <Input type="phone" label="Phone" placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
      <Input
        type="email"
        label="With error"
        placeholder="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setEmailError('');
        }}
        error={emailError}
        keyboardType="email-address"
      />
      <Button
        title={emailError ? 'Reset Error' : 'Trigger Error'}
        variant="outline"
        size="sm"
        onPress={() => (emailError ? setEmailError('') : setEmailError('Invalid email address'))}
      />
    </View>
  );
}

function OutlineInputDemo() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { muted } = useThemeColors();

  return (
    <View className="mb-4 gap-3">
      <Input label="Search" placeholder="Search with button..." icon={Search} variant="outline" rightComponent={<Button title="Go" size="sm" variant="secondary" />} />
      <Input
        label="Password"
        placeholder="Create password"
        icon={Lock}
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
        secureTextEntry={!showConfirm}
        variant="outline"
        rightComponent={(
          <Pressable onPress={() => setShowConfirm(c => !c)}>
            {showConfirm ? <EyeOff size={22} color={muted} /> : <Eye size={22} color={muted} />}
          </Pressable>
        )}
      />
    </View>
  );
}

function GroupedInputDemo() {
  return (
    <View className="mb-4 gap-4">
      <GroupedInput title="Account Information">
        <GroupedInputItem label="First Name" placeholder="John" icon={User} />
        <GroupedInputItem label="Last Name" placeholder="Doe" icon={User} />
        <GroupedInputItem label="Email" placeholder="john@example.com" icon={Mail} keyboardType="email-address" />
        <GroupedInputItem label="Phone" placeholder="+1 (555) 123-4567" icon={Phone} keyboardType="phone-pad" />
      </GroupedInput>

      <GroupedInput title="Payment Information">
        <GroupedInputItem label="Card Number" placeholder="1234 5678 9012 3456" icon={CreditCard} keyboardType="numeric" />
        <GroupedInputItem label="Expiry Date" placeholder="MM/YY" icon={Calendar} keyboardType="numeric" />
        <GroupedInputItem label="CVV" placeholder="123" keyboardType="numeric" />
      </GroupedInput>
    </View>
  );
}

export { GroupedInputDemo, InputDemo, OutlineInputDemo };
