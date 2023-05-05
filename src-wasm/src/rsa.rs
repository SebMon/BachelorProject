use rand::{distributions::Uniform, Rng};
use ibig::{UBig, ubig};

const H_LEN: usize = 20;
const L_HASH: [u8; 20] = [218, 57, 163, 238, 94, 107, 75, 13, 50, 85, 191, 239, 149, 96, 24, 144, 175, 216, 7, 9];

pub fn rsa_encrypt(modulo: &Vec<u8>, exponent: &Vec<u8>, input: Vec<u8>) -> Vec<u8> {
  let key_length = modulo.len();
  let block_length = key_length - 2 * H_LEN - 2;
  let blocks = (input.len() + block_length - 1) / block_length; // Same as ceil(input.len() / block_length)
  
  let mut output: Vec<u8> = Vec::new();

  for i in 0..blocks {
    if (i + 1) * block_length > input.len() {
      output.append(&mut rsaes_oaep_encrypt(&modulo, &exponent, input[i * block_length..input.len()].to_vec()));
      break;
    }
    output.append(&mut rsaes_oaep_encrypt(&modulo, &exponent, input[i * block_length..(i + 1) * block_length].to_vec()));
  }
  output
}

pub fn rsa_decrypt(modulo: &Vec<u8>, exponent: &Vec<u8>, input: Vec<u8>) -> Vec<u8> {
  let key_length = modulo.len();
  let blocks = (input.len() + key_length - 1) / key_length; // Same as ceil(input.len() / key_length)
  let mut output: Vec<u8> = Vec::new();

  for i in 0..blocks - 1 {
    output.append(&mut rsaes_oaep_decrypt(&modulo, &exponent, input[i * key_length..(i + 1) * key_length].to_vec()));
  }
  output.append(&mut rsaes_oaep_decrypt(&modulo, &exponent, input[(blocks - 1) * key_length..blocks * key_length].to_vec()));
  output
}

pub fn rsaes_oaep_encrypt (modulo: &Vec<u8>, exponent: &Vec<u8>, mut input: Vec<u8>) -> Vec<u8> {
  let k = modulo.len();

  if input.len() > k - 2 * H_LEN - 2 {
    panic!("Input too long");
  }

  let mut ps: Vec<u8> = vec![0; k - input.len() - 2 * H_LEN - 2];

  let mut db: Vec<u8> = Vec::new();

  db.append(&mut L_HASH.to_vec());
  db.append(&mut ps);
  db.push(1);
  db.append(&mut input);
  while db.len() < k - H_LEN - 1 {
    db.push(0);
  }

  let mut rng = rand::thread_rng();
  let range = Uniform::new(0, 255);
  let seed: Vec<u8> = (0..H_LEN).map(|_| rng.sample(&range)).collect();
  
  let db_mask = mgf(&seed, k - H_LEN - 1);
  let mut masked_db = xor(&db, &db_mask);
  let seed_mask = mgf(&masked_db, H_LEN);
  let mut masked_seed = xor(&seed, &seed_mask);

  let mut em: Vec<u8> = Vec::new();
  em.push(0); 
  em.append(&mut masked_seed);
  em.append(&mut masked_db);
  while em.len() < k {
    em.push(0);
  }

  let m = os2ip(&em);

  let c = rsaep(&modulo, &exponent, m);

  i2osp(c, k.try_into().expect("K is too big"))
}

pub fn rsaes_oaep_decrypt(modulo: &Vec<u8>, exponent: &Vec<u8>, input: Vec<u8>) -> Vec<u8> {
  let k = modulo.len();
  if input.len() != k {
    panic!("Decryption error");
  }

  if k < 2 * H_LEN + 2 {
    panic!("Decryption error");
  }  

  let c = os2ip(&input);

  let m = rsadp(&modulo, &exponent, c);

  let em = i2osp(m, k.try_into().expect("K is too big"));

  let masked_seed = em[1..1 + H_LEN].to_vec();
  let masked_db = em[1 + H_LEN..em.len()].to_vec();

  let seed_mask = mgf(&masked_db, H_LEN);

  let seed = xor(&masked_seed, &seed_mask);

  let db_mask = mgf(&seed, k - H_LEN - 1);

  let db = xor(&masked_db, &db_mask);

  for i in 0..H_LEN {
    if db[i] != L_HASH[i] {
      panic!("Decryption error");
    }
  }

  let mut i = H_LEN;
  while db[i] != 0x01 {
    i += 1;
  }
  i += 1;

  db[i..db.len()].to_vec()
}

