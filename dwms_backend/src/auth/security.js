import argon2 from "argon2";
import bcrypt from "bcryptjs";

const HashConf = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 2,
  hashLength: 32,
};

export async function hashPassword(password) {
  return argon2.hash(password, HashConf);
}

export async function verifyPassword(storedHash, submittedPassword) {
  return argon2.verify(storedHash, submittedPassword);
}

export function needsRehash(storedHash) {
  return argon2.needsRehash(storedHash, HashConf);
}

export function isLegacyBcryptHash(storedHash) {
  return /^\$2[aby]\$/.test(storedHash);
}

export async function verifyLegacyPassword(storedHash, submittedPassword) {
  return bcrypt.compare(submittedPassword, storedHash);
}

export async function hashLegacyPassword(password) {
  return bcrypt.hash(password, 10);
}