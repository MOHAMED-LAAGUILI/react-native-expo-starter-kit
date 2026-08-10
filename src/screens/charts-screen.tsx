import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { AreaChart } from '@/components/test/charts/area-chart';
import { BarChart } from '@/components/test/charts/bar-chart';
import { CandlestickChart } from '@/components/test/charts/candlestick-chart';
import { ChartContainer } from '@/components/test/charts/chart-container';
import { ColumnChart } from '@/components/test/charts/column-chart';
import { LineChart } from '@/components/test/charts/line-chart';
import { RadarChart } from '@/components/test/charts/radar-chart';
import { RadialBarChart } from '@/components/test/charts/radial-bar-chart';
import { StackedAreaChart } from '@/components/test/charts/stacked-area-chart';
import { StackedBarChart } from '@/components/test/charts/stacked-bar-chart';
import { Text } from '@/components/ui';

const monthlyUsers = [
  { x: 'Jan', y: 4000, label: 'January' },
  { x: 'Feb', y: 3000, label: 'February' },
  { x: 'Mar', y: 5000, label: 'March' },
  { x: 'Apr', y: 4500, label: 'April' },
  { x: 'May', y: 6000, label: 'May' },
  { x: 'Jun', y: 7200, label: 'June' },
  { x: 'Jul', y: 6800, label: 'July' },
];

const annualRevenue = [
  { x: 'Jan', y: 65000, label: 'January' },
  { x: 'Feb', y: 80000, label: 'February' },
  { x: 'Mar', y: 75000, label: 'March' },
  { x: 'Apr', y: 95000, label: 'April' },
  { x: 'May', y: 110000, label: 'May' },
  { x: 'Jun', y: 125000, label: 'June' },
  { x: 'Jul', y: 140000, label: 'July' },
  { x: 'Aug', y: 135000, label: 'August' },
  { x: 'Sep', y: 150000, label: 'September' },
  { x: 'Oct', y: 165000, label: 'October' },
  { x: 'Nov', y: 180000, label: 'November' },
  { x: 'Dec', y: 195000, label: 'December' },
];

const sampleData3 = [
  { label: 'Jan', value: 65, color: '#3b82f6' },
  { label: 'Feb', value: 78, color: '#ef4444' },
  { label: 'Mar', value: 52, color: '#10b981' },
  { label: 'Apr', value: 91, color: '#f59e0b' },
  { label: 'May', value: 73, color: '#8b5cf6' },
  { label: 'Jun', value: 85, color: '#06b6d4' },
];

const sampleData4 = [
  { date: 'Jan 1', open: 100, high: 120, low: 95, close: 110 },
  { date: 'Jan 2', open: 110, high: 125, low: 105, close: 115 },
  { date: 'Jan 3', open: 115, high: 130, low: 110, close: 125 },
  { date: 'Jan 4', open: 125, high: 140, low: 120, close: 135 },
  { date: 'Jan 5', open: 135, high: 145, low: 125, close: 128 },
  { date: 'Jan 6', open: 128, high: 135, low: 118, close: 132 },
  { date: 'Jan 7', open: 132, high: 142, low: 128, close: 138 },
  { date: 'Jan 8', open: 138, high: 148, low: 132, close: 145 },
  { date: 'Jan 9', open: 145, high: 155, low: 140, close: 150 },
  { date: 'Jan 10', open: 150, high: 160, low: 145, close: 155 },
];

const sampleData5 = [
  { label: 'Mobile', value: 45, color: '#3b82f6' },
  { label: 'Desktop', value: 35, color: '#10b981' },
  { label: 'Tablet', value: 15, color: '#f59e0b' },
  { label: 'Smart TV', value: 8, color: '#ef4444' },
  { label: 'Wearable', value: 3, color: '#8b5cf6' },
];

const largeSampleData6 = [
  { label: 'E-commerce', value: 2840, color: '#ff0066' },
  { label: 'AI', value: 2440, color: '#ff9900' },
  { label: 'Healthcare', value: 2150, color: '#00e6cc' },
  { label: 'Education', value: 1920, color: '#0099ff' },
  { label: 'Finance', value: 1780, color: '#ffcc00' },
  { label: 'Real Estate', value: 1650, color: '#9933ff' },
  { label: 'Travel', value: 1420, color: '#ff0080' },
  { label: 'Food & Dining', value: 1380, color: '#00cc66' },
  { label: 'Entertainment', value: 1250, color: '#ff6600' },
  { label: 'Sports', value: 1180, color: '#3399ff' },
  { label: 'Technology', value: 1050, color: '#cc66ff' },
  { label: 'Fashion', value: 980, color: '#ff3030' },
  { label: 'Automotive', value: 875, color: '#ff9900' },
  { label: 'Home & Garden', value: 720, color: '#0066ff' },
  { label: 'Beauty', value: 650, color: '#ff3366' },
  { label: 'Pets', value: 580, color: '#00ffcc' },
];

const comprehensiveData7 = [
  { label: 'Leadership', value: 85 },
  { label: 'Communication', value: 90 },
  { label: 'Technical Skills', value: 88 },
  { label: 'Problem Solving', value: 92 },
  { label: 'Creativity', value: 78 },
  { label: 'Adaptability', value: 86 },
  { label: 'Time Management', value: 82 },
  { label: 'Teamwork', value: 94 },
  { label: 'Strategic Thinking', value: 80 },
  { label: 'Customer Focus', value: 87 },
];

const largeDataset8 = [
  { label: 'Product A', value: 156 },
  { label: 'Product B', value: 142 },
  { label: 'Product C', value: 98 },
  { label: 'Product D', value: 124 },
  { label: 'Product E', value: 89 },
  { label: 'Product F', value: 167 },
  { label: 'Product G', value: 78 },
  { label: 'Product H', value: 134 },
];

const sampleData9 = [
  { x: 1, y: [20, 30, 25], label: 'Jan' },
  { x: 2, y: [25, 35, 30], label: 'Feb' },
  { x: 3, y: [30, 40, 35], label: 'Mar' },
  { x: 4, y: [35, 45, 40], label: 'Apr' },
  { x: 5, y: [40, 50, 45], label: 'May' },
  { x: 6, y: [45, 55, 50], label: 'Jun' },
];
const categories = ['Product A', 'Product B', 'Product C'];

const sampleData10 = [
  { label: 'Mobile', values: [85, 45, 30, 20] },
  { label: 'Desktop', values: [120, 80, 50, 35] },
  { label: 'Tablet', values: [65, 35, 25, 15] },
  { label: 'Smart TV', values: [40, 20, 15, 10] },
];
const categories2 = ['Chrome', 'Safari', 'Firefox', 'Edge'];
// Custom colors for different browsers
const customColors = [
  '#4285F4', // Chrome blue
  '#FF9500', // Safari orange
  '#FF6611', // Firefox orange
  '#0078D4', // Edge blue
];

const sampleData11 = [
  { label: 'Product A', values: [45, 30, 25] },
  { label: 'Product B', values: [60, 40, 35] },
  { label: 'Product C', values: [55, 35, 30] },
  { label: 'Product D', values: [70, 45, 40] },
  { label: 'Product E', values: [50, 32, 28] },
];
const categories3 = ['Direct Sales', 'Online', 'Retail'];

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

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-6 p-6">
        <Text variant="h2">{t('navigation.charts')}</Text>
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
