import type { PolicyPort, PolicyInput, PolicyResult } from '../../application/ports/PolicyPort.js';
import type { Action } from '../../domain/env/Action.js';

interface MockPolicyConfig {
  mode: 'fixed' | 'cycle';
  action?: Action;
  sequence?: Action[];
}

export class MockPolicyAdapter implements PolicyPort {
  private index = 0;

  constructor(private readonly config: MockPolicyConfig) {}

  async chooseAction(_input: PolicyInput): Promise<PolicyResult> {
    const action = this.nextAction();
    return {
      action,
      rawText: action,
      latencyMs: 0
    };
  }

  private nextAction(): Action {
    if (this.config.mode === 'fixed') {
      return this.config.action ?? 'STAY';
    }

    const sequence = this.config.sequence ?? ['STAY'];
    const action = sequence[this.index % sequence.length];
    this.index += 1;
    return action;
  }
}
