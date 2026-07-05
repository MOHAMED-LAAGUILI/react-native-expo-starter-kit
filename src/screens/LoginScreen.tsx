import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, View } from "react-native";
import { useLogin, useRegister } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useAuthStore } from "@/store";
import { loginSchema, registerSchema } from "@/validation";
import type { RegisterFormData } from "@/validation";
import { Lock, Mail, User } from "lucide-react-native";

type Mode = "login" | "signup";

function getFieldError(errors: unknown): string | undefined {
  const err = Array.isArray(errors) ? errors[0] : undefined;
  if (!err) return undefined;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) return String((err as { message: string }).message);
  return String(err);
}

function LoginScreen() {
  const [mode, setMode] = React.useState<Mode>("login");
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isLogin = mode === "login";

  const form = useForm({
    defaultValues: { confirmPassword: "", email: "", name: "", password: "" } as RegisterFormData,
    onSubmit: async ({ value }) => {
      if (isLogin) {
        await loginMutation.mutateAsync({ email: value.email, password: value.password });
      } else {
        await registerMutation.mutateAsync({ email: value.email, name: value.name, password: value.password });
      }
    },
    validators: { onSubmit: isLogin ? (loginSchema as never) : (registerSchema as never) },
  });

  const mutationError = isLogin ? loginMutation.error : registerMutation.error;
  const formError = mutationError ? (mutationError as Error).message : undefined;

  function toggleMode() {
    setMode(m => (m === "login" ? "signup" : "login"));
    form.reset();
  }

  function demoLogin() {
    useAuthStore.getState().login(
      {
        createdAt: new Date().toISOString(),
        email: "demo@example.com",
        id: "1",
        name: "Demo User",
      },
      { accessToken: "demo-token", refreshToken: "demo-refresh" }
    );
  }

  const iconSize = 16;

  return (
    <KeyboardAvoidingView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8 gap-2">
          <Text variant="h1">{isLogin ? "Welcome" : "Create Account"}</Text>
          <Text variant="body" className="text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Sign up for a new account"}
          </Text>
        </View>

        <View className="gap-4 mb-6">
          {!isLogin && (
            <form.Field name="name">
              {field => (
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  leftIcon={<User size={iconSize} className="text-muted-foreground" />}
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
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={iconSize} className="text-muted-foreground" />}
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
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                leftIcon={<Lock size={iconSize} className="text-muted-foreground" />}
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
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  secureTextEntry
                  leftIcon={<Lock size={iconSize} className="text-muted-foreground" />}
                  value={field.state.value}
                  onChangeText={v => field.handleChange(v)}
                  onBlur={() => field.handleBlur()}
                  error={getFieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
          )}

          {formError && (
            <Text variant="caption" className="text-destructive">
              {formError}
            </Text>
          )}

          <form.Subscribe selector={s => s.isSubmitting}>
            {isSubmitting => (
              <Button
                title={isLogin ? "Sign In" : "Sign Up"}
                loading={isSubmitting}
                onPress={() => form.handleSubmit()}
                size="lg"
                className="mt-2"
              />
            )}
          </form.Subscribe>
        </View>

        <Pressable onPress={toggleMode} className="items-center">
          <Text variant="body" className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text variant="body" className="text-primary font-semibold">
              {isLogin ? "Sign Up" : "Sign In"}
            </Text>
          </Text>
        </Pressable>

        <Button
          title={isLogin ? "Skip Login (Demo Mode)" : "Skip Signup (Demo Mode)"}
          variant="ghost"
          onPress={demoLogin}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export { LoginScreen };
