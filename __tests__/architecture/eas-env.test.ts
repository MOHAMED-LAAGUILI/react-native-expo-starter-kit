/**
 * `.easignore` keeps local `.env.*` files out of EAS uploads, so a cloud build
 * only sees what its `eas.json` profile `env` (or the EAS environment) sets. A
 * key added to `.env.example` but not to a profile would silently fall back to
 * its default in that build.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

const exampleKeys = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line !== '' && !line.startsWith('#') && line.includes('='))
  .map(line => line.slice(0, line.indexOf('=')).trim());

type Profile = { env?: Record<string, string>, channel?: string };
const eas = JSON.parse(fs.readFileSync(path.join(ROOT, 'eas.json'), 'utf8')) as { build: Record<string, Profile> };
const profiles = Object.entries(eas.build);

describe('eas.json build profiles', () => {
  it('has profiles to check', () => {
    expect(profiles.length).toBeGreaterThan(0);
    expect(exampleKeys).toContain('EXPO_PUBLIC_APP_ENV');
  });

  it.each(profiles)('%s sets every key from .env.example', (_name, profile) => {
    const missing = exampleKeys.filter(key => !(key in (profile.env ?? {})));
    expect(missing).toEqual([]);
  });

  it.each(profiles)('%s sets EXPO_PUBLIC_APP_ENV to its own environment', (name, profile) => {
    expect(profile.env?.EXPO_PUBLIC_APP_ENV).toBe(name);
  });
});
