import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../jwt-secret.js';

const router = Router();

// No default password: the server refuses to start until ADMIN_PASSWORD is set.
if (!process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD must be set in .env.');
}

const getAdminConfig = () => ({
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD,
  displayName: process.env.ADMIN_DISPLAY_NAME || 'NACOS Admin',
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
