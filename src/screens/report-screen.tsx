import type { ReportProject } from '@/data/report';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { OverviewCards } from '@/components/home/overview-cards';
import { AnimatedSection } from '@/components/report/animated-section';
import { reportRangeLabels, reportTabs } from '@/components/report/constants';
import { HoursDistribution } from '@/components/report/hours-distribution';
import { LineTrend } from '@/components/report/line-trend';
import { ReportTabs } from '@/components/report/report-tabs';
import { TrendSnapshot } from '@/components/report/trend-snapshot';
import { UnifiedProjects } from '@/components/report/unified-projects';
import { projectData } from '@/data/report';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function ReportScreen() {
  const [activeTab, setActiveTab] = React.useState<ReportTab>('daily');
  const primaryHex = usePrimaryHex();

  const multiplier = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[activeTab];
  const tabProjectData: ReportProject[] = projectData.map(p => ({
    ...p,
    hours: Math.round(p.hours * multiplier),
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
    <View className="flex-1 bg-background">
      <ReportTabs
        activeTab={activeTab}
        tabs={reportTabs}
        onTabChange={setActiveTab}
      />
      <ScrollView contentContainerClassName="gap-5 px-6 pb-8" showsVerticalScrollIndicator={false}>
        <OverviewCards cards={overviewCards} />

        <AnimatedSection key={`trend-${activeTab}`} animateOn={activeTab}>
          <TrendSnapshot
            data={tabProjectData}
            rangeLabel={reportRangeLabels[activeTab]}
          />
        </AnimatedSection>

        <AnimatedSection key={`hours-${activeTab}`} animateOn={activeTab}>
          <HoursDistribution
            data={tabProjectData}
            totalHours={totalHours}
          />
        </AnimatedSection>

        <AnimatedSection key={`unified-${activeTab}`} animateOn={activeTab}>
          <UnifiedProjects data={tabProjectData} totalHours={totalHours} />
        </AnimatedSection>

        <AnimatedSection key={`line-${activeTab}`} animateOn={activeTab}>
          <LineTrend data={tabProjectData} />
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}
