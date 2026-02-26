import { describe, expect, it } from 'vitest';
import { RunSingle } from '../../src/application/usecases/RunSingle.js';
import { GridWorld } from '../../src/infrastructure/env/GridWorld.js';
import { MemoryService } from '../../src/application/services/MemoryService.js';
import { PromptService } from '../../src/application/services/PromptService.js';
import { MetricsService } from '../../src/application/services/MetricsService.js';
import { ACTIONS } from '../../src/domain/env/Action.js';

describe('RunSingle integration', () => {
  it('runs deterministic mock policy and logs all steps', async () => {
    const steps: unknown[] = [];
    const rng = {
      nextUint32: () => 0,
      nextFloat01: () => 1,
      pickOne: <T>(items: readonly T[]) => items[0]
    };
    const run = new RunSingle({
      config: {
        runs: 1,
        stepsPerRun: 10,
        env: { size: 9, envSeed: 1 },
        shock: { atStep: 5, type: 'invertRewards' },
        agent: { epsilon: 0, memory: { kRecent: 2, explorationProb: 0 } },
        rng: { driver: 'crypto' },
        policy: { driver: 'lmstudio', baseUrl: 'http://x', model: 'm', temperature: 0, maxOutputTokens: 5, timeoutMs: 1000 },
        logging: { outDir: 'out' }
      },
      rng,
      policy: {
        chooseAction: async () => ({ action: ACTIONS[0], rawText: 'UP', latencyMs: 1 })
      },
      logger: {
        logStep: async (e) => void steps.push(e),
        logRunSummary: async () => {}
      },
      envFactory: (seed) => new GridWorld(9, seed, { atStep: 5, type: 'invertRewards' }),
      memoryService: new MemoryService(rng),
      promptService: new PromptService(),
      metricsService: new MetricsService()
    });

    const summary = await run.execute('run-0000', 0);
    expect(steps).toHaveLength(10);
    expect(summary.totalReward).toBeTypeOf('number');
  });
});
