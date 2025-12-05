// utils/imageHelpers.js
import sharp from 'sharp';
import path from 'path';
import { randomUUID } from 'crypto';

const uploadDiskPath = path.join(process.cwd(), 'uploads', 'items');
const uploadsBaseUrl = '/static/uploads';

export async function makeThumbnail(originalFilePath, opts = {}) {
  // opts: { width: 300, height: 300, fit: 'cover', quality: 80 }
  const { width = 300, height = 300, fit = 'cover', quality = 80 } = opts;
  const ext = path.extname(originalFilePath).toLowerCase();
  const thumbName = `thumb-${Date.now()}-${randomUUID()}${ext}`;
  const thumbPath = path.join(uploadDiskPath, thumbName);

  // create thumbnail from file on disk
  await sharp(originalFilePath)
    .resize({ width, height, fit })
    .jpeg({ quality, force: ext === '.jpg' || ext === '.jpeg' })
    .toFile(thumbPath);

  return {
    filename: thumbName,
    url: `${uploadsBaseUrl}/${thumbName}`,
    path: thumbPath
  };
}
