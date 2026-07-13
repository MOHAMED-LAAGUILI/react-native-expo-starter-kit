import * as React from 'react';
import { Toggle } from '@/components/ui';
import { Row } from './typography-and-badge';

function ToggleDemo() {
  const [pressed, setPressed] = React.useState(false);
  return (
    <Row>
      <Toggle pressed={pressed} onPressedChange={setPressed}>Bold</Toggle>
      <Toggle pressed={true} onPressedChange={() => {}} disabled>Disabled</Toggle>
    </Row>
  );
}

export { ToggleDemo };
