# Collytex

Collytex is a Next.js college directory and management platform. Public pages read verified college, branch, department, university and course data from PostgreSQL through Prisma. Authentication uses opaque, database-backed sessions; roles are always loaded from the user record on the server.

## Local setup

1. Install dependencies with `npm install`.
2. Put the existing PostgreSQL connection in a local `.env` as `DATABASE_URL`. Do not commit that file.
3. Generate the Prisma client with `npm run db:generate`.
4. Run `npm run dev`.

There is no seed script and no production sample data. The directory stays empty until real college records have been verified and published.

## Existing database safety

The schema in `prisma/schema.prisma` describes the first Collytex data model. Before generating or applying a migration against an existing database, inspect its current schema and data. A read-only Prisma schema preview is available with:

```powershell
npx prisma db pull --print
```

Compare the existing schema with the application model and review any migration SQL before applying it. Do not run `prisma migrate reset`, drop existing tables, or apply generated SQL until the current schema and data have been reconciled. No migration has been applied by this project setup.

## Checks

- `npm run lint`
- `npm run build`
- `npm run db:generate`

## Product paths

- `/` and `/explore`: public college discovery and combined filters.
- `/colleges/[college]/[branch]/[department]/[university]/[course]`: public hierarchy and course details.
- `/login`, `/register`, `/register/college`: student and college-head account entry.
- `/college`: organization dashboard and scoped branch/course management.
- `/student`: saved colleges, saved courses and recent views; `/student/compare` compares saved courses.
- `/admin`: platform verification, reach and audit overview.

Images and documents are represented as validated HTTP(S) links for now. Object storage credentials and a storage provider are not configured in this project environment, so uploads are not enabled.
