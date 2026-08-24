# 📌 StoryBoard

> **A tactile, sticky-note agile development board with real-time cloud sync, bilingual support (EN/TR), dark mode, and multi-device collaboration.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-22C55E.svg)

---

## ✨ Key Features

- 📝 **Tactile Post-it Aesthetics**:
  - Soothing pastel color palette (Butter Yellow, Powder Sky, Sage Mint, Blush Rose, Soft Lavender, Pastel Peach).
  - Masking tape strips, organic paper drop shadows, and subtle natural paper tilts.
- 📋 **4 Agile Workflow States**:
  - `Story` (Backlog & specifications)
  - `To Do` (Ready for development)
  - `In Progress` (Active development)
  - `Completed` (Finished tasks with celebratory confetti 🎉)
- 👤 **Multi-User Collaboration & Color Identity**:
  - Assign distinct personal avatar colors on sign-up / join.
  - **Assignee badge displayed in the bottom-right corner** of each sticky note with user color and avatar.
- 📱 **Multi-Device & Live Mobile Pairing**:
  - Real-time cloud sync ensures phone and PC are always synchronized.
  - **On-Screen QR Code**: Scan directly from your smartphone camera to join any sprint in 2 seconds.
- 🌓 **Dual Themes & 🌐 100% Bilingual**:
  - **Dark Slate** (`#0b0f19`) & **Light Desk** modes.
  - Complete instant switch between **English (🇬🇧 EN)** and **Türkçe (🇹🇷 TR)**.
- 🔒 **Cloud Authentication & Persistence**:
  - Connected to live **Supabase PostgreSQL** cloud database with secure bcrypt password hashing and JWT sessions.

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd StoryBoard
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` or create `.env`:
```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="storyboard-dev-secret-super-key-2025"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Sync Database & Seed Initial Demo Data
```bash
npx prisma db push
node prisma/seed.mjs
```

### 4. Start the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Demo Accounts

| Username | Password | Assigned Color | Role |
| :--- | :--- | :--- | :--- |
| **`enes`** | `dev1234` | 🔵 Blue (`#3B82F6`) | Board Owner |
| **`alex_dev`** | `dev1234` | 🟣 Purple (`#8B5CF6`) | Member |
| **`sara_ui`** | `dev1234` | 🟢 Emerald (`#10B981`) | Member |

- **Sample Board**: `Dev Sprint - Mobile & Web App` (Invite Code: `SPRINT1`).

---

## 🌐 How to Deploy to GitHub Pages (Step-by-Step)

This repository is already configured with an automated **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) that builds and deploys your site to GitHub Pages whenever you push to `main`.

### Step 1: Link & Push to Your GitHub Repository
Run in your terminal:
```bash
# Replace with your actual GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "feat: complete StoryBoard with Supabase and GitHub Pages deployment"
git branch -M main
git push -u origin main --force
```

### Step 2: Configure GitHub Pages in Your Repo Settings
1. Open your repository on GitHub.
2. Go to **Settings** (tab at the top) ➔ **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: Select **`GitHub Actions`** (instead of "Deploy from a branch").

### Step 3: Add Supabase Secrets to GitHub
To allow the GitHub Actions build to connect to your Supabase database:
1. In your GitHub repo, go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
2. Click **New repository secret** and add:
   - `DATABASE_URL`: Your Supabase transaction pooler URL (from your `.env`).
   - `DIRECT_URL`: Your Supabase direct connection URL (from your `.env`).
   - `JWT_SECRET`: `storyboard-dev-secret-super-key-2025`

### Step 4: Live Deployment 🎉
1. Go to the **Actions** tab in your GitHub repository.
2. You will see the **"Deploy StoryBoard to GitHub Pages"** workflow running automatically.
3. Once green, click the link to open your live website:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS with custom pastel & tactile paper textures
- **Database & ORM**: Supabase PostgreSQL with Prisma ORM
- **Drag and Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Authentication**: JWT (`jose`) & Password Hashing (`bcryptjs`)
- **QR Sharing**: `qrcode.react`
- **Icons**: `lucide-react`
- **Effects**: `canvas-confetti`
