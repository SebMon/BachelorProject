import init, { aes_encrypt } from 'src-wasm';
import type { AESRequest } from './types';

self.onmessage = async (message): Promise<void> => {
  const req = message.data as AESRequest;
  await init();
  const bytes = aes_encrypt(req.bytes, req.AESKey);
  self.postMessage(bytes);
};
