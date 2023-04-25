export enum EncryptionType {
  Symmetric = 'symmetric',
  Asymmetric = 'assymetric'
}

export interface EncryptionRequest {
  file: FileSystemFileHandle;
  folder: FileSystemDirectoryHandle;
  type: EncryptionType;
  key: string;
}
