import { addRoundKey, gmul2, gmul3, keyExpansion, subBytes } from './utils';

export function AESEncrypt(input: Uint8Array, key: Uint8Array): Uint8Array {
  const data = padData(input);
  const length = data.length;
  const blocks = length / 16;

  const rounds = 14;
  const wordsInKey = 8;

  const decoded = new Uint8Array(length);
  const expandedKey = keyExpansion(key, rounds, wordsInKey);

  for (let i = 0; i < blocks; i++) {
    decoded.set(cipher(data.slice(16 * i, 16 * (i + 1)), expandedKey, rounds), 16 * i);
  }

  return decoded;
}

function padData(input: Uint8Array): Uint8Array {
  const padLength = 16 - (input.length % 16);
  const output = new Uint8Array(input.length + padLength);
  output.set(input);
  output.fill(padLength, input.length);
  return output;
}

function cipher(state: Uint8Array, roundKeys: Uint8Array[], rounds: number): Uint8Array {
  state = addRoundKey(state, roundKeys.slice(0, 4));
  for (let round = 1; round < rounds; round++) {
    state = subBytes(state);
    state = shiftRows(state);
    state = mixColumns(state);
    state = addRoundKey(state, roundKeys.slice(4 * round, 4 * (round + 1)));
  }
  state = subBytes(state);
  state = shiftRows(state);
  state = addRoundKey(state, roundKeys.slice(4 * rounds, 4 * (rounds + 1)));
  return state;
}

function shiftRows(input: Uint8Array): Uint8Array {
  return new Uint8Array([
    input[0],
    input[5],
    input[10],
    input[15],
    input[4],
    input[9],
    input[14],
    input[3],
    input[8],
    input[13],
    input[2],
    input[7],
    input[12],
    input[1],
    input[6],
    input[11]
  ]);
}

function mixColumns(s: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  out[0] = gmul2(s[0]) ^ gmul3(s[1]) ^ s[2] ^ s[3];
  out[1] = s[0] ^ gmul2(s[1]) ^ gmul3(s[2]) ^ s[3];
  out[2] = s[0] ^ s[1] ^ gmul2(s[2]) ^ gmul3(s[3]);
  out[3] = gmul3(s[0]) ^ s[1] ^ s[2] ^ gmul2(s[3]);

  out[4] = gmul2(s[4]) ^ gmul3(s[5]) ^ s[6] ^ s[7];
  out[5] = s[4] ^ gmul2(s[5]) ^ gmul3(s[6]) ^ s[7];
  out[6] = s[4] ^ s[5] ^ gmul2(s[6]) ^ gmul3(s[7]);
  out[7] = gmul3(s[4]) ^ s[5] ^ s[6] ^ gmul2(s[7]);

  out[8] = gmul2(s[8]) ^ gmul3(s[9]) ^ s[10] ^ s[11];
  out[9] = s[8] ^ gmul2(s[9]) ^ gmul3(s[10]) ^ s[11];
  out[10] = s[8] ^ s[9] ^ gmul2(s[10]) ^ gmul3(s[11]);
  out[11] = gmul3(s[8]) ^ s[9] ^ s[10] ^ gmul2(s[11]);

  out[12] = gmul2(s[12]) ^ gmul3(s[13]) ^ s[14] ^ s[15];
  out[13] = s[12] ^ gmul2(s[13]) ^ gmul3(s[14]) ^ s[15];
  out[14] = s[12] ^ s[13] ^ gmul2(s[14]) ^ gmul3(s[15]);
  out[15] = gmul3(s[12]) ^ s[13] ^ s[14] ^ gmul2(s[15]);

  return out;
}
