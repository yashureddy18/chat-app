# Adverayze Chat Application

A real-time full-stack chat application built as a technical assignment.

## Project Overview
This is a modern, real-time chat application featuring a robust backend using Node.js and Socket.IO, complemented by a visually stunning frontend built with React (Vite) and Vanilla CSS. It sports an elegant dark mode, smooth micro-animations, and full real-time capabilities.

Features include:
- Real-time messaging using Socket.IO (WebSockets).
- Pinning and unpinning important messages.
- Deleting messages locally ("Delete for Me").
- Deleting messages globally ("Delete for Everyone").
- Persistent storage with SQLite.
- Seamless, animated UI built with React.

## Approach and Design Decisions
1. **Frontend**: I chose React (with Vite for fast bundling) due to its component-based structure which makes maintaining state (like pinned messages or live arrays) straightforward. Styling was done in Vanilla CSS to provide maximum control over layout and elegant micro-animations without external heavy libraries like Tailwind, keeping the design bespoke.
2. **Backend**: Node.js with Express handles initial REST API calls, while Socket.IO was chosen for seamless, bidirectional real-time communication. Socket.IO falls back to polling if WebSockets are unavailable, ensuring maximum reliability.
3. **Database**: SQLite was used to meet the "any database" requirement. It acts as a full SQL database while requiring zero external setup from the user running the app locally, making the submission easy to test.

## Tradeoffs and assumptions
- **Authentication**: To keep within the timeframe and simplicity, a full JWT/OAuth auth flow was bypassed. Pseudo-authentication is implemented where the user enters a username and is generated a unique session ID in `localStorage`.
- **Database Scalability**: SQLite is perfectly suitable for this assignment scale (>100 messages smoothly). In a production scenario, it would be easily swappable to PostgreSQL.

## Setup instructions

1. **Clone the repository** (if not already local)
2. **Start the Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   ```
3. **Start the Frontend**:
   *(In a new terminal window)*
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the frontend app at the URL provided by Vite (e.g., `http://localhost:5173`).

## API documentation

- **`GET /messages?userId={id}`**: Fetches all messages. Excludes messages the user deleted locally (`deletedBy`), and censors content of messages `isDeletedForEveryone`.

### WebSocket Events
- **emit `sendMessage`**: Sends a new message `{ text, senderId, senderName }`. 
- **listen `messageAdded`**: Fired when a global message is added.
- **emit `pinMessage`**: Pins a message `{ id, isPinned }`.
- **listen `messagePinned`**: Broadcast update for pin state.
- **emit `deleteMessage`**: Deletes a message `{ id, userId, type }` (type: 'me' or 'everyone').
- **listen `messageDeletedEveryone`**: Broadcast update to redact a message globally.
