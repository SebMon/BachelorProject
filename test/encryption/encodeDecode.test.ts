import { expect, it } from 'vitest';
import {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToText,
  hexToBytes,
  textToBytes
} from '../../src/encryption/encodeDecode';

it('converts text to bytes', () => {
  const input = 'test';
  const bytes = textToBytes(input);
  expect(bytes[0]).toBe(116);
  expect(bytes[1]).toBe(101);
  expect(bytes[2]).toBe(115);
  expect(bytes[3]).toBe(116);
});

it('converts bytes to text', () => {
  const input = new Uint8Array([116, 101, 115, 116]);
  const string = bytesToText(input);
  expect(string).toBe('test');
});

it('converts hex to bytes', () => {
  const input = '74657374';
  const bytes = hexToBytes(input);
  expect(bytes[0]).toBe(116);
  expect(bytes[1]).toBe(101);
  expect(bytes[2]).toBe(115);
  expect(bytes[3]).toBe(116);
});

it('converts bytes to hex', () => {
  const input = new Uint8Array([116, 101, 115, 116]);
  const hex = bytesToHex(input);
  expect(hex).toBe('74657374');
});

it('converts base64 to bytes', () => {
  const input = 'dGVzdA==';
  const bytes = base64ToBytes(input);
  expect(bytes[0]).toBe(116);
  expect(bytes[1]).toBe(101);
  expect(bytes[2]).toBe(115);
  expect(bytes[3]).toBe(116);
});

it('converts bytes to base64', () => {
  const input = new Uint8Array([116, 101, 115, 116]);
  const hex = bytesToBase64(input);
  expect(hex).toBe('dGVzdA==');
});
