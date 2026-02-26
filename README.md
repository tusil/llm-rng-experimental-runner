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

### Dry run
```bash
node dist/cli/main.js run --config ./config.example.json --dry-run
```

## Useful commands
```bash
npm run dev
npm run lint
npm test
```
