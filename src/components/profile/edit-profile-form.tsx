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

  const initialName = user?.name ?? '';
  const initialEmail = user?.email ?? '';
  const initialRole = user?.role ?? 'Administrator';

  const [name, setName] = React.useState(initialName);
  const [email] = React.useState(initialEmail);
  const [role, setRole] = React.useState(initialRole);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  const isDirty = name !== initialName || email !== initialEmail || role !== initialRole;
  const hasErrors = !!errors.name || !!errors.email || !!errors.role;

  const validateField = (field: keyof FieldErrors, value: string) => {
    const fieldSchema = editProfileSchema.shape[field];
    const result = fieldSchema.safeParse(value.trim() || value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [field]: result.error.issues[0]?.message }));
    }
    else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNameChange = (v: string) => {
    setName(v);
    validateField('name', v);
  };
  const handleRoleChange = (v: string) => {
    setRole(v);
    validateField('role', v);
  };

  const handleSave = () => {
    const trimmed = { email: email.trim(), name: name.trim(), role: role.trim() };

    const result = editProfileSchema.safeParse(trimmed);
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
        type="email"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={false}
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
          variant="primary-gradient"
          title="Save Changes"
          onPress={handleSave}
          disabled={!isDirty || hasErrors}
          className="flex-1"
        />
      </View>
    </View>
  );
}
