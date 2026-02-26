# Overview

This project runs a minimal reproducible experiment comparing agent trajectories under different entropy sources in a deterministic GridWorld with an LLM policy.

## Quick start
- `npm install`
- `npm run build`
- `node dist/cli/main.js run --config ./config.example.json`
- `node dist/cli/main.js run --config ./config.example.json --dry-run`
- `node dist/cli/main.js results --file ./out/<run-stamp>/experiment.summary.json`
- `node dist/cli/main.js compare --files ./out/<run-a>/experiment.summary.json ./out/<run-b>/experiment.summary.json`

- `experiments:run` automatically prints the same human-readable summary as `results --file` right after the run completes.
