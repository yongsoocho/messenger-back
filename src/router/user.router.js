import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const router = Router();

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.post('/signup', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  // const newUser = await prisma...
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.cookie('token', token, {
    httpOnly: true,			// XSS 방어. JS로 접근 불가
    secure: true,			// https 환경에서만 사용 (개발 시 false 가능)
    sameSite: 'lax',		// CSRF 방지 설정
    maxAge: 15 * 60 * 1000	// 15분
  });
  return res.json({ message: 'Logged in' });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
	
  // const user = await prisma...
  if (!user) return res.status(401).json({ error: 'No user' });

  const isMatch = await bcrypt.compare(password, userFromDb.hashedPassword);
  if (!isMatch) return res.status(401).json({ error: 'Password error' });
	
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.cookie('token', token, {
    httpOnly: true,			// XSS 방어. JS로 접근 불가
    secure: true,			// https 환경에서만 사용 (개발 시 false 가능)
    sameSite: 'lax',		// CSRF 방지 설정
    maxAge: 15 * 60 * 1000	// 15분
  });
  return res.json({ message: 'Logged in' });
});

router.get('/profile', (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded.email });
  } catch (err) {
    res.status(403).json({ error: 'Token expired or invalid' });
  }
});