import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import JWT_SECRET from '../jwt-secret.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const router = Router();

const getAdminConfig = () => ({
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin_nass2026',
  displayName: process.env.ADMIN_DISPLAY_NAME || 'NASS LASUSTECH Admin',
});

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = getAdminConfig();

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required.' });
    return;
  }

  if (!safeEqual(username, admin.username) || !safeEqual(password, admin.password)) {
    res.status(401).json({ message: 'Invalid admin credentials.' });
    return;
  }

  const token = jwt.sign(
    {
      id: 'admin-console',
      name: admin.displayName,
      username: admin.username,
      role: 'admin',
    },
    JWT_SECRET,
    { expiresIn: '12h' },
  );

  res.json({
    status: 'success',
    token,
    user: {
      id: 'admin-console',
      name: admin.displayName,
      username: admin.username,
      role: 'admin',
    },
  });
});

export default router;
