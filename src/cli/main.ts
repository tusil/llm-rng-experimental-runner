#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadConfig } from '../composition/config/loadConfig.js';
import { buildContainer } from '../composition/buildContainer.js';
import type { RunSummary } from '../domain/experiment/RunSummary.js';

const args = process.argv.slice(2);

interface ExperimentSummary {
  runs: number;
  totalRewardMean: number;
  summaries: RunSummary[];
}

const formatMetric = (value: number | null | undefined, digits = 3): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return value.toFixed(digits);
};

const formatRunLine = (summary: RunSummary): string => {
  return [
    `run=${summary.runId}`,
    `reward=${formatMetric(summary.totalReward)}`,
    `pre=${formatMetric(summary.meanRewardPreShock)}`,
    `post=${formatMetric(summary.meanRewardPostShock)}`,
    `recovery=${summary.recoveryStepsTo90pct ?? 'n/a'}`,
    `div=${formatMetric(summary.meanDivergence)}`,
    `timeouts=${summary.errorCounts.timeouts}`,
    `invalid=${summary.errorCounts.invalidOutputs}`,
    `fallbacks=${summary.errorCounts.fallbacks}`
  ].join(' | ');
};

const loadExperimentSummary = (filePath: string): ExperimentSummary => {
  const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as ExperimentSummary;
  if (!Array.isArray(parsed?.summaries)) {
    throw new Error(`Invalid summary file: ${filePath}`);
  }
  return parsed;
};

const printSummary = (filePath: string): void => {
  const summary = loadExperimentSummary(filePath);
  console.log(`Experiment summary: ${filePath}`);
  console.log(`Runs: ${summary.runs}`);
  console.log(`Mean total reward: ${formatMetric(summary.totalRewardMean)}`);
  console.log('Per-run metrics:');
  for (const runSummary of summary.summaries) {
    console.log(`  - ${formatRunLine(runSummary)}`);
  }
};

const aggregate = (summary: ExperimentSummary) => {
  const count = Math.max(summary.summaries.length, 1);
  const totalRecovery = summary.summaries.reduce((acc, item) => acc + (item.recoveryStepsTo90pct ?? 0), 0);
  const recoveryCount = summary.summaries.filter((item) => item.recoveryStepsTo90pct !== null).length;
  const totalDivergence = summary.summaries.reduce((acc, item) => acc + item.meanDivergence, 0);
  const totalTimeouts = summary.summaries.reduce((acc, item) => acc + item.errorCounts.timeouts, 0);
  const totalInvalidOutputs = summary.summaries.reduce((acc, item) => acc + item.errorCounts.invalidOutputs, 0);
  const totalFallbacks = summary.summaries.reduce((acc, item) => acc + item.errorCounts.fallbacks, 0);

  return {
    runs: summary.summaries.length,
    meanTotalReward: summary.totalRewardMean,
    meanRecovery: recoveryCount > 0 ? totalRecovery / recoveryCount : null,
    meanDivergence: totalDivergence / count,
    totalTimeouts,
    totalInvalidOutputs,
    totalFallbacks
  };
};

const compareSummaries = (filePaths: string[]): void => {
  if (filePaths.length < 2) {
    throw new Error('compare requires two or more --files arguments');
  }

  console.log('Experiment comparison');
  for (const path of filePaths) {
    const summary = loadExperimentSummary(path);
    const stats = aggregate(summary);
    console.log(`- ${path}`);
    console.log(`    runs=${stats.runs}`);
    console.log(`    meanTotalReward=${formatMetric(stats.meanTotalReward)}`);
    console.log(`    meanRecovery=${stats.meanRecovery === null ? 'n/a' : formatMetric(stats.meanRecovery)}`);
    console.log(`    meanDivergence=${formatMetric(stats.meanDivergence)}`);
    console.log(
      `    errors(timeouts/invalid/fallbacks)=${stats.totalTimeouts}/${stats.totalInvalidOutputs}/${stats.totalFallbacks}`
    );
  }
};

const run = async () => {
  const cmd = args[0];
  if (!cmd) {
    throw new Error(
      'Usage: node dist/cli/main.js <run|results|compare>\n  run --config ./config.json [--dry-run]\n  results --file ./out/<stamp>/experiment.summary.json\n  compare --files ./out/a/experiment.summary.json ./out/b/experiment.summary.json [more files...]'
    );
  }

  if (cmd === 'results') {
    const fileIndex = args.indexOf('--file');
    if (fileIndex === -1 || !args[fileIndex + 1]) {
      throw new Error('results requires --file <experiment.summary.json>');
    }
    printSummary(args[fileIndex + 1]);
    return;
  }

  if (cmd === 'compare') {
    const filesIndex = args.indexOf('--files');
    const filePaths = filesIndex === -1 ? [] : args.slice(filesIndex + 1);
    compareSummaries(filePaths);
    return;
  }

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

  const summaryPath = `${container.outRoot}/experiment.summary.json`;
  console.log(`Experiment complete. Output written to ${container.outRoot}`);
  console.log('Use these commands to inspect and compare results:');
  console.log(`  node dist/cli/main.js results --file ${summaryPath}`);
  console.log(
    `  node dist/cli/main.js compare --files ${summaryPath} ./out/<other-run-stamp>/experiment.summary.json`
  );
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
