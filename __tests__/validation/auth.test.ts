import { editProfileSchema, forgotPasswordSchema, loginSchema, registerSchema } from '@/validation';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(loginSchema.safeParse({ email: 'demo@example.com', password: 'secret1' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret1' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['email']);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'demo@example.com', password: '12345' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['password']);
  });
});

describe('registerSchema', () => {
  const valid = { name: 'Demo User', email: 'demo@example.com', password: 'secret1', confirmPassword: 'secret1' };

  it('accepts matching passwords', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('reports mismatched passwords on confirmPassword', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(i => i.path.join('.'))).toContain('confirmPassword');
  });

  it('requires a name of at least 2 characters', () => {
    expect(registerSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('only needs a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'demo@example.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('editProfileSchema', () => {
  const base = { name: 'Demo User', email: 'demo@example.com', role: 'Admin' };

  it('treats an empty password as "unchanged"', () => {
    expect(editProfileSchema.safeParse({ ...base, password: '' }).success).toBe(true);
    expect(editProfileSchema.safeParse(base).success).toBe(true);
  });

  it('still validates a new password when one is given', () => {
    expect(editProfileSchema.safeParse({ ...base, password: '123' }).success).toBe(false);
  });
});
