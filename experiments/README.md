# Experiments

## List available experiments

```bash
node dist/cli/main.js experiments:list
```

This discovers every `*.json` file under `experiments/` and prints names in `<folder>/<file>` form.

## Run an experiment by name

```bash
node dist/cli/main.js experiments:run --name sanity/env-determinism
```

The experiment name maps directly to `experiments/<name>.json`.

## Output layout

Running by experiment name writes to:

```text
out/<timestamp>/<experimentName>/
```

Example:

```text
out/2026-01-01T00-00-00-000Z/sanity/env-determinism/
```

Each output folder includes `config.resolved.json`, run logs, and summaries.

## Recommended workflow

1. Run `sanity/env-determinism` first to check deterministic plumbing.
2. Run `sanity/llm-plumbing` to verify LM Studio integration.
3. Move on to `poc/poc-memory-epsilon` for exploratory experiments.
