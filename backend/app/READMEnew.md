
# Water Quality Monitor – Backend

This is the **FastAPI backend** for the Water Quality Monitor system.

It handles:
- User authentication (JWT-based login)
- PostgreSQL database storage
- API endpoints
- Business logic
- Security configuration

---

# 1. Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication (python-jose)
- Passlib (bcrypt)
- Uvicorn
- Python-dotenv

---

# 2. Prerequisites

Before starting, install:

- Python 3.10+
- PostgreSQL 15+
- Git
- VS Code (recommended)

---

# 3. Setup Instructions

## Step 1: Go to Backend Folder

```bash
cd backend
````

---

## Step 2: Create Virtual Environment

```bash
python -m venv venv
```

### Activate venv

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

You should see:

```
(venv)
```

---

## Step 3: Install Dependencies

If `requirements.txt` exists:

```bash
pip install -r requirements.txt
```

If not:

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv
```

Then create requirements file:

```bash
pip freeze > requirements.txt
```

---

# 4. Environment Configuration

Create a `.env` file in the backend root folder:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/water_db

SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Replace:

```
YOUR_POSTGRES_PASSWORD
```

with your actual PostgreSQL password.

⚠️ Never commit `.env` to Git. Add it to `.gitignore`.

---

# 5. Create Database

Open PostgreSQL (psql or pgAdmin) and run:

```sql
CREATE DATABASE water_db;
```

Or from terminal:

```bash
createdb -U postgres water_db
```

---

# 6. Run the Backend

```bash
uvicorn main:app --reload --port 8000
```

Open in browser:

* Swagger Docs → [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health Check → [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

Expected response:

```json
{"message": "Backend is running"}
```

---

# 7. Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── database.py
│   │   ├── security.py
│   │   └── config.py
│   ├── models/
│   │   └── user.py
│   ├── schemas/
│   │   └── user.py
│   ├── routes/
│   │   └── user.py
│   └── services/
│       └── user.py
├── main.py
├── .env
└── requirements.txt
```

---

# 8. API Flow (Authentication)

### 1. Register

POST `/users/register`

### 2. Login

POST `/users/login`

* username = email
* returns JWT access token

### 3. Access Protected Route

GET `/users/me`

Click **Authorize** in Swagger and paste:

```
Bearer <your_token>
```

---

# 9. 🔧 Fix: bcrypt Compatibility Issue (IMPORTANT)

If you get errors like:

* 500 error during register/login
* bcrypt version conflict
* password-related issues

Follow these steps carefully.

---

## Step 1: Go to Backend Folder

```bash
cd backend
```

---

## Step 2: Activate Virtual Environment (if not active)

You should see:

```
(venv)
```

If not, activate it:

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

---

## Step 3: Uninstall Current bcrypt

```bash
pip uninstall bcrypt -y
```

---

## Step 4: Install Compatible bcrypt Version

⚠️ Very important — install this exact version:

```bash
pip install bcrypt==4.0.1
```

---

## Step 5: Reinstall passlib (Safe Side)

```bash
pip install passlib[bcrypt]
```

---

## Step 6: Start Server Again

```bash
uvicorn main:app --reload
```

---

### Why This Fix Is Needed

Some newer bcrypt versions conflict with passlib and cause authentication failures.
Version `4.0.1` works properly with FastAPI + Passlib setup.

---

# 10. Common Issues & Fixes

| Problem               | Solution                                    |
| --------------------- | ------------------------------------------- |
| CORS error            | Add CORSMiddleware in main.py               |
| 404 on login/register | Check router prefix                         |
| 500 error on login    | Fix bcrypt version                          |
| DB not connecting     | Check PostgreSQL running + correct password |
| Tables not created    | Ensure Base.metadata.create_all() runs      |
| "User not found"      | Register first before login                 |




