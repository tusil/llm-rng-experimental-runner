# LM Studio Policy Adapter

Uses OpenAI-compatible API:
- `POST {baseUrl}/chat/completions`

Prompt requires exact output token from action set. Invalid/timeout/http errors fall back to RNG action and are logged.
