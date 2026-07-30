import { CodeThinkingSvg, JoinUsSvg, MeetTheTeamSvg } from './illustrations';

const COMPONENT_MAP = {
  'code-thinking': CodeThinkingSvg,
  'join-us': JoinUsSvg,
  'meet-the-team': MeetTheTeamSvg,
} as const;

type OnboardingIllustrationName = keyof typeof COMPONENT_MAP;

type Props = {
  name: OnboardingIllustrationName;
  primaryColor: string;
  fgColor: string;
};

export function OnboardingIllustrations({ name, primaryColor, fgColor }: Props) {
  const Component = COMPONENT_MAP[name];
  return <Component primaryColor={primaryColor} fgColor={fgColor} />;
}
