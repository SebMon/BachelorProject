use wasm_bindgen::prelude::*;

mod aes;
mod rsa;

#[wasm_bindgen]
pub fn fib(a: i32) -> i32 {
    if a<=1 {
        return a
    }
    return fib(a-1) + fib(a-2)
}

#[wasm_bindgen]
pub fn aes_encrypt(data: Vec<u8>, key: Vec<u8>) -> Vec<u8> {
    aes::aes_encrypt(data, key)
}

#[wasm_bindgen]
pub fn aes_decrypt(data: Vec<u8>, key: Vec<u8>) -> Vec<u8> {
    aes::aes_decrypt(data, key)
}

#[wasm_bindgen]
pub fn rsa_encrypt(data: Vec<u8>, modulo: Vec<u8>, exponent: Vec<u8>) -> Vec<u8> {
    rsa::rsa_encrypt(&modulo, &exponent, data)
}

#[wasm_bindgen]
pub fn rsa_decrypt(data: Vec<u8>, modulo: Vec<u8>, exponent: Vec<u8>) -> Vec<u8> {
    rsa::rsa_decrypt(&modulo, &exponent, data)
}