import { addRoundKey, gmul9, gmulb, gmuld, gmule, invSubBytes, keyExpansion } from './utils';

export function AESDecrypt(input: Uint8Array, key: Uint8Array): Uint8Array {
  const length = input.length;
  const blocks = length / 16;

  const rounds = 14;
  const wordsInKey = 8;

  const decoded = new Uint8Array(length);
  const expandedKey = keyExpansion(key, rounds, wordsInKey);

  for (let i = 0; i < blocks; i++) {
    decoded.set(invCipher(input.slice(16 * i, 16 * (i + 1)), expandedKey, rounds), 16 * i);
  }

  return unpadData(decoded);
}

function unpadData(input: Uint8Array): Uint8Array {
  const inputLength = input.length;
  const paddingLength = input[inputLength - 1];
  return input.slice(0, inputLength - paddingLength);
}

function invCipher(state: Uint8Array, roundKeys: Uint8Array[], rounds: number): Uint8Array {
  state = addRoundKey(state, roundKeys.slice(4 * rounds, 4 * (rounds + 1)));

  for (let round = rounds - 1; round > 0; round--) {
    state = invShiftRows(state);
    state = invSubBytes(state);
    state = addRoundKey(state, roundKeys.slice(4 * round, 4 * (round + 1)));
    state = invMixColumns(state);
  }

  state = invShiftRows(state);
  state = invSubBytes(state);
  state = addRoundKey(state, roundKeys.slice(0, 4));

  return state;
}

function invShiftRows(input: Uint8Array): Uint8Array {
  return new Uint8Array([
    input[0],
    input[13],
    input[10],
    input[7],
    input[4],
    input[1],
    input[14],
    input[11],
    input[8],
    input[5],
    input[2],
    input[15],
    input[12],
    input[9],
    input[6],
    input[3]
  ]);
}

function invMixColumns(s: Uint8Array): Uint8Array {
  const out = new Uint8Array(16);
  out[0] = gmule(s[0]) ^ gmulb(s[1]) ^ gmuld(s[2]) ^ gmul9(s[3]);
  out[1] = gmul9(s[0]) ^ gmule(s[1]) ^ gmulb(s[2]) ^ gmuld(s[3]);
  out[2] = gmuld(s[0]) ^ gmul9(s[1]) ^ gmule(s[2]) ^ gmulb(s[3]);
  out[3] = gmulb(s[0]) ^ gmuld(s[1]) ^ gmul9(s[2]) ^ gmule(s[3]);

  out[4] = gmule(s[4]) ^ gmulb(s[5]) ^ gmuld(s[6]) ^ gmul9(s[7]);
  out[5] = gmul9(s[4]) ^ gmule(s[5]) ^ gmulb(s[6]) ^ gmuld(s[7]);
  out[6] = gmuld(s[4]) ^ gmul9(s[5]) ^ gmule(s[6]) ^ gmulb(s[7]);
  out[7] = gmulb(s[4]) ^ gmuld(s[5]) ^ gmul9(s[6]) ^ gmule(s[7]);

  out[8] = gmule(s[8]) ^ gmulb(s[9]) ^ gmuld(s[10]) ^ gmul9(s[11]);
  out[9] = gmul9(s[8]) ^ gmule(s[9]) ^ gmulb(s[10]) ^ gmuld(s[11]);
  out[10] = gmuld(s[8]) ^ gmul9(s[9]) ^ gmule(s[10]) ^ gmulb(s[11]);
  out[11] = gmulb(s[8]) ^ gmuld(s[9]) ^ gmul9(s[10]) ^ gmule(s[11]);

  out[12] = gmule(s[12]) ^ gmulb(s[13]) ^ gmuld(s[14]) ^ gmul9(s[15]);
  out[13] = gmul9(s[12]) ^ gmule(s[13]) ^ gmulb(s[14]) ^ gmuld(s[15]);
  out[14] = gmuld(s[12]) ^ gmul9(s[13]) ^ gmule(s[14]) ^ gmulb(s[15]);
  out[15] = gmulb(s[12]) ^ gmuld(s[13]) ^ gmul9(s[14]) ^ gmule(s[15]);

  return out;
}
