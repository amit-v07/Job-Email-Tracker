# 📬 Job Email Tracker

<div align="center">

**A self-hosted, intelligent Gmail tracker built to organize your job search — automatically.**

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailscale](https://img.shields.io/badge/Tailscale-1A1A1A?style=for-the-badge&logo=tailscale&logoColor=white)

</div>

---

## ✨ Features

- 📥 **Dual Gmail monitoring** — track Work and Personal accounts simultaneously via OAuth
- 🏷️ **Smart status tracking** — New, Applied, Assessment Pending, Interview Scheduled, Rejected
- 😴 **Email snoozing** — pause emails and resurface them at 3h, 12h, tomorrow 9 AM, or 2 days
- 🔗 **Link extraction** — auto-extracts application/portal URLs from email bodies
- 🔄 **Auto background sync** — polls Gmail every 5 minutes automatically
- 🌙 **Beautiful dark UI** — sleek dark-mode React dashboard
- 🔒 **Self-hosted & private** — your data never leaves your own server
- 🌐 **Remote access via Tailscale** — securely access from anywhere without port-forwarding

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│            Your Browser             │
│   http://mac-server.ts.net:3080     │
└──────────────┬──────────────────────┘
               │ Tailscale VPN
    ┌──────────▼──────────────────┐
    │        Home Server          │
    │  ┌──────────────────────┐   │
    │  │   React Frontend     │   │  :3080
    │  │   (Vite + Tailwind)  │   │
    │  └──────────┬───────────┘   │
    │             │ /api proxy    │
    │  ┌──────────▼───────────┐   │
    │  │   FastAPI Backend    │   │  :8000
    │  │   + Gmail OAuth      │   │
    │  └──────────┬───────────┘   │
    │             │               │
    │  ┌──────────▼───────────┐   │
    │  │    PostgreSQL DB     │   │  :5432
    │  └──────────────────────┘   │
    └─────────────────────────────┘
```

---

## 🚀 Quick Start (Local)

### Prerequisites

- Docker & Docker Compose
- A Google Cloud project with Gmail API enabled
- OAuth 2.0 credentials (Client ID + Secret)

### 1. Clone the repo

```bash
git clone https://github.com/amit-v07/Job-Email-Tracker.git
cd Job-Email-Tracker
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```ini
DATABASE_URL=postgresql://postgres:postgres@db:5432/job_tracker

BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3080

GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-random-secret-key
```

### 3. Run

```bash
docker-compose up --build
```

Open **`http://localhost:3080`** and click **Work Login** / **Personal Login** to authenticate.

---

## 🏠 Home Server Deployment (Tailscale)

### Prerequisites

- Tailscale installed on your home server & client devices
- [MagicDNS enabled](https://login.tailscale.com/admin/dns) in your Tailscale admin console
- Portainer (optional, but recommended)

### 1. Get your MagicDNS hostname

```bash
tailscale status
# Your server shows as: mac-server.tail1921db.ts.net
```

### 2. Add Google OAuth Redirect URI

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):

```
http://mac-server.tail1921db.ts.net:8000/auth/callback
```

> Replace `mac-server.tail1921db.ts.net` with your actual Tailscale MagicDNS hostname.

### 3. Configure `.env` on the server

```ini
DATABASE_URL=postgresql://postgres:postgres@db:5432/job_tracker

BACKEND_URL=http://mac-server.tail1921db.ts.net:8000
FRONTEND_URL=http://mac-server.tail1921db.ts.net:3080

GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-random-secret-key
```

### 4. Deploy via Portainer

1. In Portainer → **Stacks** → **Add Stack** → **Git Repository**
2. Set repo URL: `https://github.com/amit-v07/Job-Email-Tracker`
3. Add environment variables from your `.env`
4. Deploy

### 5. Open the Tailscale firewall

```bash
sudo ufw allow in on tailscale0
sudo ufw reload
```

### 6. Access

```
http://mac-server.tail1921db.ts.net:3080
```

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **Enable Gmail API**
3. **OAuth Consent Screen** → External → Add test users (your Gmail addresses)
4. **Credentials** → Create OAuth 2.0 Client ID → Web Application
5. Add Authorized Redirect URIs:
   - `http://localhost:8000/auth/callback` ← for local dev
   - `http://mac-server.tail1921db.ts.net:8000/auth/callback` ← for home server

---

## 📁 Project Structure

```
Job-Email-Tracker/
├── backend/
│   ├── Dockerfile
│   ├── main.py            # FastAPI app, CORS, routers
│   ├── models.py          # SQLAlchemy models (Email, OAuthToken)
│   ├── database.py        # DB connection
│   ├── scheduler.py       # Background polling jobs
│   ├── services/
│   │   └── gmail_fetcher.py  # Gmail API integration
│   └── routers/
│       ├── auth.py        # OAuth flow
│       └── emails.py      # Email CRUD API
├── frontend/
│   ├── Dockerfile
│   ├── vite.config.js     # Vite + proxy config
│   └── src/
│       ├── App.jsx         # Main dashboard
│       ├── hooks/
│       │   └── useEmails.js
│       ├── services/
│       │   └── api.js      # API client (proxied via /api)
│       └── components/
│           ├── EmailCard.jsx
│           └── ErrorBoundary.jsx
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 15 |
| Auth | Google OAuth 2.0 (Gmail API) |
| Container | Docker + Docker Compose |
| Deployment | Portainer |
| Remote Access | Tailscale MagicDNS |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/emails` | List emails (filterable) |
| `POST` | `/emails/fetch` | Trigger manual Gmail sync |
| `PATCH` | `/emails/{id}` | Update status / snooze |
| `DELETE` | `/emails/{id}` | Dismiss email |
| `GET` | `/auth/gmail/{account}` | Start OAuth for work/personal |
| `GET` | `/auth/callback` | OAuth callback |

---

## 📄 License

MIT — do whatever you want with it.

---

<div align="center">
  Built with ☕ to stop missing job application deadlines.
</div>
