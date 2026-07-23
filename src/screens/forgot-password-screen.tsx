import type { ForgotPasswordFormData } from '@/validation';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useForgotPassword } from '@/api/hooks/use-auth';
import { Button, Image, Input, Text } from '@/components/ui';
import { getFieldError } from '@/utils/form-helpers';
import { forgotPasswordSchema } from '@/validation';

function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm({
    defaultValues: { email: '' } as ForgotPasswordFormData,
    onSubmit: async ({ value }) => {
      await forgotPasswordMutation.mutateAsync({ email: value.email });
      router.push({ pathname: '/verify-otp' as never, params: { email: value.email } });
    },
    validators: { onSubmit: forgotPasswordSchema as never },
  });

  const formError = forgotPasswordMutation.error ? (forgotPasswordMutation.error as Error).message : undefined;

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
          <Text variant="h1">Forgot Password</Text>
          <Text variant="body" className="text-center text-muted-foreground">
            Enter your email address and we'll send you an OTP code to reset your password
          </Text>
        </View>

        <View className="mb-6 gap-4">
          <form.Field name="email">
            {field => (
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                autoCapitalize="none"
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
                title="Send OTP"
                loading={isSubmitting}
                onPress={() => form.handleSubmit()}
                size="lg"
                className="mt-2"
              />
            )}
          </form.Subscribe>
        </View>

        <Button
          title="Back to Login"
          variant="outline"
          onPress={() => router.back()}
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export { ForgotPasswordScreen };
