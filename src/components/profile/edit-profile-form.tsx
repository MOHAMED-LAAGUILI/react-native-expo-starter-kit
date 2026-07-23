import { Shield } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Button, Icon, Input } from '@/components/ui';
import { showToast } from '@/components/ui/toaster';
import { useAuthStore } from '@/store';
import { editProfileSchema } from '@/validation';

type EditProfileFormProps = {
  onCancel?: () => void;
};

type FieldErrors = {
  email?: string;
  name?: string;
  role?: string;
};

export function EditProfileForm({ onCancel }: EditProfileFormProps) {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);

  const [name, setName] = React.useState(user?.name ?? '');
  const [email, setEmail] = React.useState(user?.email ?? '');
  const [role, setRole] = React.useState(user?.role || 'Administrator');
  const [errors, setErrors] = React.useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleNameChange = (v: string) => {
    setName(v);
    clearError('name');
  };
  const handleEmailChange = (v: string) => {
    setEmail(v);
    clearError('email');
  };
  const handleRoleChange = (v: string) => {
    setRole(v);
    clearError('role');
  };

  const handleSave = () => {
    const result = editProfileSchema.safeParse({
      email: email.trim(),
      name: name.trim(),
      role: role.trim(),
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    updateProfile(result.data);
    showToast({ title: 'Profile Updated', message: 'Your profile has been updated successfully', variant: 'success' });
    onCancel?.();
  };

  return (
    <View className="gap-4">
      <Input
        label="Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={handleNameChange}
        type="username"
        error={errors.name}
      />
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={handleEmailChange}
        type="email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Role"
        placeholder="Enter your role"
        value={role ?? 'Administrator'}
        onChangeText={handleRoleChange}
        leftIcon={<Icon as={Shield} className="size-[18px] text-muted-foreground" />}
        autoCapitalize="none"
        error={errors.role}
      />

      <View className="flex-row gap-3">
        <Button
          variant="primary"
          title="Save Changes"
          onPress={handleSave}
          className="flex-1"
        />
      </View>
    </View>
  );
}
