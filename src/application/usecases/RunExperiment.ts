import { buildRunId } from '../../domain/experiment/RunId.js';
import type { RunConfig } from '../../domain/experiment/RunConfig.js';
import type { RunSummary } from '../../domain/experiment/RunSummary.js';
import type { RunSingle } from './RunSingle.js';

export class RunExperiment {
  constructor(private readonly config: RunConfig, private readonly runSingleFactory: (outDir: string) => RunSingle) {}

  async execute(baseOutDir: string): Promise<RunSummary[]> {
    const results: RunSummary[] = [];
    for (let i = 0; i < this.config.runs; i += 1) {
      const runId = buildRunId(i);
      const runSingle = this.runSingleFactory(baseOutDir);
      const summary = await runSingle.execute(runId, i);
      results.push(summary);
    }
    return results;
  }
}
