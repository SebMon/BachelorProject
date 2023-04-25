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
  key: string,
  callback: (err: Error | null) => void
): Promise<void> {
  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());

  let worker: Worker;
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    worker = new Worker(new URL('./workers/AES-E.ts', import.meta.url), { type: 'module' });
    worker.postMessage({ bytes, AESKey });
  } else {
    const rsakey = await parseRSAKey(key);
    worker = new Worker(new URL('./workers/RSA-E.ts', import.meta.url), { type: 'module' });
    worker.postMessage({ bytes, rsakey });
  }

  worker.addEventListener('message', (message) => {
    const encryptedFileName = file.name + '.encrypted';
    writeFile(directoryHandle, encryptedFileName, message.data as Uint8Array)
      .then(() => {
        callback(null);
      })
      .catch((e: Error) => {
        callback(e);
      });
    worker.terminate();
  });
}

export async function decryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: string,
  callback: (err: Error | null) => void
): Promise<void> {
  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let worker: Worker;
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    worker = new Worker(new URL('./workers/AES-D.ts', import.meta.url), { type: 'module' });
    worker.postMessage({ bytes, AESKey });
  } else {
    const rsakey = await parseRSAKey(key);
    worker = new Worker(new URL('./workers/RSA-D.ts', import.meta.url), { type: 'module' });
    worker.postMessage({ bytes, rsakey });
  }

  worker.addEventListener('message', (message) => {
    let decryptedFileName: string;
    if (file.name.endsWith('.encrypted')) {
      decryptedFileName = file.name.slice(0, file.name.length - 10);
    } else {
      decryptedFileName = file.name + '.decrypted';
    }
    writeFile(directoryHandle, decryptedFileName, message.data as Uint8Array)
      .then(() => {
        callback(null);
      })
      .catch((e: Error) => {
        callback(e);
      });
    worker.terminate();
  });
}

async function writeFile(
  directoryHandle: FileSystemDirectoryHandle,
  encryptedFileName: string,
  encryptedBytes: Uint8Array
): Promise<void> {
  const encryptedFile = await directoryHandle.getFileHandle(encryptedFileName, { create: true });
  const writeableEncryptedFile = await encryptedFile.createWritable();
  await writeableEncryptedFile.write(encryptedBytes);
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
