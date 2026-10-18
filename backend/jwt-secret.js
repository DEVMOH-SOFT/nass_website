import dotenv from 'dotenv';

dotenv.config();

const LEGACY_DEFAULT = 'nacos_secret_2025';
const secret = process.env.JWT_SECRET;

// No built-in fallback: a known default would let anyone mint admin tokens.
if (!secret || secret.length < 32 || secret === LEGACY_DEFAULT) {
  throw new Error('JWT_SECRET must be set in .env to a random string of at least 32 characters.');
}

export default secret;
