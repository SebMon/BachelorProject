import { EncryptionType } from '../types/Encryption';
import { decrypt, encrypt } from './AES';
import { hexToBytes } from './encodeDecode';

export async function encryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: string
): Promise<void> {
  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    const encryptedBytes = encrypt(bytes, AESKey);
    const encryptedFileName = file.name + '.encrypted';
    const encryptedFile = await directoryHandle.getFileHandle(encryptedFileName, { create: true });
    const writeableEncryptedFile = await encryptedFile.createWritable();
    await writeableEncryptedFile.write(encryptedBytes);
    await writeableEncryptedFile.close();
  }
}

export async function decryptFile(
  fileHandle: FileSystemFileHandle,
  directoryHandle: FileSystemDirectoryHandle,
  type: EncryptionType,
  key: string
): Promise<void> {
  const file = await fileHandle.getFile();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (type === EncryptionType.Symmetric) {
    const AESKey = hexToBytes(key);
    const decryptedBytes = decrypt(bytes, AESKey);
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
}
