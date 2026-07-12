import type { ProfileInfoItem } from '@/data/profile-info';
import * as React from 'react';
import { Linking, View } from 'react-native';
import { InfoRow } from '@/components/common/info-row';

type InfoCardsProps = {
  items: ProfileInfoItem[];
};

function InfoCards({ items }: InfoCardsProps) {
  const itemsWithHref = React.useMemo(() => items.map((item) => {
    if (!item.href)
      return item;
    const url = new URL(item.href);
    return { ...item, href: url.href };
  }), [items]);

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      {itemsWithHref.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <View className="mx-4 h-px bg-border" />}
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
