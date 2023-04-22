import { EncryptionType } from '../types/Encryption';
import { encrypt } from './AES';
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
