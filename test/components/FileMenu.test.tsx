import { afterEach, expect, it, vi } from 'vitest';
import FileMenu from '../../src/components/FileMenu';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { selectedFileContext } from '../../src/context/SelectedFileContext';
import type { SelectedFileContext } from '../../src/context/SelectedFileContext';
import { mock } from 'vitest-mock-extended';

const fileName = 'a test file';
const encryptCallback = vi.fn();
const decryptCallback = vi.fn();

const directoryHandleRemoveEntry = vi.fn();

const renderWithFileSelected = (): void => {
  const contextMock = mock<SelectedFileContext>({
    selectedFile: mock<FileSystemFileHandle>({ name: fileName }),
    selectedFilesParentFolder: mock<FileSystemDirectoryHandle>({ removeEntry: directoryHandleRemoveEntry })
  });

  render(
    <selectedFileContext.Provider value={contextMock}>
      <FileMenu onEncryptionRequested={encryptCallback} onDecryptionRequested={decryptCallback} />
    </selectedFileContext.Provider>
  );

  vi.stubGlobal(
    'confirm',
    vi.fn().mockImplementation(() => true)
  );
};

const renderWithoutFileSelected = (): void => {
  render(<FileMenu onEncryptionRequested={encryptCallback} onDecryptionRequested={decryptCallback} />);
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('shows the filename when rendered', () => {
  renderWithFileSelected();

  const fileNameElement = screen.queryByDisplayValue(fileName);
  expect(fileNameElement).not.toBeNull();
});

it('calls the encryption callback, when the Encrypt button is pressed', () => {
  renderWithFileSelected();

  const encryptButton = screen.queryByText('Encrypt');
  encryptButton?.click();
  expect(encryptCallback).toHaveBeenCalledOnce();
});

it('calls the decryption callback, when the Decrypt button is pressed', () => {
  renderWithFileSelected();

  const decryptButton = screen.queryByText('Decrypt');
  decryptButton?.click();
  expect(decryptCallback).toHaveBeenCalledOnce();
});

it('calls the encryption callback, when the Encrypt button is pressed', () => {
  renderWithoutFileSelected();

  const encryptButton = screen.queryByText('Encrypt');
  encryptButton?.click();
  expect(encryptCallback).not.toHaveBeenCalledOnce();
});

it('calls the decryption callback, when the Decrypt button is pressed', () => {
  renderWithoutFileSelected();

  const decryptButton = screen.queryByText('Decrypt');
  decryptButton?.click();
  expect(decryptCallback).not.toHaveBeenCalledOnce();
});

it('calls removeEntry on folder when the delete button is pressed', () => {
  renderWithFileSelected();

  const deleteButton = screen.queryByTestId('delete-button');
  expect(deleteButton).not.toBeNull();

  deleteButton?.click();
  expect(directoryHandleRemoveEntry).toHaveBeenCalledWith(fileName);
});
