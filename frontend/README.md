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

## Extensions Beyond RealWorld Spec

### Real-Time WebSocket Notification Bell
- **Navbar Integration**: Displays a `NotificationBell` icon with a real-time unread badge counter in the top navigation bar when logged in.
- **WebSocket Connection**: Connects to `ws://localhost:8000/ws/notifications?token=<jwt_token>` on login. Incoming events update the badge counter and prepend items to the live notification list in real time.
- **Dropdown List**: Clicking the bell opens a dropdown showcasing recent notifications ("X started following you", "X commented on your article 'Y'", "X favorited your article 'Z'").
- **Navigation & Mark as Read**: Clicking a notification marks it as read via REST API and navigates directly to the target profile or article page. Includes a "Mark all as read" action.
- **Resilient Auto-Reconnection**: Implements graceful WebSocket reconnection with exponential backoff if the network connection drops, ensuring seamless UI state without crashing the app.
- **Why WebSockets over HTTP Polling**: WebSockets allow immediate event delivery to the user interface as actions occur on the server, avoiding periodic HTTP request chatter and preserving battery and network bandwidth.

