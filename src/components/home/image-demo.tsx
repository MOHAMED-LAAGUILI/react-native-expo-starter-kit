import { View } from 'react-native';
import { Image, Text } from '@/components/ui';

import { Row } from './typography-and-badge';

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

export { ImageDemo };
