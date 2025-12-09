import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
    if (mimetype) return cb(null, true);
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed!"));
  },
});

export default upload;
