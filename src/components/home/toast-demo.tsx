import { Button } from '@/components/ui/button';
import { showToast } from '@/components/ui/toast';
import { Row } from './typography-and-badge';

function ToastDemo() {
  return (
    <Row>
      <Button title="Success" size="sm" onPress={() => showToast({ message: 'Operation completed.', title: 'Success!', variant: 'success' })} />
      <Button title="Error" size="sm" variant="destructive" onPress={() => showToast({ message: 'Something went wrong.', title: 'Error', variant: 'error' })} />
      <Button title="Info" size="sm" variant="outline" onPress={() => showToast({ message: 'Here is some information.', title: 'Info', variant: 'info' })} />
    </Row>
  );
}

export { ToastDemo };
