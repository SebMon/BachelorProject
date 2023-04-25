import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../src/App';
import React from 'react';

beforeEach(() => {
  render(<App />);
  vi.mock('src-wasm', () => {
    return {
      default: vi.fn(async () => {
        await new Promise<void>((resolve, _reject) => {
          resolve();
        });
      }),
      fib: vi.fn(() => 1)
    };
  });
});

afterEach(cleanup);

it('has a select folder button', () => {
  const selectFolderButton = screen.queryByText('Select Folder');
  expect(selectFolderButton).not.toBeNull();
});

it('has an encrypt button', () => {
  const selectFolderButton = screen.queryByText('Encrypt');
  expect(selectFolderButton).not.toBeNull();
});

it('has an decrypt button', () => {
  const selectFolderButton = screen.queryByText('Decrypt');
  expect(selectFolderButton).not.toBeNull();
});
