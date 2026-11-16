# Legacy — Private Digital Family Heritage Platform

A self-hostable platform for families to build their family tree, preserve
memories against it, and keep that archive private — no public social graph,
no ad model, no third-party access to family media.

Most genealogy products are public-by-default record databases. Legacy is the
opposite: a closed, invite-only space per family, where the tree is the index
into a shared media archive rather than the product itself.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | NestJS + TypeScript | Module boundaries map to the domain (families, members, memories, timeline) |
| ORM / DB | Prisma + PostgreSQL | Relational integrity matters — a family tree is a graph with hard constraints |
| Frontend | Next.js (App Router) + Tailwind | Route groups separate the auth shell from the dashboard shell |
| Auth | JWT access + refresh tokens, Google OAuth | Refresh rotation so access tokens stay short-lived |
| Media | S3-compatible object storage | Family photo archives outgrow a database quickly |
| Local dev | Docker Compose | One command brings up Postgres + both services |

## Domain model

14 Prisma models. The interesting ones:

- **`FamilyMember`** is deliberately *not* `User`. A member can exist with
  `userId = null` — a great-grandparent who died in 1962 is a first-class node
  in the tree and will never claim an account. Conflating the two is the usual
  modelling mistake in this domain.
- **`Relationship`** is a directed edge (`fromMemberId`, `toMemberId`,
  `relationType`) with a uniqueness constraint on the triple, so the tree is a
  graph rather than a parent-pointer list. That is what lets the same person
  appear once while belonging to two branches.
- **`MemoryTag`** joins memories to members, making the tree an index into the
  media archive: open a person, get everything they appear in.
- **`AuditLog`** — in a private family archive, who viewed or changed what is
  part of the trust model, not an afterthought.

Enums: `SystemRole`, `FamilyRole`, `Gender`, `RelationType`, `MediaType`,
`EventCategory`, `InviteStatus`.

## API

26 endpoints across 7 modules:

```
auth           POST   /auth/register  /auth/login  /auth/refresh  /auth/logout
               GET    /auth/me
families       POST   /families  /families/join  /families/:id/invite
               GET    /families  /families/:id
members        POST   /families/:familyId/members
               POST   /members/:id/relationships
               GET    /members/:id  /families/:familyId/tree
memories       POST   /families/:familyId/albums  /families/:familyId/memories
               POST   /memories/:id/comments  /memories/:id/reactions
               GET    /families/:familyId/albums  /families/:familyId/memories
               GET    /memories/:id
timeline       POST   /families/:familyId/timeline
               GET    /families/:familyId/timeline
search         GET    /families/:familyId/search
notifications  GET    /notifications
               PATCH  /notifications/:id/read  /notifications/read-all
```

## Running it

```bash
cp .env.example .env        # fill in Postgres, JWT secrets, S3, Google OAuth
docker-compose up -d --build

npm run db:migrate          # prisma migrate dev
npm run db:seed             # demo family
npm run dev:backend         # :3001
npm run dev:frontend        # :3000
```

Both packages typecheck clean (`npx tsc --noEmit`).

## Status

Working: auth with refresh rotation, family creation and invites, member and
relationship CRUD, tree retrieval, albums and memories with comments and
reactions, timeline events, search, notifications. Frontend covers login,
register, dashboard, tree, members, memories, timeline and settings.

Known gaps, in the order I intend to close them:

- [x] Test coverage is thin — one controller spec. Services need unit tests,
      starting with relationship validation.
- [x] Relationship integrity is not enforced beyond the unique constraint: the
      schema currently permits a cycle (a member as their own ancestor).
- [x] `GET /families/:familyId/memories` is unpaginated.
- [x] No rate limiting on auth routes.
- [ ] Media upload goes direct to the API rather than via presigned S3 URLs.
- [x] No CI.

## Licence

Personal project. All code authored by me.
