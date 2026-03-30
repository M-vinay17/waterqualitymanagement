# DEPLOYMENT.md — WaterWatch Production Deployment Runbook

> **Maintainer:** BE-2 intern  
> **Last updated:** Milestone 4, Week 8  
> **Target environment:** Linux VM (Ubuntu 22.04 LTS recommended)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Build and Start Services](#4-build-and-start-services)
5. [Run Database Migrations](#5-run-database-migrations)
6. [Verify the Deployment](#6-verify-the-deployment)
7. [Stopping and Restarting](#7-stopping-and-restarting)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Ensure the following are installed on the Linux VM before proceeding.

### Required software

| Tool | Minimum version | Check command |
|---|---|---|
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x (plugin) | `docker compose version` |
| Git | 2.x | `git --version` |
| Make | 4.x | `make --version` |

### Install Docker (Ubuntu)

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER   # allow running docker without sudo (re-login after this)
```

### VM minimum specs

- CPU: 2 vCPUs
- RAM: 4 GB
- Disk: 20 GB free
- Ports open: 80 (HTTP), 443 (HTTPS if using SSL), 22 (SSH)

---

## 2. Clone the Repository

```bash
git clone https://github.com/<your-org>/waterwatch.git
cd waterwatch
```

Verify you are on the correct branch:

```bash
git checkout main
git pull origin main
```

---

## 3. Configure Environment Variables

Copy the example env file and fill in real values:

```bash
cp .env.example .env.production
nano .env.production
```

### Required variables

```env
# Database
DB_URL=postgresql://waterwatch:yourpassword@db:5432/waterwatch
POSTGRES_USER=waterwatch
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=waterwatch

# Auth
SECRET_KEY=your-very-long-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Backend
BACKEND_CORS_ORIGINS=["http://localhost","http://localhost:80"]

# External APIs
CPCB_API_KEY=your-cpcb-api-key

# Redis (optional, for future Celery use)
REDIS_URL=redis://redis:6379/0
```

### Generating a secure SECRET_KEY

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste it as the value of `SECRET_KEY`.

> **Important:** Never commit `.env.production` to Git. It is already listed in `.gitignore`.

---

## 4. Build and Start Services

```bash
make up
```

This runs `docker compose --env-file .env.production up --build -d` under the hood. It will:

1. Build the React frontend and copy the production bundle into the Nginx image
2. Build the FastAPI backend image
3. Pull `postgres:15-alpine` and `redis:7-alpine` from Docker Hub
4. Start all four containers in detached mode

First build takes 3–5 minutes. Subsequent builds are faster due to layer caching.

### Check that all services are running

```bash
make logs
# or
docker compose ps
```

Expected output — all four services should show status `running` or `Up`:

```
NAME                STATUS
waterwatch-frontend   Up (healthy)
waterwatch-backend    Up (healthy)
waterwatch-db         Up (healthy)
waterwatch-redis      Up
```

---

## 5. Run Database Migrations

After services are up, run Alembic migrations to create/update all tables:

```bash
make migrate
```

This executes `alembic upgrade head` inside the backend container.

Expected output ends with something like:

```
INFO  [alembic.runtime.migration] Running upgrade abc123 -> def456, add_alert_source
INFO  [alembic.runtime.migration] Running upgrade def456 -> ghi789, add_ngo_user_id_to_collaborations
```

If you see `FAILED` in the output, check [Troubleshooting — DB connection refused](#troubleshooting-1-db-connection-refused).

---

## 6. Verify the Deployment

Run each check in order. All must pass before considering the deployment healthy.

### 6.1 React frontend

Open a browser and navigate to `http://<VM_IP>/`. The WaterWatch login page should load.

Or via curl:

```bash
curl -I http://localhost/
# Expected: HTTP/1.1 200 OK
```

### 6.2 API health check

```bash
curl http://localhost/api/v1/health
# Expected: {"status": "ok"}
```

### 6.3 Database connectivity

```bash
curl http://localhost/api/v1/health/db
# Expected: {"status": "ok", "db": "connected"}
```

### 6.4 WebSocket connection

Install `wscat` if not already present:

```bash
npm install -g wscat
```

Connect to the alerts WebSocket:

```bash
wscat -c ws://localhost/api/v1/ws/alerts
```

Expected: connection is established and the terminal stays open (no immediate error). Press `Ctrl+C` to disconnect.

If you see `Error: Unexpected server response: 502`, check [Troubleshooting — Nginx 502](#troubleshooting-3-nginx-502).

### 6.5 Predictive engine smoke test

Obtain a valid authority/admin JWT first (log in via the API or UI), then:

```bash
curl -X POST http://localhost/api/v1/alerts/predictive/generate \
  -H "Authorization: Bearer <your-token>"
# Expected: {"generated": <n>, "skipped": <n>}
```

---

## 7. Stopping and Restarting

```bash
# Stop all services (data is preserved in volumes)
make down

# Stop and remove all volumes (full reset — destroys DB data)
docker compose down -v

# Restart a single service (e.g. backend after a code change)
docker compose restart backend

# View live logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Deploying an update

```bash
git pull origin main
make down
make up        # rebuilds images with new code
make migrate   # run if there are new migrations
```

---

## 8. Troubleshooting

### Troubleshooting 1: DB connection refused

**Symptom:** `make migrate` fails with `could not connect to server: Connection refused` or the backend logs show `sqlalchemy.exc.OperationalError`.

**Causes and fixes:**

1. The `db` container is not yet healthy — wait 10–15 seconds after `make up` and retry `make migrate`. PostgreSQL takes a moment to finish initializing on first boot.

2. Wrong `DB_URL` in `.env.production` — verify the host is `db` (the Docker Compose service name), not `localhost`. The backend container cannot reach `localhost:5432`; it must use `db:5432`.

   ```env
   # Wrong
   DB_URL=postgresql://waterwatch:pass@localhost:5432/waterwatch
   # Correct
   DB_URL=postgresql://waterwatch:pass@db:5432/waterwatch
   ```

3. Credentials mismatch — `POSTGRES_USER` and `POSTGRES_PASSWORD` in `.env.production` must exactly match the credentials in `DB_URL`.

   ```bash
   # Verify db container is healthy
   docker compose ps db
   # Check db logs for errors
   docker compose logs db
   ```

---

### Troubleshooting 2: JWT secret mismatch

**Symptom:** All API calls return `401 Unauthorized` even with a freshly issued token. Backend logs show `JWTDecodeError` or `Signature verification failed`.

**Causes and fixes:**

1. `SECRET_KEY` in `.env.production` changed between the token being issued and the current running backend. If you rotate the secret, all existing tokens are immediately invalidated — users must log in again.

2. `SECRET_KEY` is empty or set to the placeholder value. Check:

   ```bash
   docker compose exec backend printenv SECRET_KEY
   ```

   Output must be a long random string, not blank or `"your-very-long-random-secret-key-here"`.

3. The backend was restarted without the env file being passed. Make sure you always use `make up` (which passes `--env-file .env.production`) rather than plain `docker compose up`.

---

### Troubleshooting 3: Nginx 502

**Symptom:** Browser shows `502 Bad Gateway`. `curl http://localhost/api/v1/health` returns `502`. WebSocket connection fails with `Error: Unexpected server response: 502`.

**Causes and fixes:**

1. **Backend container not ready yet** — the Nginx container starts faster than FastAPI. Wait 10–15 seconds and refresh. Check:

   ```bash
   docker compose logs backend
   # Look for: "Application startup complete." from Uvicorn
   ```

2. **Backend crashed on startup** — check for import errors or missing env vars:

   ```bash
   docker compose logs backend --tail=50
   ```

   Common causes: missing `SECRET_KEY`, wrong `DB_URL` format, Python import error in a new module.

3. **WebSocket-specific 502** — Nginx is not passing the `Upgrade` header. Open `nginx/nginx.conf` and verify the `/ws/` location block contains:

   ```nginx
   location /api/v1/ws/ {
       proxy_pass http://backend:8000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
   }
   ```

   After editing, rebuild and restart:

   ```bash
   docker compose restart frontend
   ```

4. **Backend port mismatch** — verify Uvicorn is listening on port `8000` inside the container and that the Nginx `proxy_pass` points to `http://backend:8000`.

---

## Makefile reference

| Command | What it does |
|---|---|
| `make up` | Build images and start all services in detached mode |
| `make down` | Stop all services (volumes preserved) |
| `make logs` | Tail logs for all services |
| `make migrate` | Run `alembic upgrade head` inside the backend container |

---

*End of runbook. If you encounter an issue not covered here, check `docker compose logs` for the relevant service and raise it in the project Slack channel.*