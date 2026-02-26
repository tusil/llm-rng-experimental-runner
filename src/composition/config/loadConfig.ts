import { readFileSync } from 'node:fs';
import { configSchema } from './schema.js';

export const loadConfig = (path: string) => {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return configSchema.parse(raw);
};
