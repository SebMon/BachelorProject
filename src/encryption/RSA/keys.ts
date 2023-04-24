import { base64ToBytes, bytesToBase64, textToBytes } from '../encodeDecode';

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

  const e = new Uint8Array(str2ab(window.atob(keyJWK.e)));
  const n = new Uint8Array(str2ab(window.atob(keyJWK.n.replaceAll('-', '+').replaceAll('_', '/'))));

  return { n, e };
}

/**
 * Converts a public key to string repressentation - to be stored in e.g. a public.pem file
 * @param key the key
 * @returns string repressentation of the key in pem pkcs8 format
 */
/* export function PublicKeyToPem(key: RSAPublicKey): string {
  const publicKey = createPublicKey({
    format: 'jwk',
    key: { kty: 'RSA', n: bytesToBase64(key.n), e: bytesToBase64(key.e) }
  });

  return publicKey.export({ type: 'spki', format: 'pem' }).toString();
} */


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

  const n = new Uint8Array(str2ab(window.atob(keyJWK.n.replaceAll('-', '+').replaceAll('_', '/'))));
  const e = new Uint8Array(str2ab(window.atob(keyJWK.e.replaceAll('-', '+').replaceAll('_', '/'))));
  const d = new Uint8Array(str2ab(window.atob(keyJWK.d.replaceAll('-', '+').replaceAll('_', '/'))));
  const p = new Uint8Array(str2ab(window.atob(keyJWK.p.replaceAll('-', '+').replaceAll('_', '/'))));
  const q = new Uint8Array(str2ab(window.atob(keyJWK.q.replaceAll('-', '+').replaceAll('_', '/'))));
  const dp = new Uint8Array(str2ab(window.atob(keyJWK.dp.replaceAll('-', '+').replaceAll('_', '/'))));
  const dq = new Uint8Array(str2ab(window.atob(keyJWK.dq.replaceAll('-', '+').replaceAll('_', '/'))));
  const qi = new Uint8Array(str2ab(window.atob(keyJWK.qi.replaceAll('-', '+').replaceAll('_', '/'))));

  return { n, d, e, p, q, dp, dq, qi };
}

/**
 * Converts a private key to string repressentation - to be stored in e.g. a private.pem file
 * @param key the key
 * @returns string repressentation of the key in pem pkcs8 format
 */
/* export function PrivateKeyToPem(key: RSAPrivateKey): string {
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
} */

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
