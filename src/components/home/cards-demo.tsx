import { BarChart3, Box, Zap } from 'lucide-react-native';
import { View } from 'react-native';
import { Card } from '@/components/ui';

function CardsDemo() {
  return (
    <View className="gap-4">
      <Card
        variant="primary"
        title="Aujourd'hui"
        value="66.00 DH"
        subtitle="2 commandes"
        icon={BarChart3}
      />
      <Card
        variant="stats"
        title="Total des ventes"
        value="66.00 DH"
        subtitle="2 Total des commandes"
        icon={BarChart3}
      />

      <View className="flex-row gap-3">
        <Card
          variant="compact"
          title="Stock"
          value="2"
          icon={Box}
          className="flex-1"
        />
        <Card
          variant="compact"
          title="Stock bas"
          value="1"
          icon={Zap}
          className="flex-1"
        />
      </View>
    </View>
  );
}

export { CardsDemo };
