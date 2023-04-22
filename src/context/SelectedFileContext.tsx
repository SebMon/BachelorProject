import React from 'react';

export interface SelectedFileContext {
  selectedFile: FileSystemFileHandle | undefined;
  setSelectedFile: (value: FileSystemFileHandle | undefined) => void;
  selectedFilesParentFolder: FileSystemDirectoryHandle | undefined;
  setSelectedFilesParentFolder: (value: FileSystemDirectoryHandle | undefined) => void;
  fileSystemInvalidated: number;
  setFileSystemInvalidated: (value: number) => void;
}

export const selectedFileContext = React.createContext<SelectedFileContext>({
  selectedFile: undefined,
  setSelectedFile: (value) => {
    console.log(value);
  },
  selectedFilesParentFolder: undefined,
  setSelectedFilesParentFolder: (value) => {
    console.log(value);
  },
  fileSystemInvalidated: 0,
  setFileSystemInvalidated: (value: number) => {
    console.log(value);
  }
});
