import * as React from 'react';
import { View } from 'react-native';
import { Button, Input } from '@/components/ui';

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

export { InputDemo };
