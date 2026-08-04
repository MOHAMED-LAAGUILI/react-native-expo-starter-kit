import * as PopoverPrimitive from '@rn-primitives/popover';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';
import { isIOS, isWeb } from '@/utils/platform';
import { cn } from '@/utils/utils';
import { NativeOnlyAnimatedView } from './native-only-animated-view';
import { TextClassContext } from './text';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const FullWindowOverlay = isIOS ? RNFullWindowOverlay : React.Fragment;

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  portalHost,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  portalHost?: string;
}) {
  return (
    <PopoverPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <PopoverPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
          closeOnPress={!isWeb}
          asChild={!isWeb}
        >
          <NativeOnlyAnimatedView
            entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.reduceMotion(ReduceMotion.System)}
            as="Pressable"
          >
            <TextClassContext value="text-popover-foreground">
              <PopoverPrimitive.Content
                align={align}
                sideOffset={sideOffset}
                onInteractOutside={props.onInteractOutside ?? (() => {})}
                onPointerDownOutside={props.onPointerDownOutside ?? (() => {})}
                className={cn(
                  'z-50 w-72 rounded-2xl p-4 shadow-lg shadow-black/20 outline-hidden',
                  Platform.select({
                    web: 'border border-white/20 bg-popover/60 backdrop-blur-xl dark:border-white/10',
                    native: 'border border-border bg-popover',
                  }),
                  Platform.select({
                    web: cn(
                      'origin-(--radix-popover-content-transform-origin) animate-in fade-in-0 zoom-in-95',
                      props.side === 'bottom' && 'slide-in-from-top-2',
                      props.side === 'top' && 'slide-in-from-bottom-2',
                    ),
                  }),
                  className,
                )}
                {...props}
              />
            </TextClassContext>
          </NativeOnlyAnimatedView>
        </PopoverPrimitive.Overlay>
      </FullWindowOverlay>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
