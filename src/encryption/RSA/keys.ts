import { KeyType } from '../Types';
import { bytesToBase64 } from '../encodeDecode';

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

export interface RSAKeySet {
  privateKey: RSAPrivateKey;
  publicKey: RSAPublicKey;
}

/**
 * Converts a string repressentation of an RSA public key - e.g. from a public.pem file
 * @param pem pem pkcs8 formatted public key
 * @returns key in the format used by the RSA algorithm
 */

export async function PublicKeyFromPem(pem: string): Promise<RSAPublicKey> {
  const lines = pem.split('\n');
  const base64 = lines.slice(1, lines.length - 1).join('');

  const publicKey = await crypto.subtle.importKey(
    'spki',
    str2ab(window.atob(base64)),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-1' }
    },
    true,
    []
  );

  const keyJWK = await crypto.subtle.exportKey('jwk', publicKey);

  if (keyJWK.n === undefined || keyJWK.e === undefined) {
    throw Error("n or e wasn't defined");
  }

  const e = base64ToUInt8Array(keyJWK.e);
  const n = base64ToUInt8Array(keyJWK.n);

  return { n, e };
}

/**
 * Converts a string repressentation of an RSA private key - e.g. from a private.pem file
 * @param pem pem pkcs8 formatted private key
 * @returns key in the format used by the RSA algorithm
 */
export async function PrivateKeyFromPem(pem: string): Promise<RSAPrivateKey> {
  const lines = pem.split('\n');
  const base64 = lines.slice(1, lines.length - 1).join('');

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(window.atob(base64)),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-1' }
    },
    true,
    ['decrypt']
  );

  const keyJWK = await crypto.subtle.exportKey('jwk', privateKey);

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

  const n = base64ToUInt8Array(keyJWK.n);
  const e = base64ToUInt8Array(keyJWK.e);
  const d = base64ToUInt8Array(keyJWK.d);
  const p = base64ToUInt8Array(keyJWK.p);
  const q = base64ToUInt8Array(keyJWK.q);
  const dp = base64ToUInt8Array(keyJWK.dp);
  const dq = base64ToUInt8Array(keyJWK.dq);
  const qi = base64ToUInt8Array(keyJWK.qi);

  return { n, d, e, p, q, dp, dq, qi };
}

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function base64ToUInt8Array(str: string): Uint8Array {
  return new Uint8Array(str2ab(window.atob(str.replaceAll('-', '+').replaceAll('_', '/'))));
}

export async function PublicKeyToPEM(key: RSAPublicKey): Promise<string> {
  const convertedKey = await window.crypto.subtle.importKey(
    'jwk',
    {
      kty: 'RSA',
      e: b64tob64u(bytesToBase64(key.e)),
      n: b64tob64u(bytesToBase64(key.n)),
      alg: 'RSA-OAEP-256',
      ext: true
    },
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['encrypt']
  );
  const keySpki = await window.crypto.subtle.exportKey('spki', convertedKey);
  return bytesToPEM(keySpki, KeyType.AsymmetricPublic);
}

export async function PrivateKeyToPEM(key: RSAPrivateKey): Promise<string> {
  const convertedKey = await window.crypto.subtle.importKey(
    'jwk',
    {
      kty: 'RSA',
      e: b64tob64u(bytesToBase64(key.e)),
      n: b64tob64u(bytesToBase64(key.n)),
      d: b64tob64u(bytesToBase64(key.d)),
      p: b64tob64u(bytesToBase64(key.p)),
      q: b64tob64u(bytesToBase64(key.q)),
      dp: b64tob64u(bytesToBase64(key.dp)),
      dq: b64tob64u(bytesToBase64(key.dq)),
      qi: b64tob64u(bytesToBase64(key.qi)),
      alg: 'RSA-OAEP-256',
      ext: true
    },
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['decrypt']
  );
  const keyPKCS8 = await window.crypto.subtle.exportKey('pkcs8', convertedKey);
  return bytesToPEM(keyPKCS8, KeyType.AsymmetricPrivate);
}

function b64tob64u(a: string): string {
  // eslint-disable-next-line no-useless-escape
  a = a.replace(/\=/g, '');
  a = a.replace(/\+/g, '-');
  a = a.replace(/\//g, '_');
  return a;
}

function bytesToPEM(keydata: ArrayBuffer, keyType: KeyType): string {
  const keydataS = arrayBufferToString(keydata);
  const keydataB64 = window.btoa(keydataS);
  const keydataB64Pem = formatAsPem(keydataB64, keyType);
  return keydataB64Pem;
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

function formatAsPem(str: string, keyType: KeyType): string {
  let finalString = `-----BEGIN ${keyType === KeyType.AsymmetricPrivate ? 'PRIVATE' : 'PUBLIC'} KEY-----\n`;

  while (str.length > 0) {
    finalString += str.substring(0, 64) + '\n';
    str = str.substring(64);
  }

  finalString = finalString + `-----END ${keyType === KeyType.AsymmetricPrivate ? 'PRIVATE' : 'PUBLIC'} KEY-----`;

  return finalString;
}
