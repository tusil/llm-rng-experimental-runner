import { describe, expect, it, vi } from 'vitest';
import type { RngPort } from '../../src/application/ports/RngPort.js';
import { CryptoRngAdapter } from '../../src/infrastructure/rng/CryptoRngAdapter.js';
import { BufferedRngAdapter } from '../../src/infrastructure/rng/BufferedRngAdapter.js';

describe('RNG adapters', () => {
  it('CryptoRngAdapter ranges', () => {
    const rng = new CryptoRngAdapter();
    const u = rng.nextUint32();
    const f = rng.nextFloat01();
    expect(u).toBeGreaterThanOrEqual(0);
    expect(u).toBeLessThanOrEqual(0xffffffff);
    expect(f).toBeGreaterThanOrEqual(0);
    expect(f).toBeLessThan(1);
  });

  it('BufferedRngAdapter buffers inner calls', () => {
    const inner: RngPort = {
      nextUint32: vi.fn(() => 7),
      nextFloat01: vi.fn(() => 0.1),
      pickOne: <T>(items: readonly T[]) => items[0]
    };
    const buffered = new BufferedRngAdapter(inner, 4);
    buffered.nextUint32();
    buffered.nextUint32();
    buffered.nextUint32();
    expect(inner.nextUint32).toHaveBeenCalledTimes(4);
  });
});
