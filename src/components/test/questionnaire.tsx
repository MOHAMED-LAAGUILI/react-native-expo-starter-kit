import type { ViewProps } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { InputProps } from '@/components/ui';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Button, Icon, Input, Text, TextClassContext } from '@/components/ui';
import { SPRING_GENTLE, SPRING_PRESS } from '@/config/motion';
import { useGooeyPress } from '@/hooks/use-gooey-press';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';

type QuestionnaireItemType = 'radio' | 'checkbox' | 'input';
type QuestionnaireAnswer = string | string[];
type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;

type QuestionnaireContextValue = {
  answers: QuestionnaireAnswers;
  direction: 1 | -1;
  error: string | null;
  goNext: () => void;
  goPrevious: () => void;
  index: number;
  isLast: boolean;
  setAnswer: (name: string, value: QuestionnaireAnswer) => void;
  skip: () => void;
  submit: () => void;
  total: number;
};

type ItemMeta = {
  name: string;
  required?: boolean;
  type: QuestionnaireItemType;
};

type QuestionnaireProps = ViewProps & {
  onSubmit?: (answers: QuestionnaireAnswers) => void;
};

type QuestionnaireItemProps = ViewProps & ItemMeta;

type QuestionnaireChoiceProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  value: string;
};

type TextSlotProps = {
  children: React.ReactNode;
  className?: string;
};

type ActionProps = {
  title?: string;
};

const QuestionnaireContext = React.createContext<QuestionnaireContextValue | null>(null);
const QuestionnaireItemContext = React.createContext<ItemMeta | null>(null);

function useQuestionnaire() {
  const context = React.use(QuestionnaireContext);
  if (!context)
    throw new Error('Questionnaire components must be rendered inside <Questionnaire>');
  return context;
}

function useQuestionnaireItem() {
  const context = React.use(QuestionnaireItemContext);
  if (!context)
    throw new Error('Choice components must be rendered inside <QuestionnaireItem>');
  return context;
}

function hasAnswer(answer: QuestionnaireAnswer | undefined) {
  if (Array.isArray(answer))
    return answer.length > 0;
  return typeof answer === 'string' && answer.trim().length > 0;
}

function isChoiceSelected(answer: QuestionnaireAnswer | undefined, value: string, type: QuestionnaireItemType) {
  if (type === 'checkbox')
    return Array.isArray(answer) && answer.includes(value);
  return answer === value;
}

function nextChoiceValue(answer: QuestionnaireAnswer | undefined, value: string, type: QuestionnaireItemType): QuestionnaireAnswer {
  if (type !== 'checkbox')
    return value;
  const current = Array.isArray(answer) ? answer : [];
  return current.includes(value) ? current.filter(entry => entry !== value) : [...current, value];
}

function isQuestionnaireItem(child: unknown): child is React.ReactElement<QuestionnaireItemProps> {
  return React.isValidElement(child) && child.type === QuestionnaireItem;
}

function Questionnaire({ children, className, onSubmit, ...props }: QuestionnaireProps) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [answers, setAnswers] = React.useState<QuestionnaireAnswers>({});
  const [error, setError] = React.useState<string | null>(null);

  // Steps are declared as <QuestionnaireItem> children so the API stays
  // composable; inspecting them is the only way to know the step count.
  // eslint-disable-next-line react/no-children-to-array
  const kids = React.Children.toArray(children);
  const items = kids.filter(isQuestionnaireItem);
  const total = items.length;
  const activeItem = items[index];

  const goTo = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setError(null);
    setIndex(Math.min(Math.max(next, 0), Math.max(total - 1, 0)));
  };

  const validate = () => {
    if (!activeItem?.props.required || hasAnswer(answers[activeItem.props.name]))
      return true;
    setError('An answer is required for this question.');
    return false;
  };

  const value: QuestionnaireContextValue = {
    answers,
    direction,
    error,
    goNext: () => {
      if (validate())
        goTo(index + 1, 1);
    },
    goPrevious: () => goTo(index - 1, -1),
    index,
    isLast: index >= total - 1,
    setAnswer: (name, answer) => {
      setError(null);
      setAnswers(previous => ({ ...previous, [name]: answer }));
    },
    skip: () => goTo(index + 1, 1),
    submit: () => {
      if (validate())
        onSubmit?.(answers);
    },
    total,
  };

  return (
    <QuestionnaireContext value={value}>
      <View className={cn('w-full min-w-0 flex-col gap-4', className)} {...props}>
        {kids.map((child) => {
          if (!isQuestionnaireItem(child))
            return child;
          if (items.indexOf(child) !== index)
            return null;
          return (
            <Animated.View
              key={child.props.name}
              entering={direction === 1 ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
            >
              {child}
            </Animated.View>
          );
        })}
      </View>
    </QuestionnaireContext>
  );
}

