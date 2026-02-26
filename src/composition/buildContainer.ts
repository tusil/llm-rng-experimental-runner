import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RunConfig } from '../domain/experiment/RunConfig.js';
import { MemoryService } from '../application/services/MemoryService.js';
import { MetricsService } from '../application/services/MetricsService.js';
import { PromptService } from '../application/services/PromptService.js';
import { RunSingle } from '../application/usecases/RunSingle.js';
import { RunExperiment } from '../application/usecases/RunExperiment.js';
import { SystemClockAdapter } from '../infrastructure/clock/SystemClockAdapter.js';
import { GridWorld } from '../infrastructure/env/GridWorld.js';
import { NdjsonLoggerAdapter } from '../infrastructure/log/NdjsonLoggerAdapter.js';
import { LmStudioPolicyAdapter } from '../infrastructure/policy/LmStudioPolicyAdapter.js';
import { BufferedRngAdapter } from '../infrastructure/rng/BufferedRngAdapter.js';
import { CryptoRngAdapter } from '../infrastructure/rng/CryptoRngAdapter.js';
import { FileRngAdapter } from '../infrastructure/rng/FileRngAdapter.js';
import { QrngUsbAdapterStub } from '../infrastructure/rng/QrngUsbAdapter.stub.js';
import type { RngPort } from '../application/ports/RngPort.js';

export const buildContainer = (config: RunConfig) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outRoot = join(config.logging.outDir, stamp);
  mkdirSync(outRoot, { recursive: true });

  let baseRng: RngPort;
  if (config.rng.driver === 'crypto') baseRng = new CryptoRngAdapter();
  else if (config.rng.driver === 'file') baseRng = FileRngAdapter.fromPath(config.rng.filePath ?? 'rng.bin');
  else baseRng = new QrngUsbAdapterStub();

  const rng = config.rng.bufferBytes ? new BufferedRngAdapter(baseRng, Math.floor(config.rng.bufferBytes / 4)) : baseRng;

  const runExperiment = new RunExperiment(config, (_outDir) => {
    return new RunSingle({
      config,
      rng,
      policy: new LmStudioPolicyAdapter({
        baseUrl: config.policy.baseUrl,
        model: config.policy.model,
        rng,
        clock: new SystemClockAdapter()
      }),
      logger: new NdjsonLoggerAdapter(join(outRoot, 'run.ndjson'), join(outRoot, 'run.summary.json')),
      envFactory: (seed) => new GridWorld(config.env.size, seed, config.shock),
      memoryService: new MemoryService(rng),
      promptService: new PromptService(),
      metricsService: new MetricsService()
    });
  });

  const writeExperimentSummary = (summaries: unknown) => {
    writeFileSync(join(outRoot, 'experiment.summary.json'), `${JSON.stringify(summaries, null, 2)}\n`, 'utf8');
  };

  return { runExperiment, outRoot, writeExperimentSummary };
};
