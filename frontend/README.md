# RealWorld (Conduit) React Frontend

Spec-compliant frontend implementation for the RealWorld (Conduit) specification.

## Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library

## Features & E2E Compliance
- Full RealWorld feature set: Auth (Register, Login, Current User, Settings), Profiles & Follows, Articles CRUD, Comments, Favorites, Tags filtering, and Pagination.
- Full compliance with `specs/e2e/SELECTORS.md` selector contract.
- Debug interface exposed on `window.__conduit_debug__` with `getToken()`, `getAuthState()`, and `getCurrentUser()`.
- Default avatar fallback (`default-avatar.svg`) for empty/null profile pictures.

## Running Locally

```bash
npm install
npm run dev
```

The app will start at `http://localhost:5173` and proxy API calls to `http://localhost:8000`.

## Running Unit Tests

```bash
npm test
```
