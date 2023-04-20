import React from 'react';

export interface SelectedFileContext {
  selectedFile: FileSystemFileHandle | undefined;
  setSelectedFile: (value: FileSystemFileHandle | undefined) => void;
}

export const selectedFileContext = React.createContext<SelectedFileContext>({
  selectedFile: undefined,
  setSelectedFile: (value) => {
    console.log(value);
  }
});
