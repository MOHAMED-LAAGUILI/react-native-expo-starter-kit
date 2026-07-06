import { Eye, EyeOff, Home, Lock, Mail, Phone, Search } from "lucide-react-native";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Image } from "@/components/ui/Image";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Slider } from "@/components/ui/Slider";
import { Spinner } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";

function SectionTitle({ children }: { children: string }) {
  return (
    <View className="mb-3 mt-6 first:mt-0">
      <Text variant="h3">{children}</Text>
      <View className="h-px bg-border mt-2" />
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-3 mb-4">{children}</View>;
}

function HomeScreen() {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [switchOn, setSwitchOn] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [fruit, setFruit] = React.useState("apple");
  const [sliderValue, setSliderValue] = React.useState(50);
  const [togglePressed, setTogglePressed] = React.useState(false);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6 gap-2 pb-32"
    >
      <Text
        variant="h2"
        className="mb-2"
      >
        Component Demo
      </Text>
      <Text
        variant="body"
        className="text-muted-foreground mb-2"
      >
        All UI components with available variants.
      </Text>

      {/* Typography */}
      <SectionTitle>Typography</SectionTitle>
      <View className="gap-1 bg-card p-4 rounded-xl border border-border">
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

      {/* Buttons */}
      <SectionTitle>Buttons</SectionTitle>
      <Text
        variant="label"
        className="text-muted-foreground mb-1"
      >
        Variants
      </Text>
      <Row>
        <Button
          title="Primary"
          variant="primary"
          size="sm"
        />
        <Button
          title="Secondary"
          variant="secondary"
          size="sm"
        />
        <Button
          title="Outline"
          variant="outline"
          size="sm"
        />
        <Button
          title="Ghost"
          variant="ghost"
          size="sm"
        />
        <Button
          title="Destructive"
          variant="destructive"
          size="sm"
        />
      </Row>

      <Text
        variant="label"
        className="text-muted-foreground mb-1"
      >
        Sizes
      </Text>
      <Row>
        <Button
          title="Small"
          size="sm"
        />
        <Button
          title="Medium"
          size="md"
        />
        <Button
          title="Large"
          size="lg"
        />
      </Row>

      <Text
        variant="label"
        className="text-muted-foreground mb-1"
      >
        States
      </Text>
      <Row>
        <Button
          title="Loading"
          loading
        />
        <Button
          title="Disabled"
          disabled
        />
        <Button
          title="With Icon"
          variant="outline"
          leftIcon={
            <Home
              size={16}
              className="text-foreground"
            />
          }
        />
      </Row>

      {/* Switch */}
      <SectionTitle>Switch</SectionTitle>
      <Row>
        <View className="flex-row items-center gap-3">
          <Switch
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
          <Text variant="body">{switchOn ? "On" : "Off"}</Text>
        </View>
        <Switch
          checked={true}
          onCheckedChange={() => {}}
          disabled
        />
        <Text
          variant="caption"
          className="text-muted-foreground"
        >
          disabled (on)
        </Text>
      </Row>

      {/* Checkbox */}
      <SectionTitle>Checkbox</SectionTitle>
      <Row>
        <View className="flex-row items-center gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
          />
          <Text variant="body">{checked ? "Checked" : "Unchecked"}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Checkbox
            checked={true}
            onCheckedChange={() => {}}
            disabled
          />
          <Text
            variant="caption"
            className="text-muted-foreground"
          >
            disabled
          </Text>
        </View>
      </Row>

      {/* Radio Group */}
      <SectionTitle>Radio Group</SectionTitle>
      <View className="bg-card p-4 rounded-xl border border-border">
        <RadioGroup
          value={fruit}
          onValueChange={setFruit}
        >
          <RadioGroupItem
            value="apple"
            label="Apple"
          />
          <RadioGroupItem
            value="banana"
            label="Banana"
          />
          <RadioGroupItem
            value="orange"
            label="Orange"
          />
        </RadioGroup>
      </View>

      {/* Toggle */}
      <SectionTitle>Toggle</SectionTitle>
      <Row>
        <Toggle
          pressed={togglePressed}
          onPressedChange={setTogglePressed}
        >
          Bold
        </Toggle>
        <Toggle
          pressed={true}
          onPressedChange={() => {}}
          disabled
        >
          Disabled
        </Toggle>
      </Row>

      {/* Slider */}
      <SectionTitle>Slider</SectionTitle>
      <View className="bg-card p-4 rounded-xl border border-border">
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          min={0}
          max={100}
        />
        <Text
          variant="body"
          className="text-center mt-2"
        >
          Value: {sliderValue}
        </Text>
      </View>

      {/* Progress */}
      <SectionTitle>Progress</SectionTitle>
      <View className="bg-card p-4 rounded-xl border border-border gap-3">
        <Progress value={30} />
        <Progress value={65} />
        <Progress value={100} />
      </View>

      {/* Spinner */}
      <SectionTitle>Spinner</SectionTitle>
      <Row>
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner
          size="md"
          className="text-primary"
          color="#3b82f6"
        />
        <Text
          variant="caption"
          className="text-muted-foreground"
        >
          (sm, md, lg, colored)
        </Text>
      </Row>

      {/* Badge */}
      <SectionTitle>Badge</SectionTitle>
      <Text
        variant="label"
        className="text-muted-foreground mb-1"
      >
        Variants
      </Text>
      <Row>
        <Badge variant="default">default</Badge>
        <Badge variant="primary">primary</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
      </Row>

      {/* Image */}
      <SectionTitle>Image</SectionTitle>
      <Row>
        <Image
          source={{ uri: "https://picsum.photos/seed/a/100/100" }}
          className="w-20 h-20 rounded-xl"
        />
        <Image
          source={{ uri: "https://picsum.photos/seed/b/200/200" }}
          className="w-20 h-20 rounded-full"
        />
        <View>
          <Text
            variant="caption"
            className="text-muted-foreground"
          >
            Square + Circle
          </Text>
        </View>
      </Row>

      {/* Input */}
      <SectionTitle>Input</SectionTitle>
      <View className="gap-3 mb-4">
        <Input
          label="Default"
          placeholder="Type something..."
          value={inputValue}
          onChangeText={setInputValue}
        />
        <Input
          label="Search"
          placeholder="Search..."
          leftIcon={
            <Search
              size={16}
              className="text-muted-foreground"
            />
          }
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          leftIcon={
            <Mail
              size={16}
              className="text-muted-foreground"
            />
          }
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          leftIcon={
            <Lock
              size={16}
              className="text-muted-foreground"
            />
          }
          secureTextEntry={!showPassword}
          rightIcon={
            <Pressable
              onPress={() => setShowPassword(p => !p)}
              hitSlop={8}
            >
              {showPassword ? (
                <EyeOff
                  size={16}
                  className="text-muted-foreground"
                />
              ) : (
                <Eye
                  size={16}
                  className="text-muted-foreground"
                />
              )}
            </Pressable>
          }
        />
        <Input
          label="Phone"
          placeholder="+1 (555) 000-0000"
          leftIcon={
            <Phone
              size={16}
              className="text-muted-foreground"
            />
          }
          keyboardType="phone-pad"
        />
        <Input
          label="With error"
          placeholder="Email"
          value={email}
          onChangeText={t => {
            setEmail(t);
            setEmailError("");
          }}
          error={emailError}
          keyboardType="email-address"
        />

        <Button
          title={emailError ? "Reset Error" : "Trigger Error"}
          variant="outline"
          size="sm"
          onPress={() => (emailError ? setEmailError("") : setEmailError("Invalid email address"))}
        />
      </View>
    </ScrollView>
  );
}

export { HomeScreen };
