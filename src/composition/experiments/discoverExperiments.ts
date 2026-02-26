import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const walkJsonFiles = (dirPath: string): string[] => {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
};

export const discoverExperiments = (experimentsRoot: string): string[] => {
  return walkJsonFiles(experimentsRoot)
    .map((filePath) => relative(experimentsRoot, filePath).replace(/\\/g, '/').replace(/\.json$/, ''))
    .sort((a, b) => a.localeCompare(b));
};

export const experimentNameToPath = (experimentsRoot: string, experimentName: string): string => {
  return join(experimentsRoot, `${experimentName}.json`);
};
