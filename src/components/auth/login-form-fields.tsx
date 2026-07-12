import type { ReactFormExtendedApi } from '@tanstack/react-form';
import type { RegisterFormData } from '@/validation';
import { View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { getFieldError } from '@/lib/form-helpers';

type LoginFormFieldsProps = {
  form: ReactFormExtendedApi<RegisterFormData, any, any, any, any, any, any, any, any, any, any, any>;
  isLogin: boolean;
  formError?: string;
};

function LoginFormFields({ form, isLogin, formError }: LoginFormFieldsProps) {
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

export { LoginFormFields };
export type { LoginFormFieldsProps };
