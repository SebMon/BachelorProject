import * as RSA from '../RSA';
import { RSARequest } from './types';

self.onmessage = async (message): Promise<void> => {
  const req = message.data as RSARequest;
  const bytes = await RSA.encrypt(req.bytes, req.rsakey);
  self.postMessage(bytes);
};
