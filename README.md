# LinkForge ⚡

**AI-powered bio link builder** — Build your perfect link-in-bio page in 30 seconds.

Think Linktree × Carrd × AI. One link for everything: portfolio, socials, products, contact.

🔗 **Live:** [linkforge.vercel.app](https://linkforge.vercel.app)

---

## ✨ Features

- **AI Page Generator** — Describe yourself in one sentence, AI builds your whole profile
- **Drag & Drop Links** — Reorder links with smooth drag-and-drop
- **5 Themes** — Minimal, Dark, Gradient, Glass, Retro
- **Live Preview** — See changes in real-time phone mockup
- **Analytics** — Track page views and link clicks
- **Pro Plan** — Unlimited links, themes, AI generations via Stripe
- **Custom Avatars** — Upload profile photo (Cloudinary)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon.tech) |
| ORM | Prisma |
| Auth | Custom HMAC session (httpOnly cookies) |
| AI | z-ai-web-dev-sdk |
| Payments | Stripe Checkout |
| Image Upload | Cloudinary |
| Animations | Framer Motion |
| Analytics | Custom (Prisma + PostgreSQL) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node.js 18+)
- [Neon.tech](https://neon.tech) account (free PostgreSQL)
- [Cloudinary](https://cloudinary.com) account (free image hosting)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/linkforge.git
cd linkforge
bun install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env` — see comments in `.env.example` for where to get each value.

**Minimum required for local dev:**
- `DATABASE_URL` + `DIRECT_URL` — from Neon.tech
- `NEXTAUTH_SECRET` — any random string

### 3. Set Up Database

```bash
# Push schema to your Neon PostgreSQL database
bunx prisma db push

# (Optional) Open Prisma Studio to view your data
bunx prisma studio
```

### 4. Run Locally

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from your `.env`
5. Click **Deploy**

### Step 3 — Run Migrations on Production DB

After first deploy, run migrations via Vercel CLI or Neon dashboard:

```bash
# Via Vercel CLI
vercel env pull .env.production
DATABASE_URL="your-direct-url" bunx prisma db push
```

---

## 📁 Project Structure

```
linkforge/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── [username]/        # Public profile pages
│   │   ├── api/               # API routes
│   │   │   ├── ai/generate/   # AI content generation
│   │   │   ├── analytics/     # Analytics data
│   │   │   ├── auth/          # Login, register, session
│   │   │   ├── links/         # CRUD + reorder
│   │   │   ├── settings/      # Profile + theme settings
│   │   │   ├── stripe/        # Checkout + webhook
│   │   │   ├── track/         # View + click tracking
│   │   │   └── upload/        # Cloudinary avatar upload
│   │   ├── contact/           # Contact page
│   │   ├── privacy/           # Privacy policy
│   │   └── terms/             # Terms of service
│   ├── components/
│   │   ├── auth/              # Login/signup forms
│   │   ├── dashboard/         # All dashboard panels
│   │   ├── landing/           # Marketing page
│   │   ├── preview/           # Live phone preview
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   └── lib/
│       ├── auth.ts            # Session management
│       ├── db.ts              # Prisma client
│       ├── store.ts           # Zustand global state
│       └── utils.ts           # Utilities
└── .env.example               # Environment variable template
```

---

## 🔒 Security

- Passwords hashed with SHA-256 + secret salt
- Session tokens signed with HMAC-SHA256 (30-day expiry)
- httpOnly cookies (XSS protected)
- All API routes verify session ownership
- Reserved usernames blocked (api, admin, dashboard, etc.)
- URL validation on all link inputs (http/https only)
- Stripe webhook signature verification

---

## 💰 Pricing

| Feature | Free | Pro ($5/mo) |
|---|---|---|
| Links | 8 | Unlimited |
| AI Generations | 3/month | Unlimited |
| Themes | 5 | 20+ |
| Analytics | 30-day | 90-day |
| Custom Domain | ❌ | ✅ |
| Remove Branding | ❌ | ✅ |

---

## 📝 License

MIT — built by [Nabin T.](https://github.com/YOUR_USERNAME)
