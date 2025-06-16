export function notFoundHandler(req, res) {
	res.status(404).json({
		status: "error",
		message: "Not Found",
	});
}

export function errorHandler(err, req, res, next) {
	res.status(err.status || 500).json({
		status: "error",
		message: err.message || "Internal Server Error",
	});

	console.error(err);
}
