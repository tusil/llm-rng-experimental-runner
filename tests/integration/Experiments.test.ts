import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { discoverExperiments } from '../../src/composition/experiments/discoverExperiments.js';
import { configSchema } from '../../src/composition/config/schema.js';
import { buildContainer } from '../../src/composition/buildContainer.js';

const tempDirs: string[] = [];

const makeTempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'runner-test-'));
  tempDirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('experiments integration', () => {
  it('discovers experiment configs under experiments/', () => {
    const names = discoverExperiments(join(process.cwd(), 'experiments'));
    expect(names).toContain('sanity/env-determinism');
    expect(names).toContain('sanity/llm-plumbing');
    expect(names).toContain('poc/poc-memory-epsilon');
  });

  it('runs sanity/env-determinism deterministically with mock policy', async () => {
    const outDir = makeTempDir();
    const raw = JSON.parse(readFileSync(join(process.cwd(), 'experiments/sanity/env-determinism.json'), 'utf8')) as {
      logging: { outDir: string };
    };
    raw.logging.outDir = outDir;

    const config = configSchema.parse(raw);
    const container = buildContainer(config, { experimentName: 'sanity/env-determinism' });
    const summaries = await container.runExperiment.execute(container.outRoot);

    expect(summaries).toHaveLength(2);
    expect(summaries[0]?.totalReward).toBe(summaries[1]?.totalReward);

    const run1Lines = readFileSync(join(container.outRoot, 'runs/run-0000/run.ndjson'), 'utf8').trim().split('\n');
    const run2Lines = readFileSync(join(container.outRoot, 'runs/run-0001/run.ndjson'), 'utf8').trim().split('\n');

    expect(run1Lines).toHaveLength(config.stepsPerRun);
    expect(run2Lines).toHaveLength(config.stepsPerRun);
  });
});
