import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { Badge } from '@/components/ui/badge';

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

export { BadgeDemo, Row, SectionTitle, TypographyDemo };
