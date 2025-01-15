import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directories exist
['avatars', 'banners'].forEach((dir) => {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

export async function uploadFile(
  file: File,
  folder: 'avatars' | 'banners'
): Promise<string> {
  if (!file) return '';

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${randomUUID()}-${file.name}`;
  const filePath = path.join(UPLOAD_DIR, folder, fileName);

  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
