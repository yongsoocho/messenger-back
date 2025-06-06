import jwt from "jsonwebtoken";

export function requireUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
	
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

}

export default function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ error: 'User role not found' });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: `Requires ${role} access` });
    }

    next();
  };
}
