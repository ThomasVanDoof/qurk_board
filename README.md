# Qurk Board

## Product Summary

Qurk Board helps people organize ideas and follow-ups that are otherwise scattered across notes and conversations. It gives individuals and small teams a visual workspace for capturing short notes, arranging them, connecting related thoughts, and keeping separate projects in one place without the overhead of a larger project-management tool.

The main flow is to create an account, add notes to a personal board, or create a project and open its dedicated board. Each project's notes are saved separately, so returning to a project restores that project's board rather than mixing notes between projects. Board note text and projects are saved to the signed-in user's MongoDB account; board positions, pins, and connections remain browser-local. A profile view lets the user update their display name.

## Product Demo

[Open the live Qurk Board app](https://qurk-board-silk.vercel.app/)

## Team Members

- Valentina Bass
- Marvin Canastuj
- Thomas Barney
- Charles Adam Davis

## Run Locally

Requirements: Node.js and npm.

1. Install dependencies with `npm ci`.
2. Create `.env.local` with `MONGODB_DB_URI` and `MONGODB_DB_NAME`. The MongoDB user must be able to read and write the configured database, and the database network rules must allow the app's host.
3. Start the development server with `npm run dev` and open [http://localhost:3000](http://localhost:3000).

Run `npm run build` to verify a production build and `npm run start` to serve it locally. `npm run lint` runs ESLint; `npm run format:check` checks formatting.

## Deployment

Deploy the repository root as a Next.js app on Vercel. Configure `MONGODB_DB_URI` and `MONGODB_DB_NAME` in the Vercel project's Environment Variables for each environment (Production and Preview), and allow connections from the deployment environment in MongoDB network access settings. Build with `npm run build`.

## API Routes

All project and item routes require an active session. The session is stored in an HTTP-only cookie. Successful creation returns `201`; invalid input returns `400`; missing authentication returns `401`; unknown or unowned IDs return `404`.

| Method                   | Route                | Purpose                                   |
| ------------------------ | -------------------- | ----------------------------------------- |
| `POST`                   | `/api/auth/register` | Register and create a session             |
| `POST`                   | `/api/auth/sign-up`  | Alias for registration                    |
| `POST`                   | `/api/auth/login`    | Authenticate and create a session         |
| `GET`                    | `/api/auth/session`  | Read the current user                     |
| `DELETE`                 | `/api/auth/session`  | End the current session                   |
| `PATCH`                  | `/api/auth/profile`  | Update the current user's username        |
| `GET`, `POST`            | `/api/items`         | List or create owned board items          |
| `GET`, `PATCH`, `DELETE` | `/api/items/{id}`    | Read, update, or delete one owned item    |
| `GET`, `POST`            | `/api/projects`      | List or create owned projects             |
| `GET`, `PATCH`, `DELETE` | `/api/projects/{id}` | Read, update, or delete one owned project |

Item payloads use `title` and `details`; optionally include `projectId` to create the note on that project's board. Omitting `projectId` creates a personal-board note. Project payloads use `name` and `description`. List routes return `{ "items": [...] }` and `{ "projects": [...] }`. Create and update routes return the created or updated record under `item` or `project`.

## Known Issues and Opportunities

- Existing notes saved before database sync remain in that browser's local storage; new database-backed notes are not automatically migrated from other devices.
- Note pin state, board positions, and note connections are browser-local and do not sync across devices.
- Board positions, pins, and connections are stored per board in the current browser and do not sync across devices.
- The live deployment returned a temporary sign-in error during verification. Check Vercel's MongoDB environment variables and the database network allowlist if authentication fails.
- Run a mobile Lighthouse audit and color-contrast check before release; no Lighthouse report is currently included.
