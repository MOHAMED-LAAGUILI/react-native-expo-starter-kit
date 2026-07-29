import { ExternalLink, Heart, Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Linking, Share, View } from 'react-native';
import { SectionHeader } from '@/components/common/section-header';
import { SettingGroup } from '@/components/common/setting-group';
import { SettingRow } from '@/components/common/setting-row';

function SupportSection() {
  const { t } = useTranslation('settings');

  return (
    <View>
      <SectionHeader label={t('support')} />
      <SettingGroup>
        <SettingRow
          icon={Share2}
          label={t('shareApp')}
          subtitle={t('shareAppDescription')}
          onPress={() => Share.share({ message: t('shareMessage'), url: 'https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit' })}
        />
        <SettingRow
          icon={Heart}
          label={t('supportFeedback')}
          subtitle={t('supportFeedbackDescription')}
          onPress={() => Linking.openURL('https://github.com/MOHAMED-LAAGUILI/react-native-starter-kit')}
        />
        <SettingRow
          icon={ExternalLink}
          label={t('developer')}
          subtitle={t('developerDescription')}
          onPress={() => Linking.openURL('https://mohamedlaaguili-v2.vercel.app')}
        />
      </SettingGroup>
    </View>
  );
}

export { SupportSection };
