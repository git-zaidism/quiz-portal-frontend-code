# Quiz Portal Frontend

Modern Angular frontend for the Quiz Portal application. This version was rebuilt to align with the updated Spring Boot backend contract and to replace the old Angular 11 / Material-heavy UI with a cleaner standalone Angular application.

## Current stack

- Angular `20.x`
- TypeScript `5.9.x`
- Node tested locally with `v24.13.0`
- Standalone Angular bootstrap
- Typed API service layer
- Custom design system with shared notifications and confirmation modal

## What changed

- Upgraded the frontend from Angular 11 to Angular 20.
- Replaced NgModule-era bootstrap with standalone app configuration.
- Rebuilt routing, guards, auth session handling, and HTTP interception.
- Updated the frontend models and services to match the current backend DTOs.
- Redesigned the full app flow:
  - public landing page
  - login and signup
  - admin dashboard
  - category management
  - quiz management
  - question management
  - learner dashboard
  - quiz instructions
  - timed quiz attempt
  - profile view
- Replaced browser-native confirmation dialogs with a shared in-app confirmation modal.

## Backend expectations

The frontend is configured to call:

```text
http://localhost:8080
```

Environment files:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

If the backend runs on another host or port, update `apiUrl` in those files.

## Main API contract used by the frontend

Authentication:

- `POST /generate-token`
- `POST /generate-admin-token`
- `GET /current-user`

Users:

- `POST /user`

Categories:

- `GET /category`
- `GET /category/{categoryId}`
- `POST /category`
- `PUT /category`
- `DELETE /category/{categoryId}`

Quizzes:

- `GET /quiz`
- `GET /quiz/{quizId}`
- `POST /quiz`
- `PUT /quiz`
- `DELETE /quiz/{quizId}`
- `GET /quiz/category/{categoryId}`
- `GET /quiz/active`
- `GET /quiz/category/active/{categoryId}`

Questions:

- `GET /question/quiz/{quizId}`
- `GET /question/quiz/all/{quizId}`
- `GET /question/{questionId}`
- `POST /question`
- `PUT /question`
- `DELETE /question/{questionId}`
- `POST /question/eval-quiz`

## Project structure

```text
src/app/
  app.config.ts
  app.routes.ts
  core/
    guards/
    interceptors/
    models/
    services/
  pages/
    admin/
    auth/
    home/
    learner/
    profile/
  shared/
    components/
```

Key folders:

- `core/models`: typed interfaces for backend request and response payloads
- `core/services`: auth, API clients, notifications, confirmation flow
- `pages/admin`: admin workspace and CRUD screens
- `pages/learner`: learner dashboard, instructions, and attempt flow
- `shared/components`: reusable UI parts such as empty states and confirmation dialog

## Local development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm start
```

Open:

```text
http://localhost:4200/
```

The frontend expects the backend to already be running on `http://localhost:8080`.

## Build

Production build:

```bash
npm run build
```

Output:

```text
dist/examfront
```

Watch build:

```bash
npm run watch
```

## Authentication and roles

The frontend understands the current backend authority mapping:

- `ADMIN` for admin users
- `NORMAL` for learner users

Route protection:

- `/admin/**` is protected by the admin guard
- `/user-dashboard/**` and `/start/:qid` are protected by the learner guard

## Main routes

Public:

- `/`
- `/login`
- `/signup`

Admin:

- `/admin`
- `/admin/profile`
- `/admin/categories`
- `/admin/quizzes`
- `/admin/add-quiz`
- `/admin/quiz/:qid`
- `/admin/view-questions/:qid`
- `/admin/add-question/:qid`

Learner:

- `/user-dashboard`
- `/user-dashboard/:catId`
- `/user-dashboard/profile`
- `/user-dashboard/instructions/:qid`
- `/start/:qid`

## UX details

- Global toast notifications are rendered from the app root.
- Confirmation actions use a shared modal instead of `window.confirm`.
- Quiz attempts use a timed flow with:
  - question navigation
  - answer tracking
  - auto-submit on timeout
  - backend evaluation on submit

## Docker

This repo includes:

- `Dockerfile.dev`
- `docker-compose.yml`

Run with Docker:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:4200/
```

Stop:

```bash
docker compose down
```

## Notes

- The old Angular 11 testing and lint setup was removed from the active workflow during the upgrade.
- If you see API failures in the browser, check that the backend is running and the `apiUrl` matches your local environment.
- This frontend has been verified with a successful production build after the Angular 20 migration.
