import { describe, expect, it } from 'vitest';
import { GridWorld } from '../../src/infrastructure/env/GridWorld.js';

describe('GridWorld determinism', () => {
  it('same seed + actions gives same trajectory', () => {
    const actions = ['UP', 'LEFT', 'DOWN', 'RIGHT', 'STAY'] as const;
    const a = new GridWorld(9, 10, { atStep: 3, type: 'invertRewards' });
    const b = new GridWorld(9, 10, { atStep: 3, type: 'invertRewards' });
    const trajA = actions.map((x) => a.step(x));
    const trajB = actions.map((x) => b.step(x));
    expect(trajA).toEqual(trajB);
  });

  it('invertRewards flips reward after shock', () => {
    const world = new GridWorld(9, 4, { atStep: 1, type: 'invertRewards' });
    const r1 = world.step('STAY').reward;
    const r2 = world.step('STAY').reward;
    expect(r1).toBe(-r2);
  });
});
