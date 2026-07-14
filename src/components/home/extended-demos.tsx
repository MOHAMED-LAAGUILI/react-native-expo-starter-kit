import { format } from 'date-fns';
import { Check, CircleAlert, Info } from 'lucide-react-native';
import * as React from 'react';
import { Pressable } from 'react-native';
import { Button, CalendarView, DateTimePickerField, Modal, QRCodeView, Text, TextArea, VideoPlayer, WebViewWrapper } from '@/components/ui';
import { Menu } from '@/components/ui/menu';
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
        <Text variant="caption" className="mt-1 text-center text-muted-foreground">
          Selected:
          {' '}
          {format(new Date(selected), 'PPP')}
        </Text>
      )}
    </>
  );
}

function BottomSheetDemo() {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Button title="Bottom Sheet" variant="outline" onPress={() => setVisible(true)} />
      <Modal isVisible={visible} onClose={() => setVisible(false)} title="Bottom Sheet Modal">
        <Text variant="body" className="mb-4 text-muted-foreground">
          Slide up from bottom with fading backdrop. Tap backdrop or X to close.
        </Text>
        <Button title="Confirm" variant="primary" onPress={() => setVisible(false)} />
      </Modal>
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
        <Button title="Got it" variant="primary" onPress={() => setVisible(false)} />
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

function WebViewDemo() {
  return (
    <WebViewWrapper uri="https://expo.dev" />
  );
}

function MenuDemo() {
  const [selected, setSelected] = React.useState('None');

  return (
    <>
      <Menu
        items={[
          { key: 'edit', title: 'Edit', image: 'pencil' },
          { key: 'share', title: 'Share', image: 'square.and.arrow.up' },
          { key: 'delete', title: 'Delete', destructive: true, image: 'trash' },
        ]}
        onPress={key => setSelected(key)}
      >
        <Pressable className="h-11 flex-row items-center justify-between rounded-md border border-border bg-secondary px-3">
          <Text className="text-foreground">Long press for menu</Text>
          <Text variant="caption" className="text-muted-foreground">{selected}</Text>
        </Pressable>
      </Menu>
    </>
  );
}

function VideoDemo() {
  return (
    <VideoPlayer
      uri="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      controls
    />
  );
}

function QRCodeDemo() {
  return (
    <QRCodeView value="https://expo.dev" size={150} />
  );
}

export {
  BottomSheetDemo,
  CalendarDemo,
  CenteredActionDemo,
  CenteredDemo,
  DateTimePickerDemo,
  MenuDemo,
  QRCodeDemo,
  TextAreaDemo,
  VideoDemo,
  WebViewDemo,
};
