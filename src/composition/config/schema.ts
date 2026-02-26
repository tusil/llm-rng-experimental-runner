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
  policy: z.object({
    driver: z.literal('lmstudio'),
    baseUrl: z.string().url(),
    model: z.string().min(1),
    temperature: z.number(),
    maxOutputTokens: z.number().int().positive(),
    timeoutMs: z.number().int().positive()
  }),
  logging: z.object({
    outDir: z.string().min(1)
  })
});

export type ConfigSchema = z.infer<typeof configSchema>;
