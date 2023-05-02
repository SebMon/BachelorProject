import init, { rsa_encrypt } from 'src-wasm';
import type { RSARequest } from './types';

self.onmessage = async (message): Promise<void> => {
  const req = message.data as RSARequest;
  await init();
  const bytes = rsa_encrypt(req.bytes, req.rsakey.n, 'd' in req.rsakey ? req.rsakey.d : req.rsakey.e);
  self.postMessage(bytes);
};
