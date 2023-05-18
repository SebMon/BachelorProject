import * as AES from '../AES';
import type { AESRequest } from './types';

self.onmessage = (message): void => {
  const req = message.data as AESRequest;
  const bytes = AES.decrypt(req.bytes, req.aesKey);
  self.postMessage(bytes);
};
