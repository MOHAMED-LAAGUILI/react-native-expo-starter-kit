import type { ReportProject } from '@/data/report';
import * as React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OverviewCards } from '@/components/home/overview-cards';
import { reportRangeLabels, reportTabs } from '@/components/report/constants';
import { HoursDistribution } from '@/components/report/hours-distribution';
import { ProjectAllocation } from '@/components/report/project-allocation';
import { ReportTabs } from '@/components/report/report-tabs';
import { TopProjectsChart } from '@/components/report/top-projects-chart';
import { TrendSnapshot } from '@/components/report/trend-snapshot';
import { projectData } from '@/data/report';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function ReportScreen() {
  const [activeTab, setActiveTab] = React.useState<ReportTab>('daily');
  const primaryHex = usePrimaryHex();

  const divisor = { daily: 1, weekly: 7, monthly: 15, yearly: 20 }[activeTab];
  const tabProjectData: ReportProject[] = projectData.map(p => ({
    ...p,
    hours: Math.round(p.hours / divisor),
  }));

  const totalHours = tabProjectData.reduce((s, p) => s + p.hours, 0);
  const overviewCards = [
    {
      key: 'range',
      label: 'Range',
      value: reportRangeLabels[activeTab],
      subtitle: `${tabProjectData.length} active projects`,
      accentColor: primaryHex,
    },
    {
      key: 'total',
      label: 'Total Logged',
      value: `${totalHours} h`,
      subtitle: `Across ${tabProjectData.length} projects`,
      accentColor: '#f59e0b',
    },
    {
      key: 'top-project',
      label: 'Top Project',
      value: tabProjectData[0]?.project ?? 'N/A',
      subtitle: `${tabProjectData[0]?.hours ?? 0} h logged`,
      accentColor: tabProjectData[0]?.color ?? primaryHex,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6" showsVerticalScrollIndicator={false}>
        <ReportTabs
          activeTab={activeTab}
          tabs={reportTabs}
          onTabChange={setActiveTab}
        />

        <OverviewCards cards={overviewCards} />
        <TrendSnapshot
          data={tabProjectData}
          rangeLabel={reportRangeLabels[activeTab]}
        />
        <HoursDistribution
          data={tabProjectData}
          totalHours={totalHours}
        />
        <TopProjectsChart
          key={activeTab}
          data={tabProjectData}
        />
        <ProjectAllocation data={tabProjectData} totalHours={totalHours} />
      </ScrollView>
    </SafeAreaView>
  );
}
