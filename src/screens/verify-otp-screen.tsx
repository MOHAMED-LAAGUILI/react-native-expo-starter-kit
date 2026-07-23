import type { VerifyOtpFormData } from '@/validation';
import { useForm } from '@tanstack/react-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useVerifyOtp } from '@/api/hooks/use-auth';
import { Button, Image, Input, Text } from '@/components/ui';
import { getFieldError } from '@/utils/form-helpers';
import { verifyOtpSchema } from '@/validation';

function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const verifyOtpMutation = useVerifyOtp();

  const form = useForm({
    defaultValues: { confirmPassword: '', newPassword: '', otp: '' } as VerifyOtpFormData,
    onSubmit: async ({ value }) => {
      await verifyOtpMutation.mutateAsync({ email: email || '', newPassword: value.newPassword, otp: value.otp });
      router.replace('/login' as never);
    },
    validators: { onSubmit: verifyOtpSchema as never },
  });

  const formError = verifyOtpMutation.error ? (verifyOtpMutation.error as Error).message : undefined;

  return (
    <KeyboardAvoidingView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-8 items-center gap-2">
          <Image
            source={require('@assets/images/react-logo.png')}
            className="mb-2 size-20 overflow-hidden rounded-full"
            style={{ height: 80, width: 80, borderRadius: '100px' }}
            contentFit="cover"
          />
          <Text variant="h1">Verify OTP</Text>
          <Text variant="body" className="text-center text-muted-foreground">
            Enter the 6-digit code sent to
            {' '}
            {email}
          </Text>
        </View>

        <View className="mb-6 gap-4">
          <form.Field name="otp">
            {field => (
              <Input
                type="text"
                label="OTP Code"
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                value={field.state.value}
                onChangeText={v => field.handleChange(v)}
                onBlur={() => field.handleBlur()}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field name="newPassword">
            {field => (
              <Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={field.state.value}
                onChangeText={v => field.handleChange(v)}
                onBlur={() => field.handleBlur()}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {field => (
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={field.state.value}
                onChangeText={v => field.handleChange(v)}
                onBlur={() => field.handleBlur()}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          {formError && <Text variant="caption" className="text-destructive">{formError}</Text>}

          <form.Subscribe selector={s => s.isSubmitting}>
            {isSubmitting => (
              <Button
                title="Reset Password"
                loading={isSubmitting}
                onPress={() => form.handleSubmit()}
                size="lg"
                className="mt-2"
              />
            )}
          </form.Subscribe>
        </View>

        <Button
          title="Back"
          variant="ghost"
          onPress={() => router.back()}
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export { VerifyOtpScreen };
