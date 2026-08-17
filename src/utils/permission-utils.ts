/* React Compiler can't handle dynamic import() expressions or try/catch/finally.
 * This file isolates those patterns so the compiler can optimize components/hooks.
 */

export async function loadExpoNotifications() {
  return import('expo-notifications');
}

export async function loadExpoImagePicker() {
  return import('expo-image-picker');
}

export async function loadExpoMediaLibrary() {
  return import('expo-media-library');
}

export async function loadExpoLocation() {
  return import('expo-location');
}

export async function saveAudioRecording(uri: string): Promise<'saved' | 'permission-denied'> {
  const lib = await loadExpoMediaLibrary();
  const { status: perm } = await lib.requestPermissionsAsync(true);
  if (perm !== 'granted')
    return 'permission-denied';
  const asset = await lib.Asset.create(uri);
  await asset.getUri();
  return 'saved';
}
