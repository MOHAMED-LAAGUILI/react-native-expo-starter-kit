import { Button } from '@/components/ui';
import { showToast } from '@/components/ui/toaster';
import { useAuthStore } from '@/store';

type DemoLoginButtonProps = {
  isLogin: boolean;
};

function DemoLoginButton({ isLogin }: DemoLoginButtonProps) {
  return (
    <Button
      title={isLogin ? 'Skip Login (Demo Mode)' : 'Skip Signup (Demo Mode)'}
      variant="ghost"
      onPress={() => {
        useAuthStore.getState().login(
          { createdAt: new Date().toISOString(), email: 'demo@example.com', id: '1', name: 'Demo User', role: 'Administrator' },
          { accessToken: 'demo-token', refreshToken: 'demo-refresh' },
        );
        showToast({ message: 'You are now logged in as Demo User.', title: 'Welcome!', variant: 'success' });
      }}
      className="mt-4"
    />
  );
}

export { DemoLoginButton };
export type { DemoLoginButtonProps };
