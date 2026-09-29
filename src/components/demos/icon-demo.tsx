import { Menu, Pause, Play, X } from 'lucide';
import { Bell, Heart, Search, Settings, Star, User } from 'lucide-react-native';
import { View } from 'react-native';
import { Icon, MorphToggle, Text } from '@/components/ui';
import { Row } from './typography-and-badge';

function MorphDemo() {
  return (
    <>
      <Text variant="label" className="text-muted-foreground mb-1">Morph Effect</Text>
      <Row>
        <MorphToggle
          icon={Menu}
          morphIcon={X}
          label="Toggle menu icon"
          spring="bouncy"
          className="bg-primary/10 active:bg-primary/20 size-11 items-center justify-center rounded-full"
          iconClassName="size-6 text-primary"
        />
        <MorphToggle
          icon={Play}
          morphIcon={Pause}
          label="Toggle play icon"
          className="bg-destructive/10 active:bg-destructive/20 size-11 items-center justify-center rounded-full"
          iconClassName="size-6 text-destructive"
        />
        <Text variant="body" className="text-muted-foreground">Tap to morph</Text>
      </Row>
    </>
  );
}

function IconDemo() {
  return (
    <>
      <Text variant="label" className="text-muted-foreground mb-1">Sizes</Text>
      <Row>
        <Icon as={Heart} className="text-destructive size-4" />
        <Icon as={Heart} className="text-destructive size-5" />
        <Icon as={Heart} className="text-destructive size-6" />
        <Icon as={Heart} className="text-destructive size-8" />
        <Icon as={Heart} className="text-destructive size-10" />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">Theme Colors</Text>
      <Row>
        <Icon as={Star} className="text-foreground size-6" />
        <Icon as={Star} className="text-muted-foreground size-6" />
        <Icon as={Star} className="text-primary size-6" />
        <Icon as={Star} className="text-destructive size-6" />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">Icons Gallery</Text>
      <Row>
        <Icon as={Heart} className="text-destructive size-6" />
        <Icon as={Bell} className="text-foreground size-6" />
        <Icon as={Settings} className="text-muted-foreground size-6" />
        <Icon as={User} className="text-primary size-6" />
        <Icon as={Star} className="text-foreground size-6" />
        <Icon as={Search} className="text-muted-foreground size-6" />
      </Row>

      <Text variant="label" className="text-muted-foreground mb-1">Inline with Text</Text>
      <View className="flex-row items-center gap-2">
        <Icon as={Heart} className="text-destructive size-4" />
        <Text variant="body">Likes</Text>
        <Icon as={Bell} className="text-muted-foreground size-4" />
        <Text variant="body" className="text-muted-foreground">Notifications</Text>
        <Icon as={Settings} className="text-muted-foreground size-4" />
        <Text variant="body" className="text-muted-foreground">Settings</Text>
      </View>

      <MorphDemo />
    </>
  );
}

export { IconDemo };
