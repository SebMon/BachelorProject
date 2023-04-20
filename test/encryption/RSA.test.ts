import { describe, expect, it } from 'vitest';
import { PrivateKeyFromPem, PrivateKeyToPem, PublicKeyFromPem, PublicKeyToPem } from '../../src/encryption/RSA/keys';

import type { RSAPrivateKey, RSAPublicKey } from '../../src/encryption/RSA/keys';
import { decrypt, encrypt } from '../../src/encryption/RSA';
import { base64ToBytes, bytesToText, textToBytes } from '../../src/encryption/encodeDecode';

describe('RSA.ts', () => {
  // Website used to test the algorithm against: https://www.javainuse.com/rsagenerator
  // Cipher type must be set to RSA/NONE/OAEPWithSHA1AndMGF1Padding

  it('can decrypt some data, encrypted with a tool on the web, with a private key', () => {
    const input = base64ToBytes(
      'dzfwDGM9aVxbu8CsvDOLX/He0GszwdqaTOLGEh3tvLm43age1sYwgm0zpBQms/TSM2x7cmVOhD4yc8yGo5Z7DCpe+ZjheuoJaEG4dSVQ26AbT3D5sWzAkPSFyBkLhAoLVBQgZ458aCBju0BUAytIMpiBh0Vs+vPrspus0zPBCCu1QfFUHMo8ApiWoVVtmkBmt7euWkS6XHj3w7ZdPcShMtfyqkfFYDcDSaW2voxaLNiNXb1RiqG6+0HlidyiQ4tYdFCJPZ0hTiI2j5znG/2+RW/wbgznxWh+N2DRDuxOnWkFTKtGrqKKWvV9aOGRZueFGDWhoH6SdtQ5dsWUMgQscg=='
    );

    const expectedOutput = textToBytes('This is a test string');

    const output = decrypt(input, privateKey);

    expect(output).toEqual(expectedOutput);
  });

  it('can decrypt some data, encrypted with a tool on the web, with a public key', () => {
    const input = base64ToBytes(
      'nGjygwokJPcxz1tiPW7+zAecM6RcmHTUSw1/sUuO6Bd6XFzR659Xeaxme12yJqZMNrrpBBs6fctaVvuveWvCPn6reJ+wl3xscJ0pnKEWSe/S7tKPjtOWr8+iN1aXkBnwTcjl/lRzT6WldNob0Z8MXZTLsq8qYxpJE/xZG58D/0aIQ6qB+3O5HLzULcmqClH8VfvSX3TGxheWz1AA/jnOHNtIs5YeCF4DPV3hU1NBXHOEqmsbwoDDQ77igI6mg7KEnHWssoZKIYg1oNVpGMHGtLCDuC0rFTuJUYslcAaU7qgUAvYI2o8AqlBREnVmR43HzUqsVFaxt9S13y30fncJeA=='
    );

    const expectedOutput = textToBytes('This is a test string');

    const output = decrypt(input, publicKey);

    expect(output).toEqual(expectedOutput);
  });

  it('can encrypt some data with a public key and decrypt it back to the same data with the private key', () => {
    const input = textToBytes('This is a test string');

    const encrypted = encrypt(input, publicKey);

    const decrypted = decrypt(encrypted, privateKey);

    expect(decrypted).toEqual(input);
  });

  it('can encrypt some data with a private key and decrypt it back to the same data with the public key', () => {
    const input = textToBytes('This is a test string');

    const encrypted = encrypt(input, privateKey);

    const decrypted = decrypt(encrypted, publicKey);

    expect(decrypted).toEqual(input);
  });

  it('can encrypt (private) and decrypt (public) a string which is longer than what can fit in one block', () => {
    const input = textToBytes(
      "This is a test string and it has been made very long to test whether the encrypt() and decrypt() functions can handle messages that can't fit into one block 1234123412341234123412341234123412341234123412341234123412341234"
    );

    const encrypted = encrypt(input, publicKey);

    const decrypted = decrypt(encrypted, privateKey);

    expect(decrypted).toEqual(input);
  });

  it('can encrypt (public) and decrypt (private) a string which is longer than what can fit in one block', () => {
    const input = textToBytes(
      "This is a test string and it has been made very long to test whether the encrypt() and decrypt() functions can handle messages that can't fit into one block 1234123412341234123412341234123412341234123412341234123412341234"
    );

    const encrypted = encrypt(input, privateKey);

    const decrypted = decrypt(encrypted, publicKey);

    expect(decrypted).toEqual(input);
  });
});

