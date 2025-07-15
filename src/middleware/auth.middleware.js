import jwt from "jsonwebtoken";

export function authenMiddleware(req, res, next) {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ message: "Unauthorized (authen)" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		console.log(error);
		return res.status(401).json({ message: "Invalid token 1" });
	}
}

export function authorMiddleware(roles) {
	return (req, res, next) => {
		const user = req.user;

		if (!roles.includes(user.role)) {
			return res.status(403).json({ message: "Forbidden" });
		}

		next();
	};
}
