import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(file, folder = 'uploads') {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const originalName = file.name.toLowerCase();
    const extension = path.extname(originalName);
    const filename = `${uuidv4()}${extension}`;

    // Create the full path
    const uploadDir = path.join(process.cwd(), 'public', folder);
    const filepath = path.join(uploadDir, filename);

    // Ensure directory exists
    await createDirectory(uploadDir);

    // Write the file
    await writeFile(filepath, buffer);

    // Return the relative path for database storage
    return `/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

async function createDirectory(dirPath) {
  const fs = require('fs').promises;
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only images are allowed');
  }

  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }

  return true;
}
