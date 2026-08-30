import * as TooltipPrimitive from '@rn-primitives/tooltip';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { FadeInDown, FadeInUp, FadeOut, ReduceMotion } from 'react-native-reanimated';
import { cn } from '@/utils/cn';
import { isWeb } from '@/utils/platform';
import { FullWindowOverlay } from './full-window-overlay';
import { NativeOnlyAnimatedView } from './native-only-animated-view';
import { TextClassContext } from './text';

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 4,
  portalHost,
  side = 'top',
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  portalHost?: string;
}) {
  return (
    <TooltipPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <TooltipPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
          asChild={!isWeb}
        >
          <NativeOnlyAnimatedView
            entering={
              side === 'top'
                ? FadeInDown.withInitialValues({ transform: [{ translateY: 3 }] })
                    .duration(150)
                    .reduceMotion(ReduceMotion.System)
                : FadeInUp.withInitialValues({ transform: [{ translateY: -5 }] }).reduceMotion(
                    ReduceMotion.System,
                  )
            }
            exiting={FadeOut.reduceMotion(ReduceMotion.System)}
            as="Pressable"
          >
            <TextClassContext value="text-[11px] text-white">
              <TooltipPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                  'z-50 rounded-md bg-primary px-2 py-1 sm:py-1',
                  Platform.select({
                    web: cn(
                      'w-fit origin-(--radix-tooltip-content-transform-origin) animate-in text-balance fade-in-0 zoom-in-95',
                      side === 'bottom' && 'slide-in-from-top-2',
                      side === 'left' && 'slide-in-from-right-2',
                      side === 'right' && 'slide-in-from-left-2',
                      side === 'top' && 'slide-in-from-bottom-2',
                    ),
                  }),
                  className,
                )}
                side={side}
                {...props}
              >
                {children}
              </TooltipPrimitive.Content>
            </TextClassContext>
          </NativeOnlyAnimatedView>
        </TooltipPrimitive.Overlay>
      </FullWindowOverlay>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipTrigger };
