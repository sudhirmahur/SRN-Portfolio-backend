import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

/**
 * Walk any plain object / array and collect every Cloudinary file reference
 * (an object that has a non-empty `publicId`).
 */
export function collectFiles(value, found = new Map()) {
  if (!value || typeof value !== 'object') return found;
  if (Array.isArray(value)) {
    value.forEach((item) => collectFiles(item, found));
    return found;
  }
  if (typeof value.publicId === 'string' && value.publicId) {
    found.set(value.publicId, value.resourceType || 'image');
  }
  Object.values(value).forEach((child) => {
    if (child && typeof child === 'object') collectFiles(child, found);
  });
  return found;
}

export async function deleteCloudFile(publicId, resourceType = 'image') {
  if (!publicId || !isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (err) {
    console.error(`Cloudinary delete failed for ${publicId}:`, err.message);
  }
}

/** Delete files that exist in `before` but not in `after`. */
export async function deleteRemovedFiles(before, after = {}) {
  const oldFiles = collectFiles(before);
  const newFiles = collectFiles(after);
  const removed = [...oldFiles.entries()].filter(([id]) => !newFiles.has(id));
  await Promise.all(removed.map(([id, type]) => deleteCloudFile(id, type)));
}

export function plain(doc) {
  return doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
}
