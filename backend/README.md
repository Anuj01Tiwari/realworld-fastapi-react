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

## Extensions Beyond RealWorld Spec

### Real-Time WebSocket Notifications System
This implementation includes an original real-time notification extension built with FastAPI WebSockets and SQLAlchemy persistence.

- **WebSocket Endpoint**: `/ws/notifications?token=<jwt_token>` (authenticates via JWT query parameter or initial JSON message).
- **Trigger Events**:
  - Follow: Triggers a notification when a user follows another user profile.
  - Comment: Triggers a notification when a user comments on an article.
  - Favorite: Triggers a notification when a user favorites an article.
  - *Self-actions on user's own content are automatically suppressed.*
- **REST Management Endpoints**:
  - `GET /api/notifications`: Retrieves paginated notification list and unread count.
  - `POST /api/notifications/{id}/read`: Marks a specific notification as read.
  - `POST /api/notifications/read-all`: Marks all unread notifications as read.
- **Why WebSockets over HTTP Polling**:
  - **Instant Delivery**: Push events arrive instantly to connected clients without round-trip latency.
  - **Zero Server Overhead**: Eliminates constant database polling queries from active browser clients.
  - **Bi-directional Capability**: Establishes a persistent full-duplex TCP channel for interactive real-time features.

