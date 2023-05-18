import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { Matcher } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EncryptDialog from '../../src/components/EncryptDialog';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { StoredKeysContext } from '../../src/context/StoredKeysContext';
import { mock } from 'vitest-mock-extended';
import type { StoredKeys } from '../../src/persistence/StoredKeys/StoredKeys';

const encryptCallback = vi.fn();
const closeCallback = vi.fn();

beforeEach(() => {
  const contextMock = mock<StoredKeys>({
    getAll: async () => {
      return await Promise.resolve([]);
    }
  });
  render(
    <StoredKeysContext.Provider value={contextMock}>
      <EncryptDialog show={true} onClose={closeCallback} onEncrypt={encryptCallback} variant="encrypt" />
    </StoredKeysContext.Provider>
  );
});

afterEach(() => {
  cleanup();
});

const chooseOptionFromSelector = async (selectorLabelMatcher: Matcher, optionMatcher: Matcher): Promise<void> => {
  const selector = screen.queryByLabelText(selectorLabelMatcher);
  if (selector === null) throw Error();

  const option = within(selector).queryByText(optionMatcher);
  if (option === null) throw Error();

  await userEvent.selectOptions(selector, option);
};

it('has an algorithm selector', () => {
  const algorithmSelector = screen.queryByLabelText(/[Aa]lgorithm/);
  expect(algorithmSelector).not.toBeNull();
  if (algorithmSelector === null) throw Error();

  const symmetricOption = within(algorithmSelector).queryByText(/[^ ][Ss]ymmetric/);
  const assymetricOption = within(algorithmSelector).queryByText(/[Aa]symmetric/);
  expect(symmetricOption).not.toBeNull();
  expect(assymetricOption).not.toBeNull();
});

it('has a textbox for entering a key', async () => {
  await chooseOptionFromSelector(/How will you/, /text field/);

  const keyInput = screen.queryByLabelText(/^[Kk]ey/);
  expect(keyInput).not.toBeNull();
});

it('shows the correct tooltip when Symmetric encryption is selected', async () => {
  await chooseOptionFromSelector(/[Aa]lgorithm/, /^[Ss]ymmetric/);
  await chooseOptionFromSelector(/How will you/, /text field/);

  const infoSymbol = screen.queryByTestId('key-info-icon');
  if (infoSymbol === null) throw Error();

  fireEvent.mouseOver(infoSymbol);

  await waitFor(() => screen.getByRole('tooltip'));

  const tooltip = screen.queryByRole('tooltip');
  expect(tooltip?.innerHTML).toMatch(/AES-256/);
  expect(tooltip?.innerHTML).toMatch(/hex/);
});

it('shows the correct tooltip when Asymmetric encryption is selected', async () => {
  await chooseOptionFromSelector(/[Aa]lgorithm/, /[Aa]symmetric/);
  await chooseOptionFromSelector(/How will you/, /text field/);

  const infoSymbol = screen.queryByTestId('key-info-icon');
  if (infoSymbol === null) throw Error();

  fireEvent.mouseOver(infoSymbol);

  await waitFor(() => screen.getByRole('tooltip'));

  const tooltip = screen.queryByRole('tooltip');
  expect(tooltip?.innerHTML).toMatch(/pem/);
  expect(tooltip?.innerHTML).toMatch(/pkcs8/);
});
