import type { SvgColors } from './svg-data';
import { SvgXml } from 'react-native-svg';
import { joinUsSvg } from './svg-data';

type Props = {
  primaryColor: string;
  fgColor: string;
};

export function JoinUsSvg({ primaryColor, fgColor }: Props) {
  const colors: SvgColors = { primary: primaryColor, fg: fgColor };
  return <SvgXml xml={joinUsSvg(colors)} width="100%" height="100%" />;
}
