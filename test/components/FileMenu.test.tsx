import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import FileMenu from '../../src/components/FileMenu';
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

const fileName = 'a test file';
const encryptCallback = vi.fn();
const decryptCallback = vi.fn();

const renderWithFileSelected = (): void => {
  render(
    <FileMenu fileName={fileName} onEncryptionRequested={encryptCallback} onDecryptionRequested={decryptCallback} />
  );
};

const renderWithoutFileSelected = (): void => {
  render(
    <FileMenu fileName={undefined} onEncryptionRequested={encryptCallback} onDecryptionRequested={decryptCallback} />
  );
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('shows the filename when rendered', () => {
  renderWithFileSelected();

  const fileNameElement = screen.queryByText('a test file');
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
