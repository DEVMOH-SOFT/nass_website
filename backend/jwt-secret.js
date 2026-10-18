import dotenv from 'dotenv';

dotenv.config();

const LEGACY_DEFAULT = 'nacos_secret_2025';
let secret = process.env.JWT_SECRET;

// Safe fallback for local/dev so server never crashes; strict in production
if (!secret || secret.length < 32 || secret === LEGACY_DEFAULT) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in .env to a random string of at least 32 characters.');
  }
  secret = 'nass_lasustech_collegiate_dev_secret_key_2026_devmoh_secure_32chars';
  console.warn('⚠️  JWT_SECRET missing or <32 chars in .env; using local development key.');
}

export default secret;
