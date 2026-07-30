import type { SvgColors } from './svg-data';
import { SvgXml } from 'react-native-svg';
import { codeThinkingSvg } from './svg-data';

type Props = {
  primaryColor: string;
  fgColor: string;
};

export function CodeThinkingSvg({ primaryColor, fgColor }: Props) {
  const colors: SvgColors = { primary: primaryColor, fg: fgColor };
  return <SvgXml xml={codeThinkingSvg(colors)} width="100%" height="100%" />;
}