// Something is wrong here -> the last few bits are just 0
fn mgf(mgf_seed: &[u8], mask_len: usize) -> Vec<u8> {
  if mask_len as u64 > (2_u64.pow(32)) * (H_LEN as u64) {
    panic!("Mask too long");
  }

  let mut t: Vec<u8> = vec![0; mask_len + (mask_len - (mask_len % H_LEN))];

  let f_mask_len = mask_len as f32;
  let f_h_len = H_LEN as f32;

  let mut i: usize = 0;
  while i < (f_mask_len / f_h_len).ceil() as usize {
    let mut c = i2osp((i as usize).into(), 4);
    let mut concated: Vec<u8> = Vec::new();
    concated.append(&mut mgf_seed.clone().to_vec());
    concated.append(&mut c);
    while concated.len() < mgf_seed.len() + 4 {
      concated.push(0);
    }

    let mut hasher = sha1_smol::Sha1::new();
    hasher.update(&concated);
    t = set_vector(t, hasher.digest().bytes().to_vec(), i * H_LEN);

    i += 1;
  }

  t[0..mask_len].to_vec()
}

fn i2osp(input: UBig, x_len: usize) -> Vec<u8> {
  let big_256 = ubig!(256);

  if input > big_256.pow(x_len)  {
    panic!("Integer too large");
  }

  let mut out: Vec<u8> = vec![0; x_len as usize];
  for i in 1..=x_len {
    let result = (input.clone() % big_256.pow(i)) / big_256.pow(i - 1);
    if result == ubig!(0) {
      out[x_len  - i] = 0;
    } else {
      out[x_len  - i] = u8::from_be_bytes(result.to_be_bytes().try_into().unwrap());
    } 
  }

  out
}

fn os2ip(input: &[u8]) -> UBig {
  let big_256 = ubig!(256);

  let len = input.len();
  let mut x = ubig!(0);

  for i in 1..=len {
    x += input[len - i] * big_256.clone().pow(i - 1);
  }
  x
}

fn rsaep(modulo: &[u8], exponent: &[u8], m: UBig) -> UBig {
  if !(m >= ubig!(0) && m <= os2ip(&modulo) - 1) {
    panic!("Message repressentative out of range");
  }
  mod_exp(m, os2ip(&exponent), os2ip(&modulo))
}

fn rsadp(modulo: &[u8], exponent: &[u8], c: UBig) -> UBig {
  if !(c >= ubig!(0) && c <= os2ip(modulo) - 1) {
    panic!("Ciphertext repressantative out of range");
  }
  mod_exp(c, os2ip(exponent), os2ip(modulo))
}

fn xor(x: &[u8], y: &[u8]) -> Vec<u8> {
  let mut result: Vec<u8> = vec![0; x.len()];
  for i in 0..x.len() {
    result[i] = x[i] ^ y[i];
  }
  result
}

fn mod_exp(mut base: UBig, mut exponent: UBig, modulo: UBig) -> UBig {
  let mut result = ubig!(1);
  let big_0 = ubig!(0);
  base = base % &modulo;
  while &exponent > &big_0 {
    if &exponent % &2_u8 == 1 {
      result = (&result * &base) % &modulo;
    }
    exponent = exponent / 2_u8;
    base = base.pow(2) % &modulo;
  }  
  result
}

fn set_vector(mut target: Vec<u8>, input: Vec<u8>, offset: usize) -> Vec<u8> {
  if target.len() - offset < input.len() {
    panic!("no room for vector");
  }
  for i in offset..(offset + input.len()) {
    target[i] = input[i - offset];
  }
  return target
}