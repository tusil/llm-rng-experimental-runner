import { z } from 'zod';

export const configSchema = z.object({
  runs: z.number().int().positive(),
  stepsPerRun: z.number().int().positive(),
  env: z.object({
    size: z.number().int().positive(),
    envSeed: z.number().int().nonnegative()
  }),
  shock: z.object({
    atStep: z.number().int().nonnegative(),
    type: z.enum(['invertRewards', 'newMap'])
  }),
  agent: z.object({
    epsilon: z.number().min(0).max(1),
    memory: z.object({
      kRecent: z.number().int().nonnegative(),
      explorationProb: z.number().min(0).max(1)
    })
  }),
  rng: z.object({
    driver: z.enum(['crypto', 'file', 'qrng-usb']),
    bufferBytes: z.number().int().positive().optional(),
    filePath: z.string().optional()
  }),
  policy: z.union([
    z.object({
      driver: z.literal('lmstudio'),
      baseUrl: z.string().url(),
      model: z.string().min(1),
      temperature: z.number(),
      maxOutputTokens: z.number().int().positive(),
      timeoutMs: z.number().int().positive()
    }),
    z.object({
      driver: z.literal('mock'),
      mode: z.enum(['cycle', 'fixed']),
      action: z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY']).optional(),
      sequence: z.array(z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY'])).min(1).optional()
    }).superRefine((policy, ctx) => {
      if (policy.mode === 'fixed' && !policy.action) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'policy.action is required when mode=fixed' });
      }
      if (policy.mode === 'cycle' && !policy.sequence) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'policy.sequence is required when mode=cycle' });
      }
    })
  ]),
  logging: z.object({
    outDir: z.string().min(1)
  })
});

export type ConfigSchema = z.infer<typeof configSchema>;
