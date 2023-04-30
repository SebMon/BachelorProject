import init, { rsa_decrypt } from 'src-wasm';
import type { RSARequest } from './types';

self.onmessage = async (message): Promise<void> => {
  const req = message.data as RSARequest;
  await init();
  const bytes = rsa_decrypt(req.bytes, req.rsakey.n, req.rsakey.e);
  self.postMessage(bytes);
};
