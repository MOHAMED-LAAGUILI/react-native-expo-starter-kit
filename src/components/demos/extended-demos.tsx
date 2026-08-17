import { format } from 'date-fns';
import { Check, CircleAlert, Info } from 'lucide-react-native';
import * as React from 'react';
import { Button, CalendarView, DateTimePickerField, Modal, QRCodeView, Text, TextArea } from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';

function DateTimePickerDemo() {
  const [date, setDate] = React.useState(() => new Date());

  return (
    <>
      <DateTimePickerField
        label="Select Date"
        value={date}
        onChange={setDate}
        mode="date"
      />
      <DateTimePickerField
        label="Select Time"
        value={date}
        onChange={setDate}
        mode="time"
      />
    </>
  );
}

function TextAreaDemo() {
  const [value, setValue] = React.useState('');

  return (
    <TextArea
      label="Description"
      placeholder="Type your message here..."
      value={value}
      onChangeText={setValue}
      maxLength={200}
      showCount
    />
  );
}

function CalendarDemo() {
  const [selected, setSelected] = React.useState('');

  return (
    <>
      <CalendarView
        onDayPress={day => setSelected(day.dateString)}
        markedDates={selected ? { [selected]: { selected: true } } : {}}
      />
      {selected && (
        <Text variant="caption" className="text-muted-foreground mt-1 text-center">
          Selected:
          {' '}
          {format(new Date(selected), 'PPP')}
        </Text>
      )}
    </>
  );
}

function CenteredDemo() {
  const [visible, setVisible] = React.useState(false);
  const primaryHex = usePrimaryHex();

  return (
    <>
      <Button title="Centered" variant="outline" onPress={() => setVisible(true)} />
      <Modal
        isVisible={visible}
        onClose={() => setVisible(false)}
        variant="centered"
        title="Action Required"
        description="Please review the changes before proceeding. This action cannot be undone."
        icon={<Info size={36} color={primaryHex} />}
      >
        <Button title="Got it" variant="primary-gradient" onPress={() => setVisible(false)} />
      </Modal>
    </>
  );
}

function CenteredActionDemo() {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Button title="Centered Actions" variant="outline" onPress={() => setVisible(true)} />
      <Modal
        isVisible={visible}
        onClose={() => setVisible(false)}
        variant="centered-action"
        title="Delete Item"
        description="Are you sure you want to delete this item? This action is permanent."
        icon={<CircleAlert size={36} color="#ef4444" />}
        actions={[
          { label: 'Delete', variant: 'destructive', icon: <Check size={18} color="#fff" />, onPress: () => {} },
          { label: 'Cancel', variant: 'outline', onPress: () => {} },
        ]}
      />
    </>
  );
}

function QRCodeDemo() {
  return (
    <QRCodeView value="https://expo.dev" size={150} />
  );
}

export {
  CalendarDemo,
  CenteredActionDemo,
  CenteredDemo,
  DateTimePickerDemo,
  QRCodeDemo,
  TextAreaDemo,
};
