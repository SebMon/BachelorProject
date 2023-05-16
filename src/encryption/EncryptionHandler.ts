import { EncryptionType } from './Types';
import type { EncryptionKey } from './Types';
import { PrivateKeyFromPem, PublicKeyFromPem } from './RSA/keys';
import type { RSAKey } from './RSA/keys';
import { hexToBytes } from './encodeDecode';
import { EncryptionEngine } from '../persistence/settings';
import AES_D_js_url from './workers/AES-D-js?worker&url';
import AES_D_wasm_url from './workers/AES-D-wasm.ts?worker&url';
import AES_E_js_url from './workers/AES-E-js.ts?worker&url';
import AES_E_wasm_url from './workers/AES-E-wasm.ts?worker&url';
import RSA_D_js_url from './workers/RSA-D-js.ts?worker&url';
import RSA_D_wasm_url from './workers/RSA-D-wasm.ts?worker&url';
import RSA_E_js_url from './workers/RSA-E-js.ts?worker&url';
import RSA_E_wasm_url from './workers/RSA-E-wasm.ts?worker&url';

export async function encryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: EncryptionKey,
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
    const url = engine === EncryptionEngine.js ? AES_E_js_url : AES_E_wasm_url;
    worker = new Worker(url, { type: 'module' });
    worker.postMessage({ bytes, aesKey: key });
  } else {
    const url = engine === EncryptionEngine.js ? RSA_E_js_url : RSA_E_wasm_url;
    worker = new Worker(url, { type: 'module' });
    worker.postMessage({ bytes, rsaKey: key });
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
  key: EncryptionKey,
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
    const url = engine === EncryptionEngine.js ? AES_D_js_url : AES_D_wasm_url;
    worker = new Worker(url, { type: 'module' });
    worker.postMessage({ bytes, aesKey: key });
  } else {
    const url = engine === EncryptionEngine.js ? RSA_D_js_url : RSA_D_wasm_url;
    worker = new Worker(url, { type: 'module' });
    worker.postMessage({ bytes, rsaKey: key });
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
