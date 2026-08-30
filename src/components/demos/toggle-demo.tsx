import * as React from 'react';
import { Text, Toggle } from '@/components/ui';
import { Row } from './typography-and-badge';

function ToggleDemo() {
  const [bold, setBold] = React.useState(false);
  const [italic, setItalic] = React.useState(false);
  const [underline, setUnderline] = React.useState(false);
  const [strike, setStrike] = React.useState(false);
  return (
    <>
      <Row>
        <Toggle pressed={bold} onPressedChange={setBold}>Bold</Toggle>
        <Toggle pressed={italic} onPressedChange={setItalic} variant="outline">Italic</Toggle>
        <Toggle pressed={underline} onPressedChange={setUnderline} variant="soft">Underline</Toggle>
        <Toggle pressed={strike} onPressedChange={setStrike} variant="ghost">Strike</Toggle>
      </Row>
      <Row>
        <Text variant="caption" className="text-muted-foreground">
          Variants: default, outline, soft, ghost
        </Text>
      </Row>
      <Row>
        <Toggle pressed={true} onPressedChange={() => {}} disabled>Disabled</Toggle>
        <Toggle pressed={false} onPressedChange={() => {}} disabled variant="outline">
          Disabled Outline
        </Toggle>
      </Row>
    </>
  );
}

export { ToggleDemo };
