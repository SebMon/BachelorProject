import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EncryptDialog from '../../src/components/EncryptDialog';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { EncryptionType } from '../../src/encryption/Types';

const encryptCallback = vi.fn();
const closeCallback = vi.fn();

beforeEach(() => {
  render(<EncryptDialog show={true} onClose={closeCallback} onEncrypt={encryptCallback} variant="encrypt" />);
});

afterEach(() => {
  cleanup();
});

it('has an algorithm selector', () => {
  const algorithmSelector = screen.queryByLabelText(/[Aa]lgorithm/);
  expect(algorithmSelector).not.toBeNull();
  if (algorithmSelector === null) throw Error();

  const symmetricOption = within(algorithmSelector).queryByText(/[^ ][Ss]ymmetric/);
  const assymetricOption = within(algorithmSelector).queryByText(/[Aa]symmetric/);
  expect(symmetricOption).not.toBeNull();
  expect(assymetricOption).not.toBeNull();
});

it('has a textbox for entering a key', () => {
  const algorithmSelector = screen.queryByLabelText(/[Kk]ey/);
  expect(algorithmSelector).not.toBeNull();
});

it('shows the correct tooltip when Symmetric encryption is selected', async () => {
  const algorithmSelector = screen.queryByLabelText(/[Aa]lgorithm/);
  expect(algorithmSelector).not.toBeNull();
  if (algorithmSelector === null) throw Error();

  const symmetricOption = within(algorithmSelector).queryByText(/[^ ][Ss]ymmetric/);
  symmetricOption?.click();

  const infoSymbol = screen.queryByTestId('key-info-icon');
  if (infoSymbol === null) throw Error();

  fireEvent.mouseOver(infoSymbol);

  await waitFor(() => screen.getByRole('tooltip'));

  const tooltip = screen.queryByRole('tooltip');
  expect(tooltip?.innerHTML).toMatch(/AES-256/);
  expect(tooltip?.innerHTML).toMatch(/hex/);
});

it('shows the correct tooltip when Assymetric encryption is selected', async () => {
  const algorithmSelector = screen.queryByLabelText(/[Aa]lgorithm/);
  if (algorithmSelector === null) throw Error();

  const asymmetricOption = within(algorithmSelector).queryByText(/[Aa]symmetric/);
  if (asymmetricOption === null) throw Error();

  await userEvent.selectOptions(algorithmSelector, asymmetricOption);

  const infoSymbol = screen.queryByTestId('key-info-icon');
  if (infoSymbol === null) throw Error();

  fireEvent.mouseOver(infoSymbol);

  await waitFor(() => screen.getByRole('tooltip'));

  const tooltip = screen.queryByRole('tooltip');
  expect(tooltip?.innerHTML).toMatch(/pem/);
  expect(tooltip?.innerHTML).toMatch(/pkcs8/);
});

it('correctly calls the encrypt callback when "encrypt" button is pressed', async () => {
  const algorithmSelector = screen.queryByLabelText(/[Aa]lgorithm/);
  if (algorithmSelector === null) throw Error();

  const asymmetricOption = within(algorithmSelector).queryByText(/[Aa]symmetric/);
  if (asymmetricOption === null) throw Error();

  await userEvent.selectOptions(algorithmSelector, asymmetricOption);

  const textarea = screen.queryByLabelText(/[Kk]ey/);
  if (textarea === null) throw Error();

  fireEvent.change(textarea, { target: { value: 'testKey' } });

  const buttons = screen.queryAllByRole('button');

  const encryptButton = buttons.find((e) => e.innerHTML.match(/[Ee]ncrypt/));
  if (encryptButton === undefined) throw Error();

  encryptButton.click();

  expect(encryptCallback).toHaveBeenCalledWith(EncryptionType.Asymmetric, 'testKey');
  expect(closeCallback).toHaveBeenCalledOnce();
});
