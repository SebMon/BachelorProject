import { EncryptionType } from '../types/Encryption';
import * as AES from './AES';
import { PrivateKeyFromPem, PublicKeyFromPem } from './RSA/keys';
import * as RSA from './RSA';
import type { RSAKey } from './RSA/keys';
import { hexToBytes } from './encodeDecode';

export async function encryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: string
): Promise<void> {
  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let encryptedBytes: Uint8Array;
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    encryptedBytes = AES.encrypt(bytes, AESKey);
  } else {
    const rsakey = await parseRSAKey(key);
    encryptedBytes = await RSA.encrypt(bytes, rsakey);
  }
  const encryptedFileName = file.name + '.encrypted';
  const encryptedFile = await directoryHandle.getFileHandle(encryptedFileName, { create: true });
  const writeableEncryptedFile = await encryptedFile.createWritable();
  await writeableEncryptedFile.write(encryptedBytes);
  await writeableEncryptedFile.close();
}

export async function decryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: string
): Promise<void> {
  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let decryptedBytes: Uint8Array;
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    decryptedBytes = AES.decrypt(bytes, AESKey);
  } else {
    const rsakey = await parseRSAKey(key);
    decryptedBytes = await RSA.decrypt(bytes, rsakey);
  }
  let decryptedFileName: string;
  if (file.name.endsWith('.encrypted')) {
    decryptedFileName = file.name.slice(0, file.name.length - 10);
  } else {
    decryptedFileName = file.name + '.decrypted';
  }
  const encryptedFile = await directoryHandle.getFileHandle(decryptedFileName, { create: true });
  const writeableEncryptedFile = await encryptedFile.createWritable();
  await writeableEncryptedFile.write(decryptedBytes);
  await writeableEncryptedFile.close();
}

async function parseRSAKey(key: string): Promise<RSAKey> {
  if (key.includes('-----BEGIN PUBLIC KEY-----')) {
    return await PublicKeyFromPem(key);
  } else if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    return await PrivateKeyFromPem(key);
  }

  throw Error("RSA key didn't incude include '-----BEGIN PUBLIC KEY-----' or '-----BEGIN PRIVATE KEY-----'");
}
