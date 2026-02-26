export interface RunConfig {
  runs: number;
  stepsPerRun: number;
  env: {
    size: number;
    envSeed: number;
  };
  shock: {
    atStep: number;
    type: 'invertRewards' | 'newMap';
  };
  agent: {
    epsilon: number;
    memory: {
      kRecent: number;
      explorationProb: number;
    };
  };
  rng: {
    driver: 'crypto' | 'file' | 'qrng-usb';
    bufferBytes?: number;
    filePath?: string;
  };
  policy: {
    driver: 'lmstudio';
    baseUrl: string;
    model: string;
    temperature: number;
    maxOutputTokens: number;
    timeoutMs: number;
  };
  logging: {
    outDir: string;
  };
}
