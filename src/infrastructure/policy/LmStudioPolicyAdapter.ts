import type { ClockPort } from '../../application/ports/ClockPort.js';
import type { PolicyInput, PolicyPort, PolicyResult } from '../../application/ports/PolicyPort.js';
import type { RngPort } from '../../application/ports/RngPort.js';
import { ACTIONS } from '../../domain/env/Action.js';
import { parseAction } from './ActionParser.js';

interface LmStudioOptions {
  baseUrl: string;
  model: string;
  rng: RngPort;
  clock: ClockPort;
}

export class LmStudioPolicyAdapter implements PolicyPort {
  constructor(private readonly options: LmStudioOptions) {}

  async chooseAction(input: PolicyInput): Promise<PolicyResult> {
    const start = this.options.clock.nowMs();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

    try {
      const res = await fetch(`${this.options.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.options.model,
          temperature: input.temperature,
          max_tokens: input.maxOutputTokens,
          messages: [
            {
              role: 'system',
              content:
                'You are an action policy. Output exactly one of: UP, DOWN, LEFT, RIGHT, STAY. No other text.'
            },
            {
              role: 'user',
              content: `Observation:\n${input.observationText}\n\nMemory:\n${input.memoryText}\nChoose one action token.`
            }
          ]
        })
      });

      if (!res.ok) {
        return this.fallback(start, '', 'http_error');
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      const rawText = data.choices?.[0]?.message?.content ?? '';
      const parsed = parseAction(rawText);
      if (!parsed) {
        return this.fallback(start, rawText, 'invalid_output');
      }

      return {
        action: parsed,
        rawText,
        latencyMs: this.options.clock.nowMs() - start,
        tokensUsed: data.usage?.total_tokens,
        usedFallback: false
      };
    } catch {
      return this.fallback(start, '', 'timeout');
    } finally {
      clearTimeout(timeout);
    }
  }

  private fallback(start: number, rawText: string, reason: 'timeout' | 'invalid_output' | 'http_error'): PolicyResult {
    return {
      action: this.options.rng.pickOne(ACTIONS),
      rawText,
      latencyMs: this.options.clock.nowMs() - start,
      usedFallback: true,
      fallbackReason: reason
    };
  }
}
