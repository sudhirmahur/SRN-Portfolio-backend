import 'dotenv/config';

const list = (value) =>
  (value || '')
    .split(',')
    .map((v) => v.trim().replace(/\/$/, ''))
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: list(process.env.CLIENT_URL),
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || '',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: (process.env.CLOUDINARY_FOLDER || 'portfolio').replace(/^\/+|\/+$/g, ''),
  },
};

export function validateEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. Copy .env.example to .env and fill the values.`
    );
  }
  if (env.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET is too short. Use at least 16 characters (preferably 48+).');
  }
}
