# llm-rng-experimental-runner

Minimal reproducible experiment for comparing agent trajectories under different entropy sources in a deterministic GridWorld with an LLM policy.

## Quick start

### Prerequisites
- Node.js >= 24
- npm

### Install
```bash
npm install
```

### Build
```bash
npm run build
```

### Run experiment
```bash
node dist/cli/main.js run --config ./config.example.json
```

### List experiment configs
```bash
node dist/cli/main.js experiments:list
```

### Run experiment from `experiments/` by name
```bash
node dist/cli/main.js experiments:run --name sanity/env-determinism
```

The runner prints periodic progress lines (about every 10% of configured steps) so you can monitor each run while it is executing.

After each run, the CLI prints copy/paste-ready commands for:
- viewing a human-readable summary of that run's experiment output
- comparing that output with one or more other experiment outputs

When you run `experiments:run`, the CLI now automatically prints the human-readable summary for that run immediately after completion.

### Print results (human-readable)
```bash
node dist/cli/main.js results --file ./out/<run-stamp>/experiment.summary.json
```

### Compare results (human-readable)
```bash
node dist/cli/main.js compare --files ./out/<run-a>/experiment.summary.json ./out/<run-b>/experiment.summary.json
```

You can compare more than two files by appending additional paths after `--files`.

### Dry run
```bash
node dist/cli/main.js run --config ./config.example.json --dry-run
```

When you run with `run` or `experiments:run`, the validated config is copied to `config.resolved.json` in the output folder for reproducibility.

## Useful commands
```bash
npm run dev
npm run lint
npm test
```
