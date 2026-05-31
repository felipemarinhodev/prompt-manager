/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

import { webcrypto } from 'node:crypto';
import { TextEncoder, TextDecoder } from 'node:util';

(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto;
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

expect.extend({});
