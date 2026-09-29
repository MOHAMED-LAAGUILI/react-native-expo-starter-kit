import type { ViewProps } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TextClassContext } from '@/components/ui';
import { cn } from '@/utils/cn';

type MessageAlign = 'start' | 'end';

/** Default text styling for the avatar initials slot. */
const AVATAR_TEXT_CLASS = 'text-xs font-semibold text-muted-foreground';

/** Default text styling for the header/footer metadata slots. */
const META_TEXT_CLASS = 'text-xs font-medium text-muted-foreground';

type MessageProps = ViewProps & {
  align?: MessageAlign;
};

/** Lets nested content (bubbles, footers) inherit the message alignment. */
const MessageAlignContext = React.createContext<MessageAlign>('start');

function MessageGroup({ className, ...props }: ViewProps) {
  return <View className={cn('w-full min-w-0 flex-col gap-2', className)} {...props} />;
}

function Message({ align = 'start', className, children, ...props }: MessageProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className={cn('w-full flex-row gap-2', align === 'end' && 'flex-row-reverse', className)}
      {...props}
    >
      <MessageAlignContext value={align}>{children}</MessageAlignContext>
    </Animated.View>
  );
}

function MessageAvatar({ className, children, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'bg-muted size-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <TextClassContext value={AVATAR_TEXT_CLASS}>{children}</TextClassContext>
    </View>
  );
}

function MessageContent({ className, ...props }: ViewProps) {
  const align = React.use(MessageAlignContext);
  return (
    <View
      className={cn(
        'min-w-0 flex-1 flex-col gap-1',
        align === 'end' ? 'items-end' : 'items-start',
        className,
      )}
      {...props}
    />
  );
}

function MessageHeader({ className, children, ...props }: ViewProps) {
  return (
    <View className={cn('max-w-full flex-row items-center px-3', className)} {...props}>
      <TextClassContext value={META_TEXT_CLASS}>{children}</TextClassContext>
    </View>
  );
}

function MessageFooter({ className, children, ...props }: ViewProps) {
  const align = React.use(MessageAlignContext);
  return (
    <View
      className={cn(
        'max-w-full flex-row items-center px-3',
        align === 'end' && 'justify-end',
        className,
      )}
      {...props}
    >
      <TextClassContext value={META_TEXT_CLASS}>{children}</TextClassContext>
    </View>
  );
}

export type { MessageAlign, MessageProps };
export {
  Message,
  MessageAlignContext,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
};
