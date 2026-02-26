# Config

Configuration is validated with Zod in `src/composition/config/schema.ts` and loaded from JSON.

## Run with direct config path

```bash
node dist/cli/main.js run --config ./config.example.json
```

## Discover experiments

Experiment configs are discovered from all `*.json` files under `experiments/`.

```bash
node dist/cli/main.js experiments:list
```

Names are derived from paths relative to `experiments/` without `.json`.

## Run by experiment name

```bash
node dist/cli/main.js experiments:run --name sanity/env-determinism
```

The CLI resolves this to `experiments/sanity/env-determinism.json`, validates it with Zod, and writes output to:

```text
out/<timestamp>/sanity/env-determinism/
```

## Reproducibility

Each run writes `config.resolved.json` into the output directory. This file is the validated configuration used to execute the run.

## Policy drivers

- `policy.driver = "lmstudio"`: existing LM Studio adapter.
- `policy.driver = "mock"`: deterministic adapter for sanity checks.
  - `mode = "fixed"` requires `action`.
  - `mode = "cycle"` requires `sequence`.
