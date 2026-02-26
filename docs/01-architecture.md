# Architecture

Hexagonal structure:
- `domain/`: types and invariants
- `application/`: ports, services, and use cases
- `infrastructure/`: adapters (RNG/policy/logger/env/clock)
- `composition/`: config parsing and DI wiring
- `cli/`: command entrypoint

Core rule: application/domain do not import infrastructure.
