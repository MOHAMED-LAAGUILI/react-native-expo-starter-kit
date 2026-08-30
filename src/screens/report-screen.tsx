import type { ReportProject } from '@/data/report';
import { CalendarRange, Clock, Trophy } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { OverviewCards } from '@/components/demos/overview-cards';
import { ChartsShowcase } from '@/components/report/charts-showcase';
import { reportRangeLabels, reportTabs } from '@/components/report/constants';
import { HoursDistribution } from '@/components/report/hours-distribution';
import { ReportTabs } from '@/components/report/report-tabs';
import { UnifiedProjects } from '@/components/report/unified-projects';
import { projectData } from '@/data/report';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'yearly';

const TAB_MULTIPLIER: Record<ReportTab, number> = { daily: 1, monthly: 30, weekly: 7, yearly: 365 };

export function ReportScreen() {
  const [activeTab, setActiveTab] = React.useState<ReportTab>('daily');
  const primaryHex = usePrimaryHex();

  // Keep tab switches responsive: data rebuild + chart re-render happen in a transition.
  const handleTabChange = (tab: ReportTab) => {
    React.startTransition(() => setActiveTab(tab));
  };

  const multiplier = TAB_MULTIPLIER[activeTab];
  const tabProjectData: ReportProject[] = projectData.map(p => ({
    ...p,
    hours: Math.round(p.hours * multiplier),
  }));
  const totalHours = tabProjectData.reduce((sum, p) => sum + p.hours, 0);

  const overviewCards = [
    {
      key: 'range',
      label: 'Range',
      value: reportRangeLabels[activeTab],
      subtitle: `${tabProjectData.length} active projects`,
      accentColor: primaryHex,
      icon: CalendarRange,
    },
    {
      key: 'total',
      label: 'Total Logged',
      value: `${totalHours} h`,
      subtitle: `Across ${tabProjectData.length} projects`,
      accentColor: '#f59e0b',
      icon: Clock,
    },
    {
      key: 'top-project',
      label: 'Top Project',
      value: tabProjectData[0]?.project ?? 'N/A',
      subtitle: `${tabProjectData[0]?.hours ?? 0} h logged`,
      accentColor: tabProjectData[0]?.color ?? primaryHex,
      icon: Trophy,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ReportTabs
        activeTab={activeTab}
        tabs={reportTabs}
        onTabChange={handleTabChange}
      />
      <ScrollView contentContainerClassName="gap-5 px-6 pb-8" showsVerticalScrollIndicator={false}>
        <OverviewCards cards={overviewCards} />

        <HoursDistribution
          data={tabProjectData}
          totalHours={totalHours}
        />

        <UnifiedProjects data={tabProjectData} totalHours={totalHours} />

        <ChartsShowcase data={tabProjectData} totalHours={totalHours} />
      </ScrollView>
    </View>
  );
}
