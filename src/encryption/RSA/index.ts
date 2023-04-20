import { hexToBytes } from '../encodeDecode';
import { createHash } from 'crypto';
import type { RSAKey, RSAModuloExponentSet } from './keys';

export function encrypt(input: Uint8Array, key: RSAKey): Uint8Array {
  let moduloExponentSet: RSAModuloExponentSet;

  // the attribute 'd' is on private but not public keys. So based on this attribute, typescript will infer which of the two types 'key' is
  if ('d' in key) {
    moduloExponentSet = { modulo: key.n, exponent: key.d };
  } else {
    moduloExponentSet = { modulo: key.n, exponent: key.e };
  }

  const keyLength = key.n.length;

  const blockLength = keyLength - 2 * hLen - 2;

  const blocks = Math.ceil(input.length / blockLength);

  const output = new Uint8Array(keyLength * blocks);

  for (let i = 0; i < blocks; i++) {
    output.set(
      RSAES_OAEP_ENCRYPT(moduloExponentSet, input.slice(i * blockLength, (i + 1) * blockLength)),
      i * keyLength
    );
  }

  return output;
}

export function decrypt(input: Uint8Array, key: RSAKey): Uint8Array {
  let moduloExponentSet: RSAModuloExponentSet;

  // the attribute 'd' is on private but not public keys. So based on this attribute, typescript will infer which of the two types 'key' is
  if ('d' in key) {
    moduloExponentSet = { modulo: key.n, exponent: key.d };
  } else {
    moduloExponentSet = { modulo: key.n, exponent: key.e };
  }

  const keyLength = key.n.length;

  const blockLength = keyLength - 2 * hLen - 2;

  const blocks = Math.ceil(input.length / keyLength);

  const output = new Uint8Array(blockLength * blocks);

  for (let i = 0; i < blocks - 1; i++) {
    output.set(RSAES_OAEP_DECRYPT(moduloExponentSet, input.slice(i * keyLength, (i + 1) * keyLength)), i * blockLength);
  }

  // The last block is handles seperately, as we need to know its length in order to give the output the right length
  const lastBlock = RSAES_OAEP_DECRYPT(moduloExponentSet, input.slice((blocks - 1) * keyLength, blocks * keyLength));
  output.set(lastBlock, (blocks - 1) * blockLength);

  return output.slice(0, output.length - (blockLength - lastBlock.length));
}

const hLen = 20;
const lHash = hexToBytes('da39a3ee5e6b4b0d3255bfef95601890afd80709');

function RSAES_OAEP_ENCRYPT(key: RSAModuloExponentSet, M: Uint8Array): Uint8Array {
  const k = key.modulo.length;
  if (M.length > k - 2 * hLen - 2) {
    throw new Error('message too long');
  }

  const PS = new Uint8Array(k - M.length - 2 * hLen - 2); // length=k-mLen-2hLen-2
  const DB = new Uint8Array(k - hLen - 1);
  DB.set(lHash);
  DB.set(PS, lHash.length);
  DB.set([1], lHash.length + PS.length);
  DB.set(M, lHash.length + PS.length + 1);

  const seed = crypto.getRandomValues(new Uint8Array(hLen));
  const dbMask = MGF(seed, k - hLen - 1);
  const maskedDB = xor(DB, dbMask);
  const seedMask = MGF(maskedDB, hLen);
  const maskedSeed = xor(seed, seedMask);

  const EM = new Uint8Array(k);
  EM.set([0]);
  EM.set(maskedSeed, 1);
  EM.set(maskedDB, 1 + maskedSeed.length);

  const m = OS2IP(EM);

  const c = RSAEP(key, m);

  const C = I2OSP(c, k);

  return C;
}

function RSAES_OAEP_DECRYPT(key: RSAModuloExponentSet, C: Uint8Array): Uint8Array {
  const k = key.modulo.length;

  if (C.length !== k) {
    throw Error('decryption error');
  }

  if (k < 2 * hLen + 2) {
    throw Error('decryption error');
  }

  const c = OS2IP(C);

  const m = RSADP(key, c);

  const EM = I2OSP(m, k);

  const maskedSeed = EM.slice(1, 1 + hLen);
  const maskedDB = EM.slice(1 + hLen, EM.length);

  const seedMask = MGF(maskedDB, hLen);

  const seed = xor(maskedSeed, seedMask);

  const dbMask = MGF(seed, k - hLen - 1);

  const db = xor(maskedDB, dbMask);

  for (let i = 0; i < hLen; i++) {
    if (db[i] !== lHash[i]) {
      throw Error('Decryption error');
    }
  }

  let i = hLen;
  try {
    while (db[i] !== 0x01) {
      i++;
    }
    i++;
  } catch {
    throw Error('Decryption error');
  }

  return db.slice(i, db.length);
}

// RSA Encryption Primitive
function RSAEP(key: RSAModuloExponentSet, m: bigint): bigint {
  if (!(m >= 0 && m <= OS2IP(key.modulo) - BigInt(1))) {
    throw new Error('message repressentative out of range');
  }
  const c = modExp(m, OS2IP(key.exponent), OS2IP(key.modulo));
  return c;
}

/// RSA Decryption Primitive
function RSADP(key: RSAModuloExponentSet, c: bigint): bigint {
  if (!(c >= 0 && c <= OS2IP(key.modulo) - BigInt(1))) {
    throw new Error('ciphertext repressentative out of range');
  }
  const m = modExp(c, OS2IP(key.exponent), OS2IP(key.modulo));
  return m;
}

// Mask generation function
function MGF(mgfSeed: Uint8Array, maskLen: number): Uint8Array {
  if (maskLen > 2 ** 32 * hLen) {
    throw new Error('Mask too long');
  }

  const T = new Uint8Array(maskLen + (maskLen - (maskLen % hLen)));
  for (let i = 0; i < maskLen / hLen; i++) {
    const C = I2OSP(BigInt(i), 4);
    const concated = new Uint8Array(mgfSeed.length + 4);
    concated.set(mgfSeed);
    concated.set(C, mgfSeed.length);
    const hash = hexToBytes(createHash('sha1').update(concated).digest('hex'));
    T.set(hash, i * hLen);
  }
  return T.slice(0, maskLen);
}

// Octet string (byte array) to Integer
function OS2IP(input: Uint8Array): bigint {
  const len = input.length;
  let x = BigInt(0);
  for (let i = 1; i <= len; i++) {
    x += BigInt(input[len - i]) * BigInt(256) ** BigInt(i - 1);
  }
  return x;
}

// Integer to Octet string (byte array)
function I2OSP(input: bigint, xLen: number): Uint8Array {
  if (input > BigInt(256) ** BigInt(xLen)) {
    throw new Error('integer too large');
  }
  const out = new Uint8Array(xLen);
  for (let i = 1; i <= xLen; i++) {
    out[xLen - i] = Number((input % BigInt(256) ** BigInt(i)) / BigInt(256) ** BigInt(i - 1));
  }
  return out;
}

function xor(x: Uint8Array, y: Uint8Array): Uint8Array {
  const result = new Uint8Array(x.length);
  for (let i = 0; i < x.length; i++) {
    result[i] = x[i] ^ y[i];
  }
  return result;
}

function modExp(base: bigint, exponent: bigint, modulo: bigint): bigint {
  let result = BigInt(1);
  base = base % modulo;
  while (exponent > 0) {
    if (exponent % BigInt(2) === BigInt(1)) {
      result = (result * base) % modulo;
    }
    exponent = exponent / BigInt(2);
    base = (base * base) % modulo;
  }
  return result;
}