describe('keys.ts', () => {
  it('can parse public key from pem', () => {
    const testValue = PublicKeyFromPem(publicKeyPem);

    expect(testValue).toEqual(publicKey);
  });

  it('can parse public key to pem', () => {
    const testValue = PublicKeyToPem(publicKey);

    expect(testValue).toEqual(publicKeyPem);
  });

  it('can parse private key from pem', () => {
    const testValue = PrivateKeyFromPem(privateKeyPem);

    expect(testValue).toEqual(privateKey);
  });

  it('can parse public key to pem', () => {
    const testValue = PrivateKeyToPem(privateKey);

    expect(testValue).toEqual(privateKeyPem);
  });
});

// RESOURCES
const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr0S797DzhG5aLkjncpw0
KxlYFx+esyBTEuOve2svduc5MFx0WTesybXCTBOhWaJ3MU+g7bZAqdS+xLr7Ve8U
2GbC4rFBWR6nJlxY2hwgIEJbc4U5oD2TNyhjcXQ+aKJE39D0ohSmOn7ZPbF+Sydd
eQuEM1tX8gLo0FaWAh0UEGhY3G9t0bvfJaqoM5rlXuy81YCAPl+eh4PPzreD3fkI
y28hzJScGhEwfpfeIDzbpKUrZqMJPDvwOfnJg1m6WSS7S//dCaZZ+kbJhu60rAKl
5cCKRd8pbPTvk3TBIbTCw2Wz4gR5zYViGTxS0OKYbjBEhVSO1Wp2giB0i7MuyrEf
zwIDAQAB
-----END PUBLIC KEY-----
`;

const publicKey: RSAPublicKey = {
  n: new Uint8Array([
    175, 68, 187, 247, 176, 243, 132, 110, 90, 46, 72, 231, 114, 156, 52, 43, 25, 88, 23, 31, 158, 179, 32, 83, 18, 227,
    175, 123, 107, 47, 118, 231, 57, 48, 92, 116, 89, 55, 172, 201, 181, 194, 76, 19, 161, 89, 162, 119, 49, 79, 160,
    237, 182, 64, 169, 212, 190, 196, 186, 251, 85, 239, 20, 216, 102, 194, 226, 177, 65, 89, 30, 167, 38, 92, 88, 218,
    28, 32, 32, 66, 91, 115, 133, 57, 160, 61, 147, 55, 40, 99, 113, 116, 62, 104, 162, 68, 223, 208, 244, 162, 20, 166,
    58, 126, 217, 61, 177, 126, 75, 39, 93, 121, 11, 132, 51, 91, 87, 242, 2, 232, 208, 86, 150, 2, 29, 20, 16, 104, 88,
    220, 111, 109, 209, 187, 223, 37, 170, 168, 51, 154, 229, 94, 236, 188, 213, 128, 128, 62, 95, 158, 135, 131, 207,
    206, 183, 131, 221, 249, 8, 203, 111, 33, 204, 148, 156, 26, 17, 48, 126, 151, 222, 32, 60, 219, 164, 165, 43, 102,
    163, 9, 60, 59, 240, 57, 249, 201, 131, 89, 186, 89, 36, 187, 75, 255, 221, 9, 166, 89, 250, 70, 201, 134, 238, 180,
    172, 2, 165, 229, 192, 138, 69, 223, 41, 108, 244, 239, 147, 116, 193, 33, 180, 194, 195, 101, 179, 226, 4, 121,
    205, 133, 98, 25, 60, 82, 208, 226, 152, 110, 48, 68, 133, 84, 142, 213, 106, 118, 130, 32, 116, 139, 179, 46, 202,
    177, 31, 207
  ]),
  e: new Uint8Array([0x01, 0x00, 0x01])
};

const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCvRLv3sPOEblou
SOdynDQrGVgXH56zIFMS4697ay925zkwXHRZN6zJtcJME6FZoncxT6DttkCp1L7E
uvtV7xTYZsLisUFZHqcmXFjaHCAgQltzhTmgPZM3KGNxdD5ookTf0PSiFKY6ftk9
sX5LJ115C4QzW1fyAujQVpYCHRQQaFjcb23Ru98lqqgzmuVe7LzVgIA+X56Hg8/O
t4Pd+QjLbyHMlJwaETB+l94gPNukpStmowk8O/A5+cmDWbpZJLtL/90Jpln6RsmG
7rSsAqXlwIpF3yls9O+TdMEhtMLDZbPiBHnNhWIZPFLQ4phuMESFVI7VanaCIHSL
sy7KsR/PAgMBAAECgf9z7lhm00+Vnr4H34aNnho5EoqHa7g4GSmEqmtojNLYfhlV
49G8hxcY/8uFMXbd00Our6fC6h/bi4f5Q7T7zSinUKbtS6dDS63vByZpHtwhJRit
+3F34e1+jo3jKFYfiotZgDL7Aq2cA6ED2GOxUliBuHG5hrH6t/Hx3KlcvIneT2Q2
rd9aiiSNJuZJcYZdhWml/p8TvPDQEjuArvnmXb0dimZrMbkeGBmbAq8fUDUCaVf3
5GPeZU1xra4nk4XEugzykdr9KJvum9KEksc/JGcUYwa5Yx7WD948+QNTVfsj8FN8
9gYNwKIzp++nZ5adHNeYrEiEpx1aTOgOdSvmAeECgYEA1vxStb238dmZDzYdLo3p
CWAnRLSThuobz2jH4ktqBIiGdiN3B9m5CXfnhZNNbRM/b11SaiAladRPd/EJQRTM
jdLzuVZHrmZiqUJsLiwENlU7J8zXCve7S/b0hJaHhvFsTEcwDyCBew0nX/RdciKV
9pBHuvEVNIvLBnKGaHoScD0CgYEA0LSqsv04FvyBSzlx53vHkG4ufnQWpeZ1ihz+
BnxfL2A4BGo7mdPFLYcGldR/kFkHd+9B+CoEoNgWeiOQdTffgZ5oqGY/Bqc3JJya
xUKiPdfk+PtuJi7m78GHanR532I4sw3MFXz5yuVYRIja9OG5XQLirc7CqcPRAbdd
T9rupPsCgYEAs1CckDgg4Bm1/6kMKBN3pzlLJ5RSZLqJ3bKw3gA2+ncBaDJmiua/
3rTjKFfXwb3HMFUvc5NCgYXzjsA+DsmRYE3uuczMVxvQ+QqM/un5zXPDtou1ZdGB
qHfgNWL0wcpGoUzTOhrLxN4Q1IkXFCbi3Fg1bCi/nidnfQYzM5t2G6UCgYA+rAIW
fbO6M1kgHb/2o1TqKiwMDRBAAVSKhOpDSFXNBDfOG5iKOO2dHk777zPfRNzZRx+o
RfXd1wXo54UZrg2P/uGusAV9GfmVJPHVCo1txMcdfWM2VB9FH/hqH0/5pKUiH6KJ
UV4xb21yJyaZIq9nHtazGsOZ9xNsUIPU1wmSwQKBgGHlA/m/Bpl11EVLAWa7Iyt/
yuUh4IzngL3xbJadRP+5xkz9yXJtgkdefhEr4vZvRbUxuQ3h1WrVpe0A8dqfzrWQ
91PpyvPcKxytrzXMXPzhJSfa1qhtXDH544bf0FiYGs5JoNbdRwudDFub4Wt/QWnN
yIsDak+fiAiqZGcU/zuQ
-----END PRIVATE KEY-----
`;

