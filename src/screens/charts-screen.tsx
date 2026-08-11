import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AreaChart,
  BarChart,
  CandlestickChart,
  ChartContainer,
  ColumnChart,
  LineChart,
  RadarChart,
  RadialBarChart,
  SectionTitle,
  StackedAreaChart,
  StackedBarChart,
} from '@/components/ui';
import {
  annualRevenue,
  categories,
  categories2,
  categories3,
  comprehensiveData7,
  customColors,
  largeDataset8,
  largeSampleData6,
  monthlyUsers,
  sampleData3,
  sampleData4,
  sampleData5,
  sampleData9,
  sampleData10,
  sampleData11,
} from '@/data/charts';
import { isIOS } from '@/utils/platform';

function RevenueSection() {
  return (
    <ChartContainer
      title="Annual Revenue"
      description="Revenue trend across the year"
    >
      <LineChart
        data={annualRevenue}
        config={{
          height: 280,
          showGrid: true,
          showLabels: false,
          animated: true,
          duration: 2500,
          showYLabels: true,
          yLabelCount: 7,
          padding: 20,
        }}
      />
    </ChartContainer>
  );
}

function EngagementSection() {
  return (
    <ChartContainer
      title="Interactive User Engagement"
      description="Touch to explore monthly user activity"
    >
      <AreaChart
        data={monthlyUsers}
        config={{
          height: 250,
          showGrid: true,
          showLabels: true,
          animated: true,
          duration: 1500,
          interactive: true,
          showYLabels: true,
          yLabelCount: 5,
        }}
      />
    </ChartContainer>
  );
}

function StackedAreaChartDemo() {
  return (
    <ChartContainer
      title="Monthly Revenue by Product"
      description="Revenue breakdown showing contribution of each product line"
    >
      <StackedAreaChart
        data={sampleData9}
        categories={categories}
        config={{
          height: 300,
          showLabels: true,
          showGrid: true,
          animated: true,
          duration: 1000,
        }}
      />
    </ChartContainer>
  );
}

function SalesSection() {
  return (
    <ChartContainer
      title="Monthly Sales"
      description="Product sales performance by month"
    >
      <BarChart
        data={sampleData3}
        config={{
          height: 220,
          showLabels: true,
          animated: true,
          duration: 1000,
        }}
      />
    </ChartContainer>
  );
}

function StockSection() {
  return (
    <ChartContainer
      title="Stock Price Movement"
      description="Daily OHLC data showing price trends over time"
    >
      <CandlestickChart
        data={sampleData4}
        config={{
          height: 220,
          showGrid: true,
          showLabels: true,
          animated: true,
          duration: 1200,
        }}
      />
    </ChartContainer>
  );
}

function DeviceSection() {
  return (
    <ChartContainer
      title="Device Usage Statistics"
      description="User engagement by device type with custom colors"
    >
      <ColumnChart
        data={sampleData5}
        config={{
          height: 280,
          padding: 24,
          showLabels: true,
          animated: true,
          duration: 1200,
        }}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 12,
          padding: 16,
        }}
      />
    </ChartContainer>
  );
}

function IndustrySection() {
  return (
    <ChartContainer
      title="Industry Revenue Analysis"
      description="Annual revenue by industry sector (in millions)"
    >
      <ColumnChart
        data={largeSampleData6}
        config={{
          height: 500,
          padding: 20,
          showLabels: true,
          animated: true,
          duration: 4000,
        }}
      />
    </ChartContainer>
  );
}

function SkillsSection() {
  return (
    <ChartContainer
      title="360° Skills Assessment"
      description="Comprehensive evaluation across multiple competency areas"
    >
      <RadarChart
        data={comprehensiveData7}
        config={{
          height: 400,
          showLabels: true,
          animated: true,
          duration: 2000,
          maxValue: 100,
        }}
      />
    </ChartContainer>
  );
}

function ProductSection() {
  return (
    <ChartContainer
      title="Product Performance"
      description="Sales performance across all product lines"
    >
      <RadialBarChart
        data={largeDataset8}
        config={{
          animated: true,
          duration: 2000,
          padding: 15,
        }}
      />
    </ChartContainer>
  );
}

function StackedBarChartStyled() {
  return (
    <ChartContainer
      title="Browser Usage by Device"
      description="Browser market share across different device types"
    >
      <StackedBarChart
        data={sampleData10}
        categories={categories2}
        colors={customColors}
        config={{
          height: 320,
          showLabels: true,
          showGrid: true,
          animated: true,
          duration: 1500,
          padding: 30,
        }}
      />
    </ChartContainer>
  );
}

function StackedBarChartHorizontal() {
  return (
    <ChartContainer
      title="Product Sales by Channel"
      description="Sales distribution across different channels"
    >
      <StackedBarChart
        data={sampleData11}
        categories={categories3}
        horizontal={true}
        config={{
          height: 350,
          showLabels: true,
          showGrid: true,
          animated: true,
          duration: 1200,
        }}
      />
    </ChartContainer>
  );
}

export function ChartsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInset={isIOS ? { bottom: insets.bottom + 24 } : undefined}
      contentContainerStyle={isIOS ? undefined : { paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-6 p-6">
        <SectionTitle title={t('navigation.charts')} />
        <RevenueSection />
        <EngagementSection />
        <SalesSection />
        <StockSection />
        <DeviceSection />
        <IndustrySection />
        <SkillsSection />
        <ProductSection />
        <StackedAreaChartDemo />
        <StackedBarChartStyled />

        <StackedBarChartHorizontal />

      </View>
    </ScrollView>
  );
}
