import type { ProfileInfoItem } from '@/data/profile-info';
import * as React from 'react';
import { Linking, View } from 'react-native';
import { Divider } from '@/components/common/divider';
import { InfoRow } from '@/components/common/info-row';

type InfoCardsProps = {
  items: ProfileInfoItem[];
};

function InfoCards({ items }: InfoCardsProps) {
  const itemsWithHref = items.map((item) => {
    if (!item.href)
      return item;
    const url = new URL(item.href);
    return { ...item, href: url.href };
  });

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      {itemsWithHref.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <Divider />}
          <InfoRow
            icon={item.icon}
            label={item.label}
            value={item.value}
            href={item.href}
            onPress={item.href ? () => Linking.openURL(item.href!) : undefined}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

export { InfoCards };
export type { InfoCardsProps };
