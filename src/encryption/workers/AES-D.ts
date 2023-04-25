import * as AES from '../AES';

interface Request {
  bytes: Uint8Array;
  AESKey: Uint8Array;
}

self.onmessage = (message): void => {
  const req = message.data as Request;
  const bytes = AES.decrypt(req.bytes, req.AESKey);
  self.postMessage(bytes);
};
