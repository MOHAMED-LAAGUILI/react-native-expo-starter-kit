import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '@/components/ui/button';

async function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  const onPress = jest.fn();
  await render(<Button testID="button" title="Save" onPress={onPress} {...props} />);
  return { onPress, button: screen.getByTestId('button') };
}

describe('Button', () => {
  it('renders its title as an accessible button', async () => {
    const { button } = await renderButton();
    expect(screen.getByText('Save')).toBeTruthy();
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('calls onPress when tapped', async () => {
    const { button, onPress } = await renderButton();
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses while disabled', async () => {
    const { button, onPress } = await renderButton({ disabled: true });
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is busy and disabled while loading, so a second tap is not sent', async () => {
    const { button, onPress } = await renderButton({ loading: true });
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ busy: true, disabled: true }));
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
