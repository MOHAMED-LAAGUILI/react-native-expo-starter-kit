import * as React from "react";
import { ScrollView, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { cn } from "@/lib/utils";
import { HomeIcon } from "lucide-react-native";

function SectionTitle({ children }: { children: string }) {
  return (
    <View className="mb-3 mt-6 first:mt-0">
      <Text variant="h3">{children}</Text>
      <View className="h-px bg-border mt-2" />
    </View>
  );
}

function HomeScreen() {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const [formValue, setFormValue] = React.useState("");

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6 gap-2 pb-32">
      <Text variant="h2" className="mb-2">Component Demo</Text>
      <Text variant="body" className="text-muted-foreground mb-2">
        All UI, form, and typography components with available variants.
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

      {/* UI Components */}
      <SectionTitle>UI Components</SectionTitle>

      <Text variant="label" className="text-muted-foreground mb-1">Button variants</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        <Button title="Primary" variant="primary" size="sm" />
        <Button title="Secondary" variant="secondary" size="sm" />
        <Button title="Outline" variant="outline" size="sm" />
        <Button title="Ghost" variant="ghost" size="sm" />
        <Button title="Destructive" variant="destructive" size="sm" />
      </View>

      <Text variant="label" className="text-muted-foreground mb-1">Button sizes</Text>
      <View className="flex-row items-center gap-2 mb-4">
        <Button title="Small" size="sm" />
        <Button title="Medium" size="md" />
        <Button title="Large" size="lg" />
      </View>

      <Text variant="label" className="text-muted-foreground mb-1">Button states</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        <Button title="Loading" loading />
        <Button title="Disabled" disabled />
        <Button title="With Icon" variant="outline" leftIcon={<Text className="text-base"><HomeIcon size={15} /></Text>} />
      </View>

      <Text variant="label" className="text-muted-foreground mb-1">Input variants</Text>
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
          leftIcon={<Text className="text-muted-foreground"><HomeIcon size={15} /></Text>}
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          leftIcon={<Text className="text-muted-foreground"><HomeIcon size={15} /></Text>}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          leftIcon={<Text className="text-muted-foreground"><HomeIcon size={15} /></Text>}
          secureTextEntry
        />
        <Input
          label="Phone"
          placeholder="+1 (555) 000-0000"
          leftIcon={<Text className="text-muted-foreground"><HomeIcon size={15} /></Text>}
          keyboardType="phone-pad"
        />
        <Input
          label="With error"
          placeholder="Email"
          value={email}
          onChangeText={(t) => { setEmail(t); setEmailError(""); }}
          error={emailError}
          keyboardType="email-address"
        />
        {!emailError && (
          <Button
            title="Show error"
            variant="ghost"
            size="sm"
            onPress={() => setEmailError("Invalid email address")}
          />
        )}
      </View>

      {/* Form Components */}
      <SectionTitle>Form Components</SectionTitle>
      <View className="gap-3 bg-card p-4 rounded-xl border border-border">
        <FormField
          name="email"
          label="Email"
          placeholder="you@example.com"
          value={formValue}
          onChangeText={setFormValue}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormField
          name="password"
          label="Password"
          placeholder="Enter password"
          secureTextEntry
        />
      </View>
    </ScrollView>
  );
}

export { HomeScreen };
