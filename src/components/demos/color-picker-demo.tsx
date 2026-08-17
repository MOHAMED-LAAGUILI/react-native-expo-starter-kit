import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheet, Button, ColorPicker, HueSlider, Panel1, Preview, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/use-theme-color';

function ColorSwatch({ color, size = 40 }: { color: string; size?: number }) {
  const { border } = useThemeColors();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: 2,
        borderColor: border,
      }}
    />
  );
}

function ColorPickerSheet({ open, onOpenChange, title, value, onConfirm }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  onConfirm: (color: string) => void;
}) {
  const [selected, setSelected] = useState(value);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      snapPoints={['65%']}
    >
      <View style={{ gap: 16, paddingBottom: 8 }}>
        <View style={{ alignItems: 'center' }}>
          <ColorPicker
            value={value}
            onChangeJS={({ hex }) => setSelected(hex)}
            style={{ width: '100%' }}
          >
            <Preview />
            <Panel1 />
            <HueSlider />
          </ColorPicker>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16 }}>
          <Button
            variant="outline"
            title="Cancel"
            onPress={() => onOpenChange(false)}
            style={{ flex: 1 }}
          />
          <Button
            title="Confirm"
            onPress={() => {
              onConfirm(selected);
              onOpenChange(false);
            }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

function ColorRow({ title, value, onChange }: { title: string; value: string; onChange: (color: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <ColorSwatch color={value} />
        <View style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {title}
          </Text>
          <Text variant="caption" style={{ opacity: 0.7 }}>
            {value.toUpperCase()}
          </Text>
        </View>
      </Pressable>

      <ColorPickerSheet
        open={open}
        onOpenChange={setOpen}
        title={title}
        value={value}
        onConfirm={onChange}
      />
    </>
  );
}

function PreviewBox({ backgroundColor, borderColor, textColor }: { backgroundColor: string; borderColor: string; textColor: string }) {
  return (
    <View
      style={{
        padding: 16,
        backgroundColor,
        borderWidth: 2,
        borderColor,
        borderRadius: 8,
        marginTop: 8,
      }}
    >
      <Text style={{ color: textColor, textAlign: 'center' }}>
        Preview with selected colors
      </Text>
    </View>
  );
}

function ColorPickerDemo() {
  const { background, border, text } = useThemeColors();
  const [backgroundColor, setBackgroundColor] = useState(background);
  const [borderColor, setBorderColor] = useState(border);
  const [textColor, setTextColor] = useState(text);

  return (
    <View className="mb-4 gap-3">
      <ColorRow title="Background Color" value={backgroundColor} onChange={setBackgroundColor} />
      <ColorRow title="Text Color" value={textColor} onChange={setTextColor} />
      <ColorRow title="Border Color" value={borderColor} onChange={setBorderColor} />
      <PreviewBox
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        textColor={textColor}
      />
    </View>
  );
}

export { ColorPickerDemo };
