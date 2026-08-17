import type { LucideIcon, LucideProps } from 'lucide-react-native';
import type { IconInput, MorphIconProps as MorphiconsMorphIconProps, MorphOptions, SpringPreset } from 'morphicons/react-native';
import { MorphIcon as MorphiconsIcon } from 'morphicons/react-native';
import * as React from 'react';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { withUniwind } from 'uniwind';
import { cn } from '@/utils/utils';
import { TextClassContext } from './text';

export type IconProps = LucideProps & {
  as: LucideIcon;
} & React.RefAttributes<LucideIcon>;

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

const StyledIcon = withUniwind(IconImpl, {
  size: {
    fromClassName: 'className',
    styleProperty: 'width',
  },
  color: {
    fromClassName: 'className',
    styleProperty: 'color',
  },
});

/**
 * A wrapper component for Lucide icons with Uniwind `className` support via `withUniwind`.
 *
 * This component allows you to render any Lucide icon while applying utility classes
 * using `uniwind`. It avoids the need to wrap or configure each icon individually.
 *
 * @component
 * @example
 * ```tsx
 * import { ArrowRight } from 'lucide-react-native';
 * import { Icon } from './icon';
 *
 * <Icon as={ArrowRight} className="text-red-500 size-4" />
 * ```
 */
function Icon({ as: IconComponent, className, ...props }: IconProps) {
  const textClass = React.use(TextClassContext);
  return (
    <StyledIcon
      as={IconComponent}
      className={cn('size-5 text-foreground', textClass, className)}
      {...props}
    />
  );
}

export type MorphIconProps = MorphiconsMorphIconProps & { className?: string };

function MorphIconImpl({ className, ...props }: MorphIconProps) {
  return <MorphiconsIcon {...props} />;
}

const StyledMorphIcon = withUniwind(MorphIconImpl, {
  size: {
    fromClassName: 'className',
    styleProperty: 'width',
  },
  color: {
    fromClassName: 'className',
    styleProperty: 'color',
  },
});

/**
 * A wrapper component for morphable icons (morphicons) with Uniwind `className`
 * support via `withUniwind`.
 *
 * Accepts Lucide icon *data* (from the `lucide` package, not `lucide-react-native`)
 * and animates between icons with a spring morph whenever the `icon` prop changes.
 *
 * @component
 * @example
 * ```tsx
 * import { Menu, X } from 'lucide';
 * import { MorphIcon } from './icon';
 *
 * <MorphIcon icon={open ? X : Menu} className="text-primary size-6" spring="bouncy" />
 * ```
 */
function MorphIcon({ className, ...props }: MorphIconProps) {
  const textClass = React.use(TextClassContext);
  return (
    <StyledMorphIcon
      className={cn('size-5 text-foreground', textClass, className)}
      {...props}
    />
  );
}

export type MorphToggleProps = {
  icon: IconInput;
  morphIcon: IconInput;
  spring?: SpringPreset | MorphOptions;
  label?: string;
  className?: string;
  iconClassName?: string;
};

function MorphToggle({
  icon,
  morphIcon,
  spring,
  label,
  className,
  iconClassName,
}: MorphToggleProps) {
  const [toggled, setToggled] = useState(false);
  return (
    <Pressable
      onPress={() => setToggled(t => !t)}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={className}
    >
      <MorphIcon
        icon={toggled ? morphIcon : icon}
        className={cn('size-5', iconClassName)}
        spring={spring}
      />
    </Pressable>
  );
}

export { Icon, MorphIcon, MorphToggle };
