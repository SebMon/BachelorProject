import { it, expect, afterEach, vi, assert } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import FileExplorer from '../../src/components/FileExplorer/FileExplorer';
import React from 'react';
import { instance, mock, when } from 'ts-mockito';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});

it('displays the correct buttons', () => {
  // Arrange
  render(<FileExplorer />);
  const buttonArray: string[] = [];

  // Act
  screen.getAllByRole('button').forEach((value) => {
    if (value.textContent !== null) buttonArray.push(value.textContent);
  });

  // Assert
  expect(buttonArray).toContain('Select Folder');
  expect(buttonArray).toContain('Close Folder');
});

/*
it('renders folders', async () => {
  // Arange
  render(<FileExplorer />);

  const mockedFileSystemFileHandle: FileSystemFileHandle = mock(FileSystemFileHandle);
  const mockedFileSystemDirectoryHandle: FileSystemDirectoryHandle = mock(FileSystemDirectoryHandle);

  const mainDirectoryHandle: FileSystemDirectoryHandle = instance(mockedFileSystemDirectoryHandle);
  const directoryHandle: FileSystemDirectoryHandle = instance(mockedFileSystemDirectoryHandle);
  const filehandle1: FileSystemFileHandle = instance(mockedFileSystemFileHandle);
  const filehandle2: FileSystemFileHandle = instance(mockedFileSystemFileHandle);

  const values = {
    async *[Symbol.asyncIterator]() {
      yield await new Promise<FileSystemDirectoryHandle>((resolve, _reject) => {
        resolve(directoryHandle);
      });
      yield await new Promise<FileSystemFileHandle>((resolve, _reject) => {
        resolve(filehandle1);
      });
    }
  };

  const values2 = {
    async *[Symbol.asyncIterator]() {
      yield await new Promise<FileSystemFileHandle>((resolve, _reject) => {
        resolve(filehandle2);
      });
    }
  };

  when(mainDirectoryHandle.name).thenReturn('Main Folder');
  when(mainDirectoryHandle.values()).thenReturn(values[Symbol.asyncIterator]());

  when(directoryHandle.name).thenReturn('Folder');
  when(directoryHandle.values()).thenReturn(values2[Symbol.asyncIterator]());

  when(filehandle1.name).thenReturn('File 1');
  when(filehandle2.name).thenReturn('File 2');

  vi.fn(window.showDirectoryPicker).mockImplementation(
    async () =>
      await new Promise<FileSystemDirectoryHandle>((resolve, _reject) => {
        resolve(mainDirectoryHandle);
      })
  );

  // Act
  await userEvent.click(screen.getByDisplayValue('Select Folder'));

  // Assert
  assert(screen.getByDisplayValue('Main Folder') !== null);
  assert(screen.getByDisplayValue('Folder') !== null);
  assert(screen.getByDisplayValue('File 1') !== null);
  assert(screen.getByDisplayValue('File 2') !== null);
});
*/
