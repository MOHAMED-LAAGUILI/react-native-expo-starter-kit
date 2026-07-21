import { Bell, Heart, Search, Settings, Star, User } from 'lucide-react-native';
import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { Row } from './typography-and-badge';

function IconDemo() {
  return (
    <>
      <Text variant="label" className="mb-1 text-muted-foreground">Sizes</Text>
      <Row>
        <Icon as={Heart} className="size-4 text-destructive" />
        <Icon as={Heart} className="size-5 text-destructive" />
        <Icon as={Heart} className="size-6 text-destructive" />
        <Icon as={Heart} className="size-8 text-destructive" />
        <Icon as={Heart} className="size-10 text-destructive" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">Theme Colors</Text>
      <Row>
        <Icon as={Star} className="size-6 text-foreground" />
        <Icon as={Star} className="size-6 text-muted-foreground" />
        <Icon as={Star} className="size-6 text-primary" />
        <Icon as={Star} className="size-6 text-destructive" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">Icons Gallery</Text>
      <Row>
        <Icon as={Heart} className="size-6 text-destructive" />
        <Icon as={Bell} className="size-6 text-foreground" />
        <Icon as={Settings} className="size-6 text-muted-foreground" />
        <Icon as={User} className="size-6 text-primary" />
        <Icon as={Star} className="size-6 text-foreground" />
        <Icon as={Search} className="size-6 text-muted-foreground" />
      </Row>

      <Text variant="label" className="mb-1 text-muted-foreground">Inline with Text</Text>
      <View className="flex-row items-center gap-2">
        <Icon as={Heart} className="size-4 text-destructive" />
        <Text variant="body">Likes</Text>
        <Icon as={Bell} className="size-4 text-muted-foreground" />
        <Text variant="body" className="text-muted-foreground">Notifications</Text>
        <Icon as={Settings} className="size-4 text-muted-foreground" />
        <Text variant="body" className="text-muted-foreground">Settings</Text>
      </View>
    </>
  );
}

export { IconDemo };
