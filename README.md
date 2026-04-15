# Developer Workspace Frontend

Frontend Angular untuk aplikasi personal `Developer Workspace`.

Saat ini project frontend masih berada pada tahap awal dan akan dibangun bertahap per module. Phase pertama fokus hanya pada `Task Module`.

## Tech Stack

- Angular 21
- TypeScript
- SCSS
- Angular Router
- Angular Forms

## Menjalankan Project

Masuk ke folder project:

```bash
cd /Volumes/martin/martin/IdeaProjects/developer-workspace-fe
```

Install dependency jika diperlukan:

```bash
npm install
```

Jalankan development server:

```bash
npm start
```

Atau:

```bash
npx ng serve
```

Lalu buka:

```text
http://localhost:4200
```

Catatan:

- backend Spring Boot biasanya akan berjalan di `http://localhost:8080`
- saat ini project frontend baru scaffold Angular dasar
- implementasi feature `Task` akan ditambahkan bertahap

## Script yang Tersedia

Jalankan development server:

```bash
npm start
```

Build project:

```bash
npm run build
```

Jalankan test:

```bash
npm test
```

## Scope Phase 1

Phase frontend pertama hanya untuk `Task` dengan scope:

- task list
- create task
- detail task
- update task
- delete task
- update task status

Di luar itu belum masuk scope:

- work log
- snippet
- auth
- multi-user

## API Integration Target

Frontend ini akan consume backend `Developer Workspace Backend` yang menyediakan endpoint:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{taskId}`
- `PUT /api/tasks/{taskId}`
- `DELETE /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}/status`
