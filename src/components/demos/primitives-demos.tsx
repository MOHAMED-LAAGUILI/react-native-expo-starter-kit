import type { Option } from '@/components/ui';
import { Info, X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { Row } from './typography-and-badge';

function AccordionDemo() {
  return (
    <View className="w-full">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger><Text>What is Expo?</Text></AccordionTrigger>
          <AccordionContent>
            <Text variant="bodySmall" className="text-muted-foreground">
              Expo is a framework for building universal native apps with React.
            </Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger><Text>What is Uniwind?</Text></AccordionTrigger>
          <AccordionContent>
            <Text variant="bodySmall" className="text-muted-foreground">
              Uniwind brings Tailwind CSS to React Native.
            </Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger><Text>Is it responsive?</Text></AccordionTrigger>
          <AccordionContent>
            <Text variant="bodySmall" className="text-muted-foreground">
              Yes, all components work across iOS, Android, and web.
            </Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}

function AlertDemo() {
  return (
    <View className="w-full gap-3">
      <Alert icon={Info}>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your project.</AlertDescription>
      </Alert>
      <Alert variant="destructive" icon={X}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong, please try again.</AlertDescription>
      </Alert>
    </View>
  );
}

function MenubarDemo() {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  const [showStatusBar, setShowStatusBar] = React.useState(true);
  const [theme, setTheme] = React.useState<string | undefined>('system');

  return (
    <View className="w-full">
      <Menubar value={value} onValueChange={setValue}>
        <MenubarMenu value="file">
          <MenubarTrigger><Text>File</Text></MenubarTrigger>
          <MenubarContent>
            <MenubarItem><Text>New Tab</Text></MenubarItem>
            <MenubarItem><Text>New Window</Text></MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive"><Text>Exit</Text></MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger><Text>Edit</Text></MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              <Text>Show Status Bar</Text>
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarLabel><Text>Theme</Text></MenubarLabel>
              <MenubarRadioGroup value={theme} onValueChange={setTheme}>
                <MenubarRadioItem value="light"><Text>Light</Text></MenubarRadioItem>
                <MenubarRadioItem value="dark"><Text>Dark</Text></MenubarRadioItem>
                <MenubarRadioItem value="system"><Text>System</Text></MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger><Text>Share</Text></MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem><Text>Copy Link</Text></MenubarItem>
                <MenubarItem><Text>Email</Text></MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </View>
  );
}

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" title="Open Popover" />
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <Text className="font-semibold">Popover Content</Text>
        <Text variant="bodySmall" className="text-muted-foreground">
          A lightweight popup anchored to the trigger.
        </Text>
      </PopoverContent>
    </Popover>
  );
}

function SelectDemo() {
  const [value, setValue] = React.useState<Option>({ value: 'apple', label: 'Apple' });
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectItem label="Apple" value="apple" />
        <SelectItem label="Banana" value="banana" />
        <SelectItem label="Cherry" value="cherry" />
        <SelectItem label="Grape" value="grape" />
      </SelectContent>
    </Select>
  );
}

function SeparatorDemo() {
  return (
    <View className="w-full gap-3">
      <Text variant="bodySmall">Content above the separator.</Text>
      <Separator />
      <Text variant="bodySmall">Content below the separator.</Text>
    </View>
  );
}

function SkeletonDemo() {
  return (
    <View className="w-full gap-3">
      <Row>
        <Skeleton className="size-12 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      </Row>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-1/3" />
    </View>
  );
}

function TabsDemo() {
  const [value, setValue] = React.useState('account');
  return (
    <View className="w-full">
      <Tabs value={value} onValueChange={setValue}>
        <TabsList className="w-full flex-row">
          <TabsTrigger value="account"><Text>Account</Text></TabsTrigger>
          <TabsTrigger value="password"><Text>Password</Text></TabsTrigger>
          <TabsTrigger value="settings"><Text>Settings</Text></TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-2">
          <Text variant="bodySmall" className="text-muted-foreground">Manage your account information here.</Text>
        </TabsContent>
        <TabsContent value="password" className="mt-2">
          <Text variant="bodySmall" className="text-muted-foreground">Update your password and security settings.</Text>
        </TabsContent>
        <TabsContent value="settings" className="mt-2">
          <Text variant="bodySmall" className="text-muted-foreground">Adjust application preferences and theme.</Text>
        </TabsContent>
      </Tabs>
    </View>
  );
}

function TooltipDemo() {
  return (
    <Row>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" title="Hover Me" />
        </TooltipTrigger>
        <TooltipContent>
          <Text>This is a tooltip.</Text>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Pressable className="bg-muted size-10 items-center justify-center rounded-full">
            <Text>?</Text>
          </Pressable>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <Text>Help tooltip</Text>
        </TooltipContent>
      </Tooltip>
    </Row>
  );
}

export {
  AccordionDemo,
  AlertDemo,
  MenubarDemo,
  PopoverDemo,
  SelectDemo,
  SeparatorDemo,
  SkeletonDemo,
  TabsDemo,
  TooltipDemo,
};
