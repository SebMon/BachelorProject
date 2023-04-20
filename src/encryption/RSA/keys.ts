import { createPrivateKey, createPublicKey } from 'crypto';
import { base64ToBytes, bytesToBase64 } from '../encodeDecode';

export interface RSAPublicKey {
  n: Uint8Array;
  e: Uint8Array;
}

export interface RSAPrivateKey {
  n: Uint8Array;
  d: Uint8Array;
  e: Uint8Array;
  p: Uint8Array;
  q: Uint8Array;
  dp: Uint8Array;
  dq: Uint8Array;
  qi: Uint8Array;
}

export type RSAKey = RSAPrivateKey | RSAPublicKey;

export interface RSAModuloExponentSet {
  modulo: Uint8Array;
  exponent: Uint8Array;
}

/**
 * Converts a string repressentation of an RSA public key - e.g. from a public.pem file
 * @param pem pem pkcs8 formatted public key
 * @returns key in the format used by the RSA algorithm
 */
export function PublicKeyFromPem(pem: string): RSAPublicKey {
  const publicKey = createPublicKey(pem);

  const keyJWK = publicKey.export({ format: 'jwk' });

  if (keyJWK.n === undefined || keyJWK.e === undefined) {
    throw Error('error');
  }

  const n = base64ToBytes(keyJWK.n);
  const e = base64ToBytes(keyJWK.e);

  return { n, e };
}

/**
 * Converts a public key to string repressentation - to be stored in e.g. a public.pem file
 * @param key the key
 * @returns string repressentation of the key in pem pkcs8 format
 */
export function PublicKeyToPem(key: RSAPublicKey): string {
  const publicKey = createPublicKey({
    format: 'jwk',
    key: { kty: 'RSA', n: bytesToBase64(key.n), e: bytesToBase64(key.e) }
  });

  return publicKey.export({ type: 'spki', format: 'pem' }).toString();
}

/**
 * Converts a string repressentation of an RSA private key - e.g. from a private.pem file
 * @param pem pem pkcs8 formatted private key
 * @returns key in the format used by the RSA algorithm
 */
export function PrivateKeyFromPem(pem: string): RSAPrivateKey {
  const privateKey = createPrivateKey(pem);

  const keyJWK = privateKey.export({ format: 'jwk' });

  if (
    keyJWK.n === undefined ||
    keyJWK.d === undefined ||
    keyJWK.e === undefined ||
    keyJWK.p === undefined ||
    keyJWK.q === undefined ||
    keyJWK.dp === undefined ||
    keyJWK.dq === undefined ||
    keyJWK.qi === undefined
  ) {
    throw Error('error');
  }

  const n = base64ToBytes(keyJWK.n);
  const d = base64ToBytes(keyJWK.d);
  const e = base64ToBytes(keyJWK.e);
  const p = base64ToBytes(keyJWK.p);
  const q = base64ToBytes(keyJWK.q);
  const dp = base64ToBytes(keyJWK.dp);
  const dq = base64ToBytes(keyJWK.dq);
  const qi = base64ToBytes(keyJWK.qi);

  return { n, d, e, p, q, dp, dq, qi };
}

/**
 * Converts a private key to string repressentation - to be stored in e.g. a private.pem file
 * @param key the key
 * @returns string repressentation of the key in pem pkcs8 format
 */
export function PrivateKeyToPem(key: RSAPrivateKey): string {
  const privateKey = createPrivateKey({
    format: 'jwk',
    key: {
      kty: 'RSA',
      n: bytesToBase64(key.n),
      d: bytesToBase64(key.d),
      e: bytesToBase64(key.e),
      p: bytesToBase64(key.p),
      q: bytesToBase64(key.q),
      dp: bytesToBase64(key.dp),
      dq: bytesToBase64(key.dq),
      qi: bytesToBase64(key.qi)
    }
  });

  return privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
}
