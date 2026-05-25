// Simulated network latency so loading states are exercised during development.
export const MOCK_LATENCY_MS = 3000;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
