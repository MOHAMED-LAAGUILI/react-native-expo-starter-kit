/**
 * Unit tests must never reach the network: a real request makes a test slow,
 * flaky and dependent on whatever server happens to answer. `fetch` (which
 * Axios uses under React Native) is replaced with a rejecting stub, and any
 * attempt fails the test that made it — even if the test caught the error.
 *
 * Mock the API layer (`jest.mock('@/api/...')`) or stub `globalThis.fetch`
 * inside the test instead.
 */
const leaks = [];

function urlOf(input) {
  if (typeof input === 'string')
    return input;
  if (input && typeof input.url === 'string')
    return input.url;
  return String(input);
}

globalThis.fetch = function noRealNetwork(input) {
  const url = urlOf(input);
  leaks.push(url);
  return Promise.reject(new TypeError(`Network request failed (unmocked fetch to ${url})`));
};

afterEach(() => {
  if (leaks.length === 0)
    return;
  const urls = leaks.splice(0);
  throw new Error(
    `This test made ${urls.length} real network request(s); mock fetch or the API client:\n${urls.map(u => `  ${u}`).join('\n')}`,
  );
});
