# Logging and Metrics

- Step events are written as NDJSON
- Per-run summary JSON and experiment summary JSON are generated
- Metrics include moving average reward, recovery time, and JS-divergence action drift
- Console progress lines are emitted during each run (periodic step, percent complete, cumulative reward)
