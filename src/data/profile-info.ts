import { Globe, Mail } from 'lucide-react-native';

type ProfileInfoItem = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  href?: string;
};

const PROFILE_INFO_ITEMS: ProfileInfoItem[] = [
  { icon: Mail, label: 'Email', value: 'james011@gmail.com' },
  { icon: Globe, label: 'LinkedIn', value: 'www.linkedin.com/in/james012', href: 'https://linkedin.com/in/james012' },
  { icon: Globe, label: 'Facebook', value: 'www.facebook.com/james012', href: 'https://www.facebook.com/james012' },
];

export type { ProfileInfoItem };
export { PROFILE_INFO_ITEMS };
