use crate::aes::utils::{add_round_key, sub_bytes};

use self::utils::{key_expansion, shift_rows, mix_columns, inv_shift_rows, inv_sub_bytes, inv_mix_columns};

mod utils;

pub fn aes_encrypt(input: Vec<u8>, key: Vec<u8>) -> Vec<u8> {
  let rounds = 14;
  let words_in_key = 8;

  let data = pad_data(input);
  let length = data.len();
  let blocks = length / 16;

  let mut decoded: Vec<u8> = Vec::new();
  let expanded_key = key_expansion(&key, &rounds, &words_in_key);

  for i in 0..blocks {
    decoded.append(&mut cipher(&data[16 * i .. 16 * (i + 1)], &expanded_key, &rounds));
  }

  decoded
}

pub fn aes_decrypt(input: Vec<u8>, key: Vec<u8>) -> Vec<u8> {
  let rounds: usize = 14;
  let words_in_key: usize = 8;

  let length = input.len();
  let blocks = length / 16;

  let mut decoded: Vec<u8> = Vec::new();
  let expanded_key = key_expansion(&key, &rounds, &words_in_key);

  for i in 0..blocks {
    decoded.append(&mut inv_cipher(&input[16 * i .. 16 * (i + 1)], &expanded_key, &rounds));
  }

  unpad_data(decoded)
}

fn pad_data(mut input: Vec<u8>) -> Vec<u8> {
  let pad_length: usize = 16 - (input.len() % 16);
  input.resize_with(input.len() + pad_length, || { pad_length as u8 });
  input
}

fn unpad_data(mut input: Vec<u8>) -> Vec<u8> {
  let input_length = input.len();
  let padding_length = input[input_length - 1];
  for _i in 0..padding_length {
    input.pop();
  }
  input
}

fn cipher(state: &[u8], round_keys: &Vec<Vec<u8>>, rounds: &usize) -> Vec<u8> {
  let mut state = add_round_key(&state, &round_keys[0..4]);
  for round in 1..*rounds {
    state = sub_bytes(&state);
    state = shift_rows(&state);
    state = mix_columns(&state);
    state = add_round_key(&state, &round_keys[4 * round .. 4 * (round + 1)]);
  }
  state = sub_bytes(&state);
  state = shift_rows(&state);
  state = add_round_key(&state, &round_keys[4 * rounds .. 4 * (rounds + 1)]);

  state
}

fn inv_cipher(state: &[u8], round_keys: &Vec<Vec<u8>>, rounds: &usize) -> Vec<u8> {
  let mut state = add_round_key(&state, &round_keys[4 * rounds .. 4 * (rounds + 1)]);
  for round in (1..*rounds).rev() {
    state = inv_shift_rows(&state);
    state = inv_sub_bytes(&state);
    state = add_round_key(&state, &round_keys[4 * round .. 4 * (round + 1)]);
    state = inv_mix_columns(&state);
  }

  state = inv_shift_rows(&state);
  state = inv_sub_bytes(&state);
  state = add_round_key(&state, &round_keys[0 .. 4]);

  state
}