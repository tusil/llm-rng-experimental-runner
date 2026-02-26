import { describe, expect, it, vi } from 'vitest';
import { LmStudioPolicyAdapter } from '../../src/infrastructure/policy/LmStudioPolicyAdapter.js';

const rng = { nextUint32: () => 0, nextFloat01: () => 0, pickOne: <T>(items: readonly T[]) => items[0] };
const clock = { nowMs: () => 100 };

describe('LmStudioPolicyAdapter', () => {
  it('parses valid response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'RIGHT' } }], usage: { total_tokens: 3 } })
    })));

    const adapter = new LmStudioPolicyAdapter({ baseUrl: 'http://localhost:1234/v1', model: 'x', rng, clock });
    const out = await adapter.chooseAction({
      allowedActions: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY'],
      observationText: 'obs',
      memoryText: 'mem',
      temperature: 0,
      maxOutputTokens: 4,
      timeoutMs: 50
    });
    expect(out.action).toBe('RIGHT');
    vi.unstubAllGlobals();
  });
});
