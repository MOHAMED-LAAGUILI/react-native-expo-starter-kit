import type { ReactFormExtendedApi } from '@tanstack/react-form';
import type { RegisterFormData } from '@/validation';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { useLogin, useRegister } from '@/api/hooks/use-auth';
import { Button, Input, Text } from '@/components/ui';
import { showToast } from '@/components/ui/toast';
import { getFieldError } from '@/lib/form-helpers';
import { useAuthStore } from '@/store';
import { loginSchema, registerSchema } from '@/validation';

type Mode = 'login' | 'signup';

function DemoLoginButton({ isLogin }: { isLogin: boolean }) {
  return (
    <Button
      title={isLogin ? 'Skip Login (Demo Mode)' : 'Skip Signup (Demo Mode)'}
      variant="ghost"
      onPress={() => {
        useAuthStore.getState().login(
          { createdAt: new Date().toISOString(), email: 'demo@example.com', id: '1', name: 'Demo User' },
          { accessToken: 'demo-token', refreshToken: 'demo-refresh' },
        );
        showToast({ message: 'You are now logged in as Demo User.', title: 'Welcome!', variant: 'success' });
      }}
      className="mt-4"
    />
  );
}

function ToggleModeLink({ isLogin, onPress }: { isLogin: boolean; onPress: () => void }) {
  return (
    <Pressable className="items-center py-2" onPress={onPress}>
      <Text variant="body" className="text-muted-foreground">
        {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
        <Text variant="body" className="font-semibold text-primary">
          {isLogin ? 'Sign Up' : 'Sign In'}
        </Text>
      </Text>
    </Pressable>
  );
}

function LoginFormFields({ form, isLogin, formError }: { form: ReactFormExtendedApi<RegisterFormData, any, any, any, any, any, any, any, any, any, any, any>; isLogin: boolean; formError?: string }) {
  return (
    <View className="mb-6 gap-4">
      {!isLogin && (
        <form.Field name="name">
          {field => (
            <Input
              type="username"
              label="Name"
              placeholder="Enter your name"
              autoCapitalize="words"
              value={field.state.value}
              onChangeText={v => field.handleChange(v)}
              onBlur={() => field.handleBlur()}
              error={getFieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
      )}

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

      <form.Field name="password">
        {field => (
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={field.state.value}
            onChangeText={v => field.handleChange(v)}
            onBlur={() => field.handleBlur()}
            error={getFieldError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      {!isLogin && (
        <form.Field name="confirmPassword">
          {field => (
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={field.state.value}
              onChangeText={v => field.handleChange(v)}
              onBlur={() => field.handleBlur()}
              error={getFieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>
      )}

      {formError && (
        <Text variant="caption" className="text-destructive">{formError}</Text>
      )}

      <form.Subscribe selector={s => s.isSubmitting}>
        {isSubmitting => (
          <Button
            title={isLogin ? 'Sign In' : 'Sign Up'}
            loading={isSubmitting}
            onPress={() => form.handleSubmit()}
            size="lg"
            className="mt-2"
          />
        )}
      </form.Subscribe>
    </View>
  );
}

function LoginScreen() {
  const [mode, setMode] = React.useState<Mode>('login');
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isLogin = mode === 'login';

  const form = useForm({
    defaultValues: { confirmPassword: '', email: '', name: '', password: '' } as RegisterFormData,
    onSubmit: async ({ value }) => {
      if (isLogin) {
        await loginMutation.mutateAsync({ email: value.email, password: value.password });
      }
      else {
        await registerMutation.mutateAsync({ email: value.email, name: value.name, password: value.password });
      }
    },
    validators: { onSubmit: isLogin ? (loginSchema as never) : (registerSchema as never) },
  });

  const mutationError = isLogin ? loginMutation.error : registerMutation.error;
  const formError = mutationError ? (mutationError as Error).message : undefined;

  return (
    <KeyboardAvoidingView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-8 items-center gap-2">
          <Text variant="h1">{isLogin ? 'Welcome' : 'Create Account'}</Text>
          <Text variant="body" className="text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Sign up for a new account'}
          </Text>
        </View>

        <LoginFormFields form={form as unknown as ReactFormExtendedApi<RegisterFormData, any, any, any, any, any, any, any, any, any, any, any>} isLogin={isLogin} formError={formError} />

        <ToggleModeLink
          isLogin={isLogin}
          onPress={() => {
            setMode(m => (m === 'login' ? 'signup' : 'login'));
            form.reset();
          }}
        />

        <DemoLoginButton isLogin={isLogin} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export { LoginScreen };
