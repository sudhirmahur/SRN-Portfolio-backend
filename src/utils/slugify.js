export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export const RESERVED_SLUGS = [
  'home', 'about', 'experience', 'skills', 'projects', 'education', 'contact',
  'admin', 'api', 'login', 'assets', 'static',
];
