/**
 * Parsers behind `pnpm run perf:device`, against captured adb output.
 */
import {
  busiestThreads,
  cpuPercent,
  cpuTicks,
  framesRendered,
  meminfoKb,
  parseAmStart,
  summarize,
  topRow,
} from '../../script/lib/device-perf';

describe('cpuTicks', () => {
  it('adds utime and stime (fields 14 and 15)', () => {
    const stat = '4242 (com.rntemplate.app) S 600 600 0 0 -1 1077952832 9000 0 12 0 1500 250 0 0 10 -10 120 0';
    expect(cpuTicks(stat)).toBe(1750);
  });

  it('counts fields after the command name even when it has spaces', () => {
    const stat = '7 (my app name) S 1 1 0 0 -1 0 0 0 0 0 30 20 0 0';
    expect(cpuTicks(stat)).toBe(50);
  });

  it('returns null for unparsable input', () => {
    expect(cpuTicks('')).toBeNull();
  });
});

describe('cpuPercent', () => {
  it('converts a tick delta to % of one core', () => {
    expect(cpuPercent(600, 100, 60)).toBe(10);
  });

  it('refuses a zero-length interval', () => {
    expect(cpuPercent(10, 100, 0)).toBeNull();
  });
});

describe('meminfo, gfxinfo and top', () => {
  const meminfo = [
    ' App Summary',
    '                       Pss(KB)                        Rss(KB)',
    '           Java Heap:    12540                          31204',
    '         Native Heap:    40112                          41020',
    '            Graphics:     8800                           8800',
    '       Private Other:     5120',
    '           TOTAL PSS:   120345            TOTAL RSS:   210000',
  ].join('\n');

  it('reads the first number after a label', () => {
    expect(meminfoKb(meminfo, 'Java Heap:')).toBe(12540);
    expect(meminfoKb(meminfo, 'TOTAL PSS:')).toBe(120345);
    expect(meminfoKb(meminfo, 'TOTAL RSS:')).toBe(210000);
    expect(meminfoKb(meminfo, 'Missing:')).toBeNull();
  });

  it('reads total frames rendered', () => {
    expect(framesRendered('Stats since: 1\nTotal frames rendered: 3456\nJanky frames: 12')).toBe(3456);
    expect(framesRendered('nothing here')).toBeNull();
  });

  it('finds the process row in top output', () => {
    const top = [
      'Tasks: 1 total',
      '  PID USER         PR  NI VIRT  RES  SHR S[%CPU] %MEM     TIME+ ARGS',
      ' 4242 u0_a190      10 -10  14G 312M 140M S  7.3   4.1   1:02.11 com.rntemplate.app',
    ].join('\n');
    expect(topRow(top, '4242')).toEqual({ res: '312M', cpu: '7.3' });
    expect(topRow(top, '1')).toBeNull();
  });

  it('lists the busiest threads first', () => {
    const threads = [
      '  TID USER         PR  NI VIRT  RES  SHR S %CPU %MEM     TIME+ THREAD          PROCESS',
      ' 4250 u0_a190      10 -10  14G 312M 140M S  2.0   4.1   0:10.00 RenderThread    com.rntemplate.app',
      ' 4260 u0_a190      10 -10  14G 312M 140M R 31.5   4.1   0:50.00 mqt_v_js        com.rntemplate.app',
      ' 4242 u0_a190      10 -10  14G 312M 140M S  5.0   4.1   0:20.00 com.rntemplate  com.rntemplate.app',
    ].join('\n');
    expect(busiestThreads(threads, 2)).toEqual([
      '31.5% mqt_v_js com.rntemplate.app',
      '5% com.rntemplate com.rntemplate.app',
    ]);
  });
});

describe('cold start', () => {
  it('parses am start -W', () => {
    const out = 'Starting: Intent { cmp=com.rntemplate.app/.MainActivity }\nStatus: ok\nLaunchState: COLD\nActivity: com.rntemplate.app/.MainActivity\nTotalTime: 812\nWaitTime: 830\nComplete\n';
    expect(parseAmStart(out)).toEqual({ totalMs: 812, waitMs: 830, launchState: 'COLD' });
  });

  it('summarizes runs, ignoring failed ones', () => {
    expect(summarize([900, null, 700, 800, 1000])).toEqual({ median: 850, min: 700, max: 1000, n: 4 });
    expect(summarize([null])).toBeNull();
  });
});
