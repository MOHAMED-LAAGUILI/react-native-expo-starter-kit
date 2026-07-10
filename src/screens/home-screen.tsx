import { Home } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Badge, Button, Checkbox, Image, Input, Progress, RadioGroup, RadioGroupItem, Slider, Spinner, Switch, Text, Toggle } from '@/components/ui';
import { showToast } from '@/components/ui/toast';

function SectionTitle({ children }: { children: string }) {
  return (
    <View className="mt-6 mb-3 first:mt-0">
      <Text variant="h3">{children}</Text>
      <View className="mt-2 h-px bg-border" />
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View className="mb-4 flex-row flex-wrap items-center gap-3">{children}</View>;
}

function TypographyDemo() {
  return (
    <View className="gap-1 rounded-xl border border-border bg-card p-4">
      <Text variant="h1">Heading h1</Text>
      <Text variant="h2">Heading h2</Text>
      <Text variant="h3">Heading h3</Text>
      <Text variant="h4">Heading h4</Text>
      <Text variant="bodyLarge">Body Large text</Text>
      <Text variant="body">Body - the quick brown fox jumps over the lazy dog.</Text>
      <Text variant="bodySmall">Body Small text</Text>
      <Text variant="caption">Caption text</Text>
      <Text variant="label">Label text</Text>
    </View>
  );
}

function ButtonsDemo() {
  return (
    <>
      <Text variant="label" className="mb-1 text-muted-foreground">Variants</Text>
      <Row>
        <Button title="Primary" variant="primary" size="sm" />
        <Button title="Secondary" variant="secondary" size="sm" />
        <Button title="Outline" variant="outline" size="sm" />
        <Button title="Ghost" variant="ghost" size="sm" />
        <Button title="Destructive" variant="destructive" size="sm" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">Sizes</Text>
      <Row>
        <Button title="Small" size="sm" />
        <Button title="Medium" size="md" />
        <Button title="Large" size="lg" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">States</Text>
      <Row>
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
        <Button
          title="With Icon"
          variant="outline"
          leftIcon={color => <Home size={16} color={color} />}
        />
      </Row>
    </>
  );
}

function SwitchDemo() {
  const [on, setOn] = React.useState(false);
  return (
    <Row>
      <View className="flex-row items-center gap-3">
        <Switch checked={on} onCheckedChange={setOn} />
        <Text variant="body">{on ? 'On' : 'Off'}</Text>
      </View>
      <Switch checked={true} onCheckedChange={() => {}} disabled />
      <Text variant="caption" className="text-muted-foreground">disabled (on)</Text>
    </Row>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = React.useState(false);
  return (
    <Row>
      <View className="flex-row items-center gap-3">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <Text variant="body">{checked ? 'Checked' : 'Unchecked'}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Checkbox checked={true} onCheckedChange={() => {}} disabled />
        <Text variant="caption" className="text-muted-foreground">disabled</Text>
      </View>
    </Row>
  );
}

function RadioGroupDemo() {
  const [fruit, setFruit] = React.useState('apple');
  return (
    <View className="rounded-xl border border-border bg-card p-4">
      <RadioGroup value={fruit} onValueChange={setFruit}>
        <RadioGroupItem value="apple" label="Apple" />
        <RadioGroupItem value="banana" label="Banana" />
        <RadioGroupItem value="orange" label="Orange" />
      </RadioGroup>
    </View>
  );
}

function ToggleDemo() {
  const [pressed, setPressed] = React.useState(false);
  return (
    <Row>
      <Toggle pressed={pressed} onPressedChange={setPressed}>Bold</Toggle>
      <Toggle pressed={true} onPressedChange={() => {}} disabled>Disabled</Toggle>
    </Row>
  );
}

function SliderDemo() {
  const [value, setValue] = React.useState(50);
  return (
    <View className="rounded-xl border border-border bg-card p-4">
      <Slider value={value} onValueChange={setValue} min={0} max={100} />
      <Text variant="body" className="mt-2 text-center">
        Value:
        {value}
      </Text>
    </View>
  );
}

function ProgressDemo() {
  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <Progress value={30} />
      <Progress value={65} />
      <Progress value={100} />
    </View>
  );
}

function SpinnerDemo() {
  return (
    <Row>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="md" className="text-primary" color="#3b82f6" />
      <Text variant="caption" className="text-muted-foreground">(sm, md, lg, colored)</Text>
    </Row>
  );
}

function BadgeDemo() {
  return (
    <>
      <Text variant="label" className="mb-1 text-muted-foreground">Variants</Text>
      <Row>
        <Badge variant="default">default</Badge>
        <Badge variant="primary">primary</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
      </Row>
    </>
  );
}

function ToastDemo() {
  return (
    <Row>
      <Button title="Success" size="sm" onPress={() => showToast({ message: 'Operation completed.', title: 'Success!', variant: 'success' })} />
      <Button title="Error" size="sm" variant="destructive" onPress={() => showToast({ message: 'Something went wrong.', title: 'Error', variant: 'error' })} />
      <Button title="Info" size="sm" variant="outline" onPress={() => showToast({ message: 'Here is some information.', title: 'Info', variant: 'info' })} />
    </Row>
  );
}

function ImageDemo() {
  return (
    <Row>
      <Image source={{ uri: 'https://picsum.photos/seed/a/100/100' }} className="size-20 rounded-xl" style={{ height: 80, width: 80 }} />
      <Image source={{ uri: 'https://picsum.photos/seed/b/200/200' }} className="size-20 rounded-full" style={{ borderRadius: 40, height: 80, width: 80 }} />
      <View>
        <Text variant="caption" className="text-muted-foreground">Square + Circle</Text>
      </View>
    </Row>
  );
}

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

function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6 gap-2 pb-32">
      <Text variant="h2" className="mb-2">Component Demo</Text>
      <Text variant="body" className="mb-2 text-muted-foreground">All UI components with available variants.</Text>

      <SectionTitle>Typography</SectionTitle>
      <TypographyDemo />

      <SectionTitle>Buttons</SectionTitle>
      <ButtonsDemo />

      <SectionTitle>Switch</SectionTitle>
      <SwitchDemo />

      <SectionTitle>Checkbox</SectionTitle>
      <CheckboxDemo />

      <SectionTitle>Radio Group</SectionTitle>
      <RadioGroupDemo />

      <SectionTitle>Toggle</SectionTitle>
      <ToggleDemo />

      <SectionTitle>Slider</SectionTitle>
      <SliderDemo />

      <SectionTitle>Progress</SectionTitle>
      <ProgressDemo />

      <SectionTitle>Spinner</SectionTitle>
      <SpinnerDemo />

      <SectionTitle>Badge</SectionTitle>
      <BadgeDemo />

      <SectionTitle>Toast</SectionTitle>
      <ToastDemo />

      <SectionTitle>Image</SectionTitle>
      <ImageDemo />

      <SectionTitle>Input</SectionTitle>
      <InputDemo />
    </ScrollView>
  );
}

export { HomeScreen };