function QuestionnaireProgress({ className }: { className?: string }) {
  const { index, total } = useQuestionnaire();
  const fraction = useSharedValue(total > 0 ? (index + 1) / total : 0);

  React.useEffect(() => {
    fraction.set(withSpring(total > 0 ? (index + 1) / total : 0, SPRING_GENTLE));
  }, [index, total, fraction]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${fraction.value * 100}%`,
  }));

  return (
    <View className={cn('w-full gap-2', className)}>
      <Text variant="caption" className="text-muted-foreground font-medium tabular-nums">
        {`Question ${Math.min(index + 1, total)} of ${total}`}
      </Text>
      <View className="bg-muted h-1 w-full overflow-hidden rounded-full">
        <Animated.View className="bg-primary h-full rounded-full" style={barStyle} />
      </View>
    </View>
  );
}

function QuestionnaireItem({ name, required, type, className, children, ...props }: QuestionnaireItemProps) {
  // React Compiler caches this, so the context value only changes with the meta.
  const meta = { name, required, type };
  return (
    <QuestionnaireItemContext value={meta}>
      <View className={cn('w-full min-w-0 flex-col gap-4', className)} {...props}>
        {children}
      </View>
    </QuestionnaireItemContext>
  );
}

function QuestionnaireTitle({ children, className }: TextSlotProps) {
  return (
    <Text className={cn('text-base/snug font-medium', className)}>
      {children}
    </Text>
  );
}

function QuestionnaireDescription({ children, className }: TextSlotProps) {
  return (
    <Text variant="bodySmall" className={cn('text-muted-foreground', className)}>
      {children}
    </Text>
  );
}

function QuestionnaireChoices({ className, ...props }: ViewProps) {
  return <View className={cn('w-full min-w-0 gap-2', className)} {...props} />;
}

function ChoiceIndicator({ progress, type }: { progress: SharedValue<number>; type: QuestionnaireItemType }) {
  const primaryHex = usePrimaryHex();
  const colors = useThemeColors();

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.background, primaryHex]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, primaryHex]),
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 0.5, 1], [0.2, 1.2, 1]) }],
  }));

  return (
    <Animated.View
      style={boxStyle}
      className={cn(
        'mt-0.5 size-4 shrink-0 items-center justify-center border',
        type === 'radio' ? 'rounded-full' : 'rounded-[4px]',
      )}
    >
      <Animated.View style={markStyle}>
        {type === 'radio'
          ? <View className="bg-primary-foreground size-2 rounded-full" />
          : <Icon as={Check} className="text-primary-foreground size-3" />}
      </Animated.View>
    </Animated.View>
  );
}

function QuestionnaireChoice({ children, className, disabled, value }: QuestionnaireChoiceProps) {
  const { answers, setAnswer } = useQuestionnaire();
  const meta = useQuestionnaireItem();
  const selected = isChoiceSelected(answers[meta.name], value, meta.type);
  const progress = useSharedValue(selected ? 1 : 0);
  const gooey = useGooeyPress(!disabled);

  React.useEffect(() => {
    progress.set(withSpring(selected ? 1 : 0, SPRING_PRESS));
  }, [selected, progress]);

  return (
    <Pressable
      accessibilityRole={meta.type === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => setAnswer(meta.name, nextChoiceValue(answers[meta.name], value, meta.type))}
      onPressIn={gooey.pressIn}
      onPressOut={gooey.pressOut}
    >
      <Animated.View
        style={gooey.surfaceStyle}
        className={cn(
          'min-h-11 w-full flex-row items-start gap-2.5 rounded-lg border px-3 py-2.5',
          selected ? 'border-primary/40 bg-muted' : 'border-input bg-transparent',
          disabled && 'opacity-50',
          className,
        )}
      >
        <ChoiceIndicator progress={progress} type={meta.type} />
        <View className="min-w-0 flex-1 gap-0.5">
          <TextClassContext value="text-sm/snug">{children}</TextClassContext>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function QuestionnaireChoiceLabel({ children, className }: TextSlotProps) {
  return (
    <Text variant="bodySmall" className={cn('leading-snug', className)}>
      {children}
    </Text>
  );
}

function QuestionnaireChoiceDescription({ children, className }: TextSlotProps) {
  return (
    <Text variant="caption" className={cn('text-muted-foreground', className)}>
      {children}
    </Text>
  );
}

function QuestionnaireInput(props: Omit<InputProps, 'onChangeText' | 'value'>) {
  const { answers, setAnswer } = useQuestionnaire();
  const meta = useQuestionnaireItem();
  const answer = answers[meta.name];
  return (
    <Input
      onChangeText={text => setAnswer(meta.name, text)}
      value={typeof answer === 'string' ? answer : ''}
      {...props}
    />
  );
}

function QuestionnaireError({ className }: { className?: string }) {
  const { error } = useQuestionnaire();
  if (!error)
    return null;
  return (
    <Animated.View entering={FadeInDown.duration(200)}>
      <Text variant="bodySmall" className={cn('text-destructive', className)}>
        {error}
      </Text>
    </Animated.View>
  );
}

function QuestionnaireActions({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('mt-2 min-h-11 w-full flex-row items-center justify-end gap-2', className)}
      {...props}
    />
  );
}

function QuestionnairePrevious({ title = 'Previous' }: ActionProps) {
  const { goPrevious, index } = useQuestionnaire();
  if (index === 0)
    return null;
  return <Button className="mr-auto" onPress={goPrevious} size="sm" title={title} variant="outline" />;
}

function QuestionnaireSkip({ title = 'Skip' }: ActionProps) {
  const { isLast, skip } = useQuestionnaire();
  if (isLast)
    return null;
  return <Button onPress={skip} size="sm" title={title} variant="ghost" />;
}

function QuestionnaireNext({ title = 'Next' }: ActionProps) {
  const { goNext, isLast } = useQuestionnaire();
  if (isLast)
    return null;
  return <Button onPress={goNext} size="sm" title={title} variant="primary" />;
}

function QuestionnaireSubmit({ title = 'Submit' }: ActionProps) {
  const { isLast, submit } = useQuestionnaire();
  if (!isLast)
    return null;
  return <Button onPress={submit} size="sm" title={title} variant="primary" />;
}

export type { QuestionnaireAnswer, QuestionnaireAnswers, QuestionnaireItemType, QuestionnaireProps };
export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoiceLabel,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
};
