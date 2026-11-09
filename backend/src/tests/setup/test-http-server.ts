import http from 'node:http';
import type { AddressInfo } from 'node:net';

/** A real local HTTP server to stand in for an upstream API in tests — avoids
 * mocking-library/undici-fetch compatibility gotchas entirely. */
export async function startTestServer(
  handler: http.RequestListener,
): Promise<{ url: string; close: () => Promise<void> }> {
  const server = http.createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}
