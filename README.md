NESTR - Backend (Flask)

This repository contains a simple Flask backend for the NESTR frontend.

Files added/changed:
- `app.py` - Flask server providing REST API endpoints and static file serving for the frontend located in `NESTR PROJECT/`.
- `data/users.json` - sample users (demo student and landlord).
- `data/properties.json` - sample property.
- `requirements.txt` - Python dependencies.

Quick start (Windows PowerShell):

1. Create and activate a Python virtual environment (recommended):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

2. Install requirements:

```powershell
pip install -r requirements.txt
```

3. Run the server:

```powershell
python app.py
```

The server listens on port `5000` by default. Open `http://localhost:5000/` to view the frontend.

Notes:
- Authentication uses a very small token scheme stored in-memory (`TOKENS`). This is meant for local development only.
- Data is persisted to JSON files under `data/`.
- Endpoints provided (examples):
  - `POST /api/auth/register` {name,email,password,role,phone} -> {user,token}
  - `POST /api/auth/login` {email,password} -> {user,token}
  - `GET /api/users/me` (Authorization: Bearer <token>) -> {user}
  - `GET /api/properties` -> {properties}
  - `GET /api/properties/<id>` -> {property}
  - `POST /api/properties` (Authorization: Bearer <token>, landlord role) -> create property
  - `POST /api/properties/<id>/like` (Authorization: Bearer <token>) -> toggle like

If you want, I can:
- Integrate the frontend to use these API endpoints (replace localStorage logic with fetch calls).
- Add JWT-based auth and token persistence.
- Add image upload support.

