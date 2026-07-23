import type { ReactFormExtendedApi } from '@tanstack/react-form';
import type { RegisterFormData } from '@/validation';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useLogin, useRegister } from '@/api/hooks/use-auth';
import { DemoLoginButton, ForgotPasswordLink, LoginFormFields, ToggleModeLink } from '@/components/auth';
import { Image, Text } from '@/components/ui';
import { loginSchema, registerSchema } from '@/validation';

type Mode = 'login' | 'signup';

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
          <Image
            source={require('@assets/images/react-logo.png')}
            className="mb-2 size-20 overflow-hidden rounded-full"
            style={{ height: 80, width: 80, borderRadius: '100px' }}
            contentFit="cover"
          />
          <Text variant="h1">{isLogin ? 'Welcome' : 'Create Account'}</Text>
          <Text variant="body" className="text-muted-foreground">
            {isLogin ? 'Sign in to your account' : 'Sign up for a new account'}
          </Text>
        </View>

        <LoginFormFields form={form as unknown as ReactFormExtendedApi<RegisterFormData, any, any, any, any, any, any, any, any, any, any, any>} isLogin={isLogin} formError={formError} />

        {isLogin && <ForgotPasswordLink />}

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
