import { EncryptionType } from '../types/Encryption';
import * as AES from './AES';
import { PrivateKeyFromPem, PublicKeyFromPem } from './RSA/keys';
import * as RSA from './RSA';
import type { RSAKey } from './RSA/keys';
import { hexToBytes } from './encodeDecode';
import { EncryptionEngine } from '../persistence/settings';

export async function encryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: string,
  engine: EncryptionEngine,
  callback: (err: Error | null) => void
): Promise<void> {
  // The following line forces the user to accept or reject the program writing to their filesystem immediately.
  // If this is not done, the browser might not ask and make the writing of the encrypted file fail.
  await (await fileHandle.createWritable({ keepExistingData: true })).close();

  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());

  let worker: Worker;
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    const url =
      engine === EncryptionEngine.js
        ? new URL('./workers/AES-E-js.ts', import.meta.url)
        : new URL('./workers/AES-E-wasm.ts', import.meta.url);
    worker = new Worker(url, { type: 'module' });
    worker.postMessage({ bytes, AESKey });
  } else {
    const rsakey = await parseRSAKey(key);
    const url =
      engine === EncryptionEngine.js
        ? new URL('./workers/RSA-E-js.ts', import.meta.url)
        : new URL('./workers/RSA-E-wasm.ts', import.meta.url);
    worker = new Worker(url, { type: 'module' });
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
  engine: EncryptionEngine,
  callback: (err: Error | null) => void
): Promise<void> {
  // The following line forces the user to accept or reject the program writing to their filesystem immediately.
  // If this is not done, the browser might not ask and make the writing of the encrypted file fail.
  await (await fileHandle.createWritable({ keepExistingData: true })).close();

  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let worker: Worker;
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    const url =
      engine === EncryptionEngine.js
        ? new URL('./workers/AES-D-js.ts', import.meta.url)
        : new URL('./workers/AES-D-wasm.ts', import.meta.url);
    worker = new Worker(url, { type: 'module' });
    worker.postMessage({ bytes, AESKey });
  } else {
    const rsakey = await parseRSAKey(key);
    const url =
      engine === EncryptionEngine.js
        ? new URL('./workers/RSA-D-js.ts', import.meta.url)
        : new URL('./workers/RSA-D-wasm.ts', import.meta.url);
    worker = new Worker(url, { type: 'module' });
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
