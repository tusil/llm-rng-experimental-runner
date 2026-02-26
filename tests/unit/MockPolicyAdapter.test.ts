import { describe, expect, it } from 'vitest';
import { MockPolicyAdapter } from '../../src/infrastructure/policy/MockPolicyAdapter.js';
import { ACTIONS } from '../../src/domain/env/Action.js';

const input = {
  allowedActions: ACTIONS,
  observationText: 'obs',
  memoryText: 'mem',
  temperature: 0,
  maxOutputTokens: 1,
  timeoutMs: 1
};

describe('MockPolicyAdapter', () => {
  it('fixed mode returns same action always', async () => {
    const adapter = new MockPolicyAdapter({ mode: 'fixed', action: 'LEFT' });

    const a = await adapter.chooseAction(input);
    const b = await adapter.chooseAction(input);

    expect(a.action).toBe('LEFT');
    expect(b.action).toBe('LEFT');
    expect(a.rawText).toBe('LEFT');
    expect(a.latencyMs).toBe(0);
  });

  it('cycle mode repeats sequence', async () => {
    const adapter = new MockPolicyAdapter({ mode: 'cycle', sequence: ['UP', 'RIGHT'] });

    const actions = [
      (await adapter.chooseAction(input)).action,
      (await adapter.chooseAction(input)).action,
      (await adapter.chooseAction(input)).action,
      (await adapter.chooseAction(input)).action
    ];

    expect(actions).toEqual(['UP', 'RIGHT', 'UP', 'RIGHT']);
  });
});
