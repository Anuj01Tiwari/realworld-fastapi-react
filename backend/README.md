# RealWorld (Conduit) FastAPI Backend

Spec-compliant backend implementation for the RealWorld (Conduit) specification.

## Tech Stack
- **Framework**: FastAPI (Python 3.12)
- **Database & ORM**: PostgreSQL / SQLite, SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: JWT (`Authorization: Token <jwt>`)
- **Password Hashing**: `bcrypt`
- **Testing**: `pytest`, `httpx`

## Running Locally

### Setup Environment
```bash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### Run Server
```bash
uvicorn app.main:app --reload --port 8000
```
API endpoint docs will be available at [http://localhost:8000/api/docs](http://localhost:8000/api/docs).

### Run Pytest Suite
```bash
pytest
```
