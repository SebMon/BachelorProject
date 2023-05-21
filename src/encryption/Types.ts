import type { AESKey } from './AES';
import type { RSAKey } from './RSA/keys';

export enum EncryptionType {
  Symmetric = 'symmetric',
  Asymmetric = 'asymetric'
}

export enum KeyType {
  Symmetric = 'symmetric',
  AsymmetricPublic = 'asymmetricPublic',
  AsymmetricPrivate = 'asymmetricPrivate'
}

export type EncryptionKey = RSAKey | AESKey;
