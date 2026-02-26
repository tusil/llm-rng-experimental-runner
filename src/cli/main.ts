#!/usr/bin/env node
import { loadConfig } from '../composition/config/loadConfig.js';
import { buildContainer } from '../composition/buildContainer.js';

const args = process.argv.slice(2);

const run = async () => {
  const cmd = args[0];
  if (cmd !== 'run') {
    throw new Error('Usage: node dist/cli/main.js run --config ./config.json [--dry-run]');
  }
  const configIndex = args.indexOf('--config');
  if (configIndex === -1 || !args[configIndex + 1]) {
    throw new Error('--config is required');
  }
  const dryRun = args.includes('--dry-run');
  const configPath = args[configIndex + 1];
  const config = loadConfig(configPath);

  if (dryRun) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const container = buildContainer(config);
  const summaries = await container.runExperiment.execute(container.outRoot);
  container.writeExperimentSummary({
    runs: summaries.length,
    totalRewardMean: summaries.reduce((a, b) => a + b.totalReward, 0) / Math.max(1, summaries.length),
    summaries
  });
  console.log(`Experiment complete. Output written to ${container.outRoot}`);
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
