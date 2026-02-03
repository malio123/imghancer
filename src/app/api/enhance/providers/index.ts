import type { CreateJobInput, CreateJobResult } from './types';
import { createLocalJob } from './local';
import { createReplicateJob } from './replicate';

function getProviderName() {
  return (process.env.ENHANCE_PROVIDER || 'local').toLowerCase();
}

export async function createEnhanceJob(
  input: CreateJobInput
): Promise<CreateJobResult> {
  const provider = getProviderName();

  if (provider === 'local') {
    return createLocalJob(input);
  }
  if (provider === 'replicate') {
    return createReplicateJob(input);
  }

  throw new Error(`Unknown enhance provider: ${provider}`);
}
