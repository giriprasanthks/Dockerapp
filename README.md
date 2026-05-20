# 🌿 GardenApp — Dockerised 3-Tier Application

A full-stack **gardening management** web application built as a **3-tier Docker architecture** running on a single Ubuntu EC2 instance.

```
┌─────────────────────────────────────────────────────┐
│                    EC2 Ubuntu Instance               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  TIER 1 – FRONTEND                           │   │
│  │  Nginx (port 80)  +  Vanilla JS SPA          │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │ /api/* proxy                 │
│  ┌────────────────────▼─────────────────────────┐   │
│  │  TIER 2 – BACKEND                            │   │
│  │  Flask 3  +  Gunicorn (port 5000, internal)  │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │ SQLAlchemy / PyMySQL          │
│  ┌────────────────────▼─────────────────────────┐   │
│  │  TIER 3 – DATABASE                           │   │
│  │  MySQL 8.3 (port 3306, internal only)        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Dockerapp/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask factory & extensions
│   │   ├── models.py            # SQLAlchemy models
│   │   └── routes/
│   │       ├── auth.py          # /api/auth  (register, login, me)
│   │       ├── plants.py        # /api/plants
│   │       ├── plots.py         # /api/plots  (garden plots + plants)
│   │       └── tasks.py         # /api/tasks  (care reminders)
│   ├── run.py                   # Gunicorn entry-point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── templates/
│   │   └── index.html           # Single-page app shell
│   └── static/
│       ├── css/style.css
│       └── js/app.js            # Full SPA logic (vanilla JS)
├── nginx/
│   └── default.conf             # Reverse proxy + static files
├── db/
│   └── init.sql                 # Schema + seed data (8 plants)
├── docker-compose.yml           # Orchestrates all 3 tiers
├── Dockerfile.frontend          # Nginx image
└── .env                         # Environment variables
```

---

## 🚀 Quick Start — EC2 Ubuntu

### 1. Install Docker & Docker Compose

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose v2
sudo apt-get install -y docker-compose-plugin
docker compose version   # should show v2.x
```

### 2. Clone the repository

```bash
git clone https://github.com/giriprasanthks/Dockerapp.git
cd Dockerapp
```

### 3. Configure environment (optional – defaults work out of the box)

```bash
cp .env .env.local   # if you want to keep changes separate
# Edit passwords / JWT_SECRET for production
nano .env
```

### 4. Build & start all services

```bash
docker compose up --build -d
```

Watch the logs:
```bash
docker compose logs -f
```

### 5. Open in browser

```
http://<EC2-PUBLIC-IP>
```

> **EC2 Security Group**: make sure inbound **port 80 (HTTP)** is open.

---

## 🔒 EC2 Security Group Rules

| Type  | Protocol | Port | Source    |
|-------|----------|------|-----------|
| HTTP  | TCP      | 80   | 0.0.0.0/0 |
| SSH   | TCP      | 22   | Your IP   |

MySQL (3306) is **internal only** — never expose it.

---

## 🛠 Useful Commands

```bash
# View running containers
docker compose ps

# Restart a single service
docker compose restart backend

# Rebuild after code changes
docker compose up --build -d frontend
docker compose up --build -d backend

# View backend logs
docker compose logs -f backend

# Connect to MySQL
docker compose exec db mysql -u gardenuser -pgardenpass gardendb

# Stop everything
docker compose down

# Stop and wipe the database
docker compose down -v
```

---

## 🌐 API Reference

| Method | Endpoint                           | Auth | Description           |
|--------|-----------------------------------|------|-----------------------|
| POST   | /api/auth/register                | No   | Create account        |
| POST   | /api/auth/login                   | No   | Get JWT token         |
| GET    | /api/auth/me                      | JWT  | Current user          |
| GET    | /api/plants/                      | No   | List plant catalogue  |
| GET    | /api/plants/?category=Vegetable   | No   | Filter by category    |
| GET    | /api/plots/                       | JWT  | My garden plots       |
| POST   | /api/plots/                       | JWT  | Create plot           |
| DELETE | /api/plots/\<id\>                 | JWT  | Delete plot           |
| GET    | /api/plots/\<id\>/plants          | JWT  | Plants in a plot      |
| POST   | /api/plots/\<id\>/plants          | JWT  | Add plant to plot     |
| PATCH  | /api/plots/\<id\>/plants/\<ppid\> | JWT  | Update plant status   |
| GET    | /api/tasks/                       | JWT  | My care tasks         |
| POST   | /api/tasks/                       | JWT  | Create task           |
| PATCH  | /api/tasks/\<id\>                 | JWT  | Update/complete task  |
| DELETE | /api/tasks/\<id\>                 | JWT  | Delete task           |
| GET    | /api/health                       | No   | Backend health check  |

---

## 🌱 Features

- **Plant Catalogue** — 8 pre-seeded plants (Flowers, Vegetables, Herbs) with care info
- **Garden Plots** — Create and manage plots, add/remove plants, track growth status
- **Care Tasks** — Reminders with due dates, overdue highlighting, complete/delete
- **JWT Auth** — Secure register/login, all user data is isolated
- **Responsive UI** — Clean green-themed SPA, works on mobile

---

## 🐳 Architecture Notes

- **Nginx** serves static files with 7-day cache and proxies `/api/*` to Flask
- **Flask + Gunicorn** runs with 4 workers; waits for MySQL on startup
- **MySQL** data is persisted via Docker named volume `mysql_data`
- **Networks**: `frontend_net` (nginx↔backend) and `backend_net` (backend↔db) are isolated
- **Health checks** ensure services start in the correct dependency order
