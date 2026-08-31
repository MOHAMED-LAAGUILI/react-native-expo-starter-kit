import type { ReportProject, ReportRange } from '@/data/report';
import { CalendarRange, Clock, Trophy } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { OverviewCards } from '@/components/demos/overview-cards';
import { ChartsShowcase } from '@/components/report/charts-showcase';
import { reportRangeMultiplier, reportRanges } from '@/components/report/constants';
import { HoursDistribution } from '@/components/report/hours-distribution';
import { ReportTabs } from '@/components/report/report-tabs';
import { UnifiedProjects } from '@/components/report/unified-projects';
import { projectData } from '@/data/report';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

const TOP_PROJECT_COLOR = '#f59e0b';

export function ReportScreen() {
  const { t } = useTranslation('report');
  const [activeTab, setActiveTab] = React.useState<ReportRange>('daily');
  const primaryHex = usePrimaryHex();

  // Keep tab switches responsive: data rebuild + chart re-render happen in a transition.
  const handleTabChange = (tab: ReportRange) => {
    React.startTransition(() => setActiveTab(tab));
  };

  const multiplier = reportRangeMultiplier[activeTab];
  const tabProjectData: ReportProject[] = projectData.map(p => ({
    ...p,
    hours: Math.round(p.hours * multiplier),
  }));
  const totalHours = tabProjectData.reduce((sum, p) => sum + p.hours, 0);
  const projectCount = tabProjectData.length;

  const tabs = reportRanges.map(key => ({ key, label: t(`range.${key}`) }));

  const overviewCards = [
    {
      key: 'range',
      label: t('overview.range'),
      value: t(`rangeLabel.${activeTab}`),
      subtitle: t('overview.activeProjects', { count: projectCount }),
      accentColor: primaryHex,
      icon: CalendarRange,
    },
    {
      key: 'total',
      label: t('overview.totalLogged'),
      value: `${totalHours} h`,
      subtitle: t('overview.acrossProjects', { count: projectCount }),
      accentColor: TOP_PROJECT_COLOR,
      icon: Clock,
    },
    {
      key: 'top-project',
      label: t('overview.topProject'),
      value: tabProjectData[0]?.project ?? t('overview.notAvailable'),
      subtitle: t('overview.hoursLogged', { hours: tabProjectData[0]?.hours ?? 0 }),
      accentColor: tabProjectData[0]?.color ?? primaryHex,
      icon: Trophy,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ReportTabs
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={handleTabChange}
      />
      <ScrollView contentContainerClassName="gap-5 px-6 pb-8" showsVerticalScrollIndicator={false}>
        <OverviewCards cards={overviewCards} />

        <HoursDistribution
          data={tabProjectData}
          totalHours={totalHours}
        />

        <UnifiedProjects data={tabProjectData} totalHours={totalHours} />

        <ChartsShowcase
          data={tabProjectData}
          range={activeTab}
          totalHours={totalHours}
        />
      </ScrollView>
    </View>
  );
}
