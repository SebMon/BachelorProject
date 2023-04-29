import * as RSA from '../RSA';
import type { RSAKey } from '../RSA/keys';

interface Request {
  bytes: Uint8Array;
  rsakey: RSAKey;
}

self.onmessage = async (message): Promise<void> => {
  const req = message.data as Request;
  const bytes = await RSA.decrypt(req.bytes, req.rsakey);
  self.postMessage(bytes);
};
