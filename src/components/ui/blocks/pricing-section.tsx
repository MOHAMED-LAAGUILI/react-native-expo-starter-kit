import { Check, Info } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Badge,
  Button,
  Card,
  RadioGroup,
  RadioGroupItem,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { usePrimaryHex } from '@/hooks/use-primary-hex';
import { useThemeColors } from '@/hooks/use-theme-color';
import { cn } from '@/utils/cn';
import { AnimatedNumber } from '../number-flow';

export type PlanId = string;

export type Feature = {
  text: string;
  hasInfo?: boolean;
};

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  badge?: string;
  featuresLabel?: string;
  features: Feature[];
};

export type ChangeablePricingSectionProps = {
  /**
   * Main title.
   */
  title?: string;

  /**
   * Pricing plans.
   */
  plans: Plan[];

  /**
   * Initially selected plan.
   */
  defaultPlanId?: PlanId;

  /**
   * Initially selected billing cycle.
   */
  defaultBillingCycle?: 'monthly' | 'yearly';

  /**
   * Monthly toggle label.
   */
  monthlyLabel?: string;

  /**
   * Yearly toggle label.
   */
  yearlyLabel?: string;

  /**
   * Footer text.
   */
  footerText?: string;

  /**
   * CTA button label.
   */
  buttonText?: string;

  /**
   * Called when CTA is pressed.
   */
  onContinue?: (
    planId: PlanId,
    billingCycle: 'monthly' | 'yearly',
  ) => void;

  /**
   * Optional container class.
   */
  className?: string;
};

function toNumber(price: string): number {
  const parsed = Number.parseFloat(
    price.replace(/[^0-9.]/g, ''),
  );

  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function ChangeablePricingSection({
  title = 'Select a plan',
  plans,
  defaultPlanId,
  defaultBillingCycle = 'monthly',
  monthlyLabel = 'Monthly',
  yearlyLabel = 'Yearly',
  footerText = 'Cancel anytime. No long-term contract.',
  buttonText = 'Continue',
  onContinue,
  className,
}: ChangeablePricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    defaultPlanId ?? plans[0]?.id ?? '',
  );

  const [billingCycle, setBillingCycle] = useState<
    'monthly' | 'yearly'
  >(defaultBillingCycle);

  const handleContinue = () => {
    if (!selectedPlan)
      return;

    onContinue?.(
      selectedPlan,
      billingCycle,
    );
  };

  return (
    <View
      className={cn(
        'w-full max-w-115 rounded-3xl border border-border bg-muted p-1.5',
        className,
      )}
    >
      {/* ============================================================
          HEADER
      ============================================================ */}

      <View className="flex-row items-center justify-between px-3 py-4">
        <Text className="text-[17px] font-medium tracking-tight text-foreground">
          {title}
        </Text>

        <Tabs
          value={billingCycle}
          onValueChange={cycle =>
            setBillingCycle(cycle as 'monthly' | 'yearly')}
          className="flex-none"
        >
          <TabsList className="mr-0">
            <TabsTrigger value="monthly">
              <Text className="text-[10px] font-bold tracking-widest uppercase">
                {monthlyLabel}
              </Text>
            </TabsTrigger>
            <TabsTrigger value="yearly">
              <Text className="text-[10px] font-bold tracking-widest uppercase">
                {yearlyLabel}
              </Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </View>

      {/* ============================================================
          PLANS
      ============================================================ */}

      <RadioGroup
        value={selectedPlan}
        onValueChange={setSelectedPlan}
        className="gap-1"
      >
        {plans.map((plan, index) => (
          <PricingPlan
            key={plan.id}
            plan={plan}
            selected={selectedPlan === plan.id}
            billingCycle={billingCycle}
            index={index}
          />
        ))}
      </RadioGroup>

      {/* ============================================================
          FOOTER
      ============================================================ */}

      <View className="mt-5 flex-col items-center gap-4 px-3 pb-2">
        <Text className="text-center text-[10px] leading-relaxed font-bold tracking-wider text-muted-foreground uppercase">
          {footerText}
        </Text>

        <Button
          variant="primary"
          title={buttonText}
          onPress={handleContinue}
          disabled={!selectedPlan}
          className="w-full rounded-full"
        />
      </View>
    </View>
  );
}

/* ================================================================
   PLAN
================================================================ */

type PricingPlanProps = {
  plan: Plan;
  selected: boolean;
  billingCycle: 'monthly' | 'yearly';
  index: number;
};

function PricingPlan({
  plan,
  selected,
  billingCycle,
  index,
}: PricingPlanProps) {
  const primaryHex = usePrimaryHex();

  return (
    <Animated.View
      entering={FadeIn.delay(index * 40).duration(250)}
    >
      <Card
        className={cn(
          'rounded-[18px]',
          selected
            ? 'border-primary'
            : 'border-border',
        )}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <RadioGroupItem
                value={plan.id}
                label={plan.name}
              />

              {plan.badge && (
                <Badge variant="secondary" size="xs">
                  {plan.badge}
                </Badge>
              )}
            </View>

            <Text className="mt-1.5 pl-8 text-[11px] leading-snug text-muted-foreground">
              {plan.description}
            </Text>
          </View>

          {/* ======================================================
              PRICE
          ====================================================== */}

          <Price
            monthly={plan.priceMonthly}
            yearly={plan.priceYearly}
            billingCycle={billingCycle}
          />
        </View>

        {selected && (
          <PlanFeatures plan={plan} primaryHex={primaryHex} />
        )}
      </Card>
    </Animated.View>
  );
}

/* ================================================================
   PLAN FEATURES
================================================================ */

type PlanFeaturesProps = {
  plan: Plan;
  primaryHex: string;
};

function PlanFeatures({
  plan,
  primaryHex,
}: PlanFeaturesProps) {
  const { muted } = useThemeColors();

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      className="overflow-hidden"
    >
      <View className="mt-3.5 border-t border-dashed border-border pt-3.5">
        {plan.featuresLabel && (
          <Text className="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {plan.featuresLabel}
          </Text>
        )}

        <View className="gap-2.5">
          {plan.features.map(feature => (
            <View
              key={`${plan.id}-${feature.text}`}
              className="flex-row items-center gap-2.5"
            >
              <Check
                size={14}
                strokeWidth={3}
                color={primaryHex}
              />

              <Text className="flex-1 text-[12px] leading-tight text-muted-foreground">
                {feature.text}
              </Text>

              {feature.hasInfo && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info
                      size={13}
                      color={muted}
                    />
                  </TooltipTrigger>

                  <TooltipContent side="top">
                    <Text>{feature.text}</Text>
                  </TooltipContent>
                </Tooltip>
              )}
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

/* ================================================================
   ANIMATED PRICE
================================================================ */

type PriceProps = {
  monthly: string;
  yearly: string;
  billingCycle: 'monthly' | 'yearly';
};

function Price({
  monthly,
  yearly,
  billingCycle,
}: PriceProps) {
  const { text } = useThemeColors();
  const price
    = billingCycle === 'monthly'
      ? toNumber(monthly)
      : toNumber(yearly);

  return (
    <View className="shrink-0 items-end">
      <AnimatedNumber
        value={price}
        format={{
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }}
        style={{ fontSize: 15, fontWeight: '500', color: text }}
      />

      <Text className="mt-1.5 text-[10px] leading-none font-bold tracking-widest text-muted-foreground uppercase">
        per user/month
      </Text>
    </View>
  );
}
