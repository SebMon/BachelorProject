import { it, afterEach, vi, assert, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import FileExplorer from '../../src/components/FileExplorer/FileExplorer';
import React from 'react';
import { mock } from 'vitest-mock-extended';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  // Arange
  render(<FileExplorer />);

  const mainDirectoryHandle = mock<FileSystemDirectoryHandle>({ name: 'Main Folder', kind: 'directory' });
  const directoryHandle = mock<FileSystemDirectoryHandle>({ name: 'Folder', kind: 'directory' });
  const filehandle1 = mock<FileSystemFileHandle>({ name: 'File 1', kind: 'file' });
  const filehandle2 = mock<FileSystemFileHandle>({ name: 'File 2', kind: 'file' });

  const values1 = {
    // eslint-disable-next-line
    async *[Symbol.asyncIterator]() {
      yield filehandle2;
    }
  };

  directoryHandle.values.mockReturnValue(values1[Symbol.asyncIterator]());

  const values2 = {
    // eslint-disable-next-line
    async *[Symbol.asyncIterator]() {
      yield directoryHandle;
      yield filehandle1;
    }
  };

  mainDirectoryHandle.values.mockReturnValue(values2[Symbol.asyncIterator]());

  vi.stubGlobal(
    'showDirectoryPicker',
    vi.fn().mockImplementation(async () => await Promise.resolve(mainDirectoryHandle))
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('displays the correct buttons', () => {
  // Assert
  assert(screen.getByText('Select Folder', { selector: 'button' }) != null);
  assert(screen.getByText('Close Folder', { selector: 'button' }) != null);
});

it('renders initially opened folder', async () => {
  // Act
  await userEvent.click(screen.getByText('Select Folder', { selector: 'button' }));

  // Assert
  assert(screen.getByText('Main Folder') !== null);
});

it('renders subfolders and files', async () => {
  // Act
  await userEvent.click(screen.getByText('Select Folder', { selector: 'button' }));
  await userEvent.click(screen.getByRole('button', { name: /expand-button/i }));

  // Assert
  assert(screen.getByText('Main Folder') !== null);
  assert(screen.getByText('Folder') !== null);
  assert(screen.getByText('File 1') !== null);
});
