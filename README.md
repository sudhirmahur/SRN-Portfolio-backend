# Sudhir Mahur — Portfolio Backend (Node.js + Express + MongoDB + Cloudinary)

REST API jo portfolio ka poora data (profile, pages/menu, projects, experience, skills, education, messages) MongoDB me rakhta hai, images/resume Cloudinary par upload karta hai, aur admin login JWT se karta hai.

## 1. Setup

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
# .env me values bharo (neeche dekho)
npm run dev               # development  (ya: npm start)
```

Server `http://localhost:5000` par chalega.

### `.env` values
| Key | Kya daalna hai |
|---|---|
| `MONGO_URI` | Local MongoDB ya MongoDB Atlas connection string |
| `JWT_SECRET` | Lamba random string (48+ chars) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Pehla admin login (server pehli baar start hote hi bana deta hai) |
| `CLIENT_URL` | Frontend ka URL (comma se multiple: `http://localhost:5173,https://yoursite.vercel.app`) |
| `CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET` | Cloudinary dashboard se |
| `CLOUDINARY_FOLDER` | Cloudinary me folder ka naam (default `sudhir-portfolio`) |

### Multi-user system
- **Super admin** = `.env` ke `ADMIN_EMAIL/ADMIN_PASSWORD` wala account (server pehli baar start hote hi ban jata hai). Iska apna portfolio `/p/<ADMIN_SLUG>` par hota hai (aapka purana Sudhir Mahur content).
- Koi bhi **Register** kar sakta hai (`/admin/register`): name, email, password (min 6) zaroori; photo, title, job, education, location, phone optional. Har user ka **alag portfolio** banta hai: `/p/<uski-url-naam>`; wo sirf apna data dekh/edit kar sakta hai.
- Super admin saare users, unki profile details aur portfolio URLs dekh sakta hai, block/unblock ya delete kar sakta hai (content edit nahi kar sakta).
- Har user apne portfolio ke colors, fonts, background aur URL badal sakta hai (Admin -> Design & link).
- Purani (single-user) database ho to pehli start par uska data automatically super admin ke portfolio se jud jata hai.
- `npm run seed:force` — super admin ke portfolio ko sample content par reset karta hai.

### Cloudinary note (resume PDF)
Cloudinary free account par PDF delivery band ho sakti hai. Resume upload karne se pehle: Cloudinary Console → Settings → Security → **"PDF and ZIP files delivery"** ko **enable** karo. Warna PDF link 401 dega.

## 2. API

Public:
- `GET /api/portfolios` — published portfolios list
- `GET /api/p/:slug/site` — profile + visible pages + theme
- `GET /api/p/:slug/pages/:pageSlug`, `/projects[?featured=true]`, `/experience`, `/skills`, `/education`
- `POST /api/p/:slug/contact` — contact form (rate limited, honeypot)
- `GET /api/health`

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/slug-check?slug=`, `GET|PUT /api/auth/me`, `PUT /api/auth/password`

Super admin: `GET /api/superadmin/users`, `PATCH|DELETE /api/superadmin/users/:id`

Admin (Bearer token): `/api/admin/portfolio` (url, publish, theme), `/api/admin/profile`, `/pages`, `/projects`, `/experience`, `/skills`, `/education`, `/certifications` (GET, POST, PUT /:id, DELETE /:id, PUT /reorder), `/messages`, `/stats`

Upload (Bearer): `POST /api/upload/image?folder=projects|profile|pages|misc`, `POST /api/upload/file` (resume); public (register ke time photo): `POST /api/upload/public-avatar`

Jab koi image replace/delete hoti hai ya item delete hota hai, Cloudinary se purani file automatically hat jati hai.

## 3. Deploy (Render / Railway)
- Build command: `npm install`, Start command: `npm start`
- Saari `.env` values dashboard me environment variables me daalo, `NODE_ENV=production`, `CLIENT_URL` = deployed frontend URL.
