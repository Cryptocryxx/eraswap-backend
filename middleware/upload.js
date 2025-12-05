import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Absolute path where files are stored
const uploadDir = path.join(process.cwd(), 'uploads', 'items');

// Ensure directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Storage engine: filename = timestamp + UUID + extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const newName = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, newName);
  }
});

// Allow only image files
const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, cb) => {
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, GIF images are allowed'), false);
  }
};

// 6 MB limit per file
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024 // 6 MB
  }
});
