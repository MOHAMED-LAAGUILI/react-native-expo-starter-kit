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
