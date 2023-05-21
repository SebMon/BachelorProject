import type { AESKey } from './AES';
import type { RSAKeySet, RSAPrivateKey, RSAPublicKey } from './RSA/keys';
import { base64ToUInt8Array } from './RSA/keys';
import { textToBytes } from './encodeDecode';

export const generateAESKey = async (): Promise<Uint8Array> => {
  const key: CryptoKey = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
  const keyRaw: ArrayBuffer = await window.crypto.subtle.exportKey('raw', key);

  return new Uint8Array(keyRaw);
};

export const generateRSAKeySet = async (): Promise<RSAKeySet> => {
  const keyPair: CryptoKeyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
  const publicKeyRaw = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const publicKey: RSAPublicKey = {
    n: base64ToUInt8Array(publicKeyRaw.n!),
    e: base64ToUInt8Array(publicKeyRaw.e!)
  };
  const privateKeyRaw = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const privateKey: RSAPrivateKey = {
    n: base64ToUInt8Array(privateKeyRaw.n!),
    e: base64ToUInt8Array(privateKeyRaw.e!),
    d: base64ToUInt8Array(privateKeyRaw.d!),
    p: base64ToUInt8Array(privateKeyRaw.p!),
    q: base64ToUInt8Array(privateKeyRaw.q!),
    dp: base64ToUInt8Array(privateKeyRaw.dp!),
    dq: base64ToUInt8Array(privateKeyRaw.dq!),
    qi: base64ToUInt8Array(privateKeyRaw.qi!)
  };

  return { privateKey, publicKey };
};

export const getAESKeyFromPassword = async (password: string): Promise<AESKey> => {
  const buffer = await crypto.subtle.digest('SHA-256', textToBytes(password));
  const bytes = new Uint8Array(buffer);
  return { aesKey: bytes };
};
