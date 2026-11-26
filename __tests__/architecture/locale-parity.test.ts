/**
 * Runs the same check as `pnpm run i18n:check`, so a missing French key fails
 * the unit-test run (and CI) instead of showing a raw key to users.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('locale parity', () => {
  it('every locale has every English key', () => {
    const result = spawnSync(
      process.execPath,
      ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'script/check-locale-parity.ts'],
      { cwd: ROOT, encoding: 'utf8' },
    );
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });
});
