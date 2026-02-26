import { mkdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LoggerPort, StepEvent } from '../../application/ports/LoggerPort.js';
import type { RunSummary } from '../../domain/experiment/RunSummary.js';

export class NdjsonLoggerAdapter implements LoggerPort {
  constructor(private readonly runPath: string, private readonly summaryPath: string) {
    mkdirSync(join(runPath, '..'), { recursive: true });
  }

  async logStep(stepEvent: StepEvent): Promise<void> {
    appendFileSync(this.runPath, `${JSON.stringify(stepEvent)}\n`, 'utf8');
  }

  async logRunSummary(runSummary: RunSummary): Promise<void> {
    writeFileSync(this.summaryPath, `${JSON.stringify(runSummary, null, 2)}\n`, 'utf8');
  }
}