const privateKey: RSAPrivateKey = {
  n: new Uint8Array([
    175, 68, 187, 247, 176, 243, 132, 110, 90, 46, 72, 231, 114, 156, 52, 43, 25, 88, 23, 31, 158, 179, 32, 83, 18, 227,
    175, 123, 107, 47, 118, 231, 57, 48, 92, 116, 89, 55, 172, 201, 181, 194, 76, 19, 161, 89, 162, 119, 49, 79, 160,
    237, 182, 64, 169, 212, 190, 196, 186, 251, 85, 239, 20, 216, 102, 194, 226, 177, 65, 89, 30, 167, 38, 92, 88, 218,
    28, 32, 32, 66, 91, 115, 133, 57, 160, 61, 147, 55, 40, 99, 113, 116, 62, 104, 162, 68, 223, 208, 244, 162, 20, 166,
    58, 126, 217, 61, 177, 126, 75, 39, 93, 121, 11, 132, 51, 91, 87, 242, 2, 232, 208, 86, 150, 2, 29, 20, 16, 104, 88,
    220, 111, 109, 209, 187, 223, 37, 170, 168, 51, 154, 229, 94, 236, 188, 213, 128, 128, 62, 95, 158, 135, 131, 207,
    206, 183, 131, 221, 249, 8, 203, 111, 33, 204, 148, 156, 26, 17, 48, 126, 151, 222, 32, 60, 219, 164, 165, 43, 102,
    163, 9, 60, 59, 240, 57, 249, 201, 131, 89, 186, 89, 36, 187, 75, 255, 221, 9, 166, 89, 250, 70, 201, 134, 238, 180,
    172, 2, 165, 229, 192, 138, 69, 223, 41, 108, 244, 239, 147, 116, 193, 33, 180, 194, 195, 101, 179, 226, 4, 121,
    205, 133, 98, 25, 60, 82, 208, 226, 152, 110, 48, 68, 133, 84, 142, 213, 106, 118, 130, 32, 116, 139, 179, 46, 202,
    177, 31, 207
  ]),
  d: new Uint8Array([
    115, 238, 88, 102, 211, 79, 149, 158, 190, 7, 223, 134, 141, 158, 26, 57, 18, 138, 135, 107, 184, 56, 25, 41, 132,
    170, 107, 104, 140, 210, 216, 126, 25, 85, 227, 209, 188, 135, 23, 24, 255, 203, 133, 49, 118, 221, 211, 67, 174,
    175, 167, 194, 234, 31, 219, 139, 135, 249, 67, 180, 251, 205, 40, 167, 80, 166, 237, 75, 167, 67, 75, 173, 239, 7,
    38, 105, 30, 220, 33, 37, 24, 173, 251, 113, 119, 225, 237, 126, 142, 141, 227, 40, 86, 31, 138, 139, 89, 128, 50,
    251, 2, 173, 156, 3, 161, 3, 216, 99, 177, 82, 88, 129, 184, 113, 185, 134, 177, 250, 183, 241, 241, 220, 169, 92,
    188, 137, 222, 79, 100, 54, 173, 223, 90, 138, 36, 141, 38, 230, 73, 113, 134, 93, 133, 105, 165, 254, 159, 19, 188,
    240, 208, 18, 59, 128, 174, 249, 230, 93, 189, 29, 138, 102, 107, 49, 185, 30, 24, 25, 155, 2, 175, 31, 80, 53, 2,
    105, 87, 247, 228, 99, 222, 101, 77, 113, 173, 174, 39, 147, 133, 196, 186, 12, 242, 145, 218, 253, 40, 155, 238,
    155, 210, 132, 146, 199, 63, 36, 103, 20, 99, 6, 185, 99, 30, 214, 15, 222, 60, 249, 3, 83, 85, 251, 35, 240, 83,
    124, 246, 6, 13, 192, 162, 51, 167, 239, 167, 103, 150, 157, 28, 215, 152, 172, 72, 132, 167, 29, 90, 76, 232, 14,
    117, 43, 230, 1, 225
  ]),
  e: new Uint8Array([1, 0, 1]),
  p: new Uint8Array([
    214, 252, 82, 181, 189, 183, 241, 217, 153, 15, 54, 29, 46, 141, 233, 9, 96, 39, 68, 180, 147, 134, 234, 27, 207,
    104, 199, 226, 75, 106, 4, 136, 134, 118, 35, 119, 7, 217, 185, 9, 119, 231, 133, 147, 77, 109, 19, 63, 111, 93, 82,
    106, 32, 37, 105, 212, 79, 119, 241, 9, 65, 20, 204, 141, 210, 243, 185, 86, 71, 174, 102, 98, 169, 66, 108, 46, 44,
    4, 54, 85, 59, 39, 204, 215, 10, 247, 187, 75, 246, 244, 132, 150, 135, 134, 241, 108, 76, 71, 48, 15, 32, 129, 123,
    13, 39, 95, 244, 93, 114, 34, 149, 246, 144, 71, 186, 241, 21, 52, 139, 203, 6, 114, 134, 104, 122, 18, 112, 61
  ]),
  q: new Uint8Array([
    208, 180, 170, 178, 253, 56, 22, 252, 129, 75, 57, 113, 231, 123, 199, 144, 110, 46, 126, 116, 22, 165, 230, 117,
    138, 28, 254, 6, 124, 95, 47, 96, 56, 4, 106, 59, 153, 211, 197, 45, 135, 6, 149, 212, 127, 144, 89, 7, 119, 239,
    65, 248, 42, 4, 160, 216, 22, 122, 35, 144, 117, 55, 223, 129, 158, 104, 168, 102, 63, 6, 167, 55, 36, 156, 154,
    197, 66, 162, 61, 215, 228, 248, 251, 110, 38, 46, 230, 239, 193, 135, 106, 116, 121, 223, 98, 56, 179, 13, 204, 21,
    124, 249, 202, 229, 88, 68, 136, 218, 244, 225, 185, 93, 2, 226, 173, 206, 194, 169, 195, 209, 1, 183, 93, 79, 218,
    238, 164, 251
  ]),
  dp: new Uint8Array([
    179, 80, 156, 144, 56, 32, 224, 25, 181, 255, 169, 12, 40, 19, 119, 167, 57, 75, 39, 148, 82, 100, 186, 137, 221,
    178, 176, 222, 0, 54, 250, 119, 1, 104, 50, 102, 138, 230, 191, 222, 180, 227, 40, 87, 215, 193, 189, 199, 48, 85,
    47, 115, 147, 66, 129, 133, 243, 142, 192, 62, 14, 201, 145, 96, 77, 238, 185, 204, 204, 87, 27, 208, 249, 10, 140,
    254, 233, 249, 205, 115, 195, 182, 139, 181, 101, 209, 129, 168, 119, 224, 53, 98, 244, 193, 202, 70, 161, 76, 211,
    58, 26, 203, 196, 222, 16, 212, 137, 23, 20, 38, 226, 220, 88, 53, 108, 40, 191, 158, 39, 103, 125, 6, 51, 51, 155,
    118, 27, 165
  ]),
  dq: new Uint8Array([
    62, 172, 2, 22, 125, 179, 186, 51, 89, 32, 29, 191, 246, 163, 84, 234, 42, 44, 12, 13, 16, 64, 1, 84, 138, 132, 234,
    67, 72, 85, 205, 4, 55, 206, 27, 152, 138, 56, 237, 157, 30, 78, 251, 239, 51, 223, 68, 220, 217, 71, 31, 168, 69,
    245, 221, 215, 5, 232, 231, 133, 25, 174, 13, 143, 254, 225, 174, 176, 5, 125, 25, 249, 149, 36, 241, 213, 10, 141,
    109, 196, 199, 29, 125, 99, 54, 84, 31, 69, 31, 248, 106, 31, 79, 249, 164, 165, 34, 31, 162, 137, 81, 94, 49, 111,
    109, 114, 39, 38, 153, 34, 175, 103, 30, 214, 179, 26, 195, 153, 247, 19, 108, 80, 131, 212, 215, 9, 146, 193
  ]),
  qi: new Uint8Array([
    97, 229, 3, 249, 191, 6, 153, 117, 212, 69, 75, 1, 102, 187, 35, 43, 127, 202, 229, 33, 224, 140, 231, 128, 189,
    241, 108, 150, 157, 68, 255, 185, 198, 76, 253, 201, 114, 109, 130, 71, 94, 126, 17, 43, 226, 246, 111, 69, 181, 49,
    185, 13, 225, 213, 106, 213, 165, 237, 0, 241, 218, 159, 206, 181, 144, 247, 83, 233, 202, 243, 220, 43, 28, 173,
    175, 53, 204, 92, 252, 225, 37, 39, 218, 214, 168, 109, 92, 49, 249, 227, 134, 223, 208, 88, 152, 26, 206, 73, 160,
    214, 221, 71, 11, 157, 12, 91, 155, 225, 107, 127, 65, 105, 205, 200, 139, 3, 106, 79, 159, 136, 8, 170, 100, 103,
    20, 255, 59, 144
  ])
};
