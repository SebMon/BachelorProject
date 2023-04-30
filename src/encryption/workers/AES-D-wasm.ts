import init, { aes_decrypt } from 'src-wasm';
import type { AESRequest } from './types';

self.onmessage = async (message): Promise<void> => {
  const req = message.data as AESRequest;
  await init();
  const bytes = aes_decrypt(req.bytes, req.AESKey);
  self.postMessage(bytes);
};
