export function getFieldError(errors: unknown): string | undefined {
  const err = Array.isArray(errors) ? errors[0] : undefined;
  if (!err)
    return undefined;
  if (typeof err === 'string')
    return err;
  if (typeof err === 'object' && err !== null && 'message' in err)
    return String((err as { message: string }).message);
  return String(err);
}
