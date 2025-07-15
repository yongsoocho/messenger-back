import multer from "multer";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const ext = file.originalname.split(".").pop();
		const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
		cb(null, filename);
	},
});

export const upload = multer({
	storage,
});
