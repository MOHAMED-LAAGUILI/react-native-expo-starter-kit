/**
 * Expo SDK 58 installs some web globals as lazy getters (`URL`,
 * `TextDecoderStream`, `structuredClone`, …). If the first access happens
 * after Jest has torn the environment down, it throws "You are trying to
 * import a file after the Jest environment has been torn down". Touch each
 * one up-front so they resolve while the environment is alive.
 */
for (const name of [
  'TextDecoderStream',
  'TextEncoderStream',
  'URL',
  'URLSearchParams',
  'DOMException',
  '__ExpoImportMetaRegistry',
  'structuredClone',
]) {
  try {
    void globalThis[name];
  }
  catch {
    // Not installed in this environment — nothing to resolve.
  }
}
