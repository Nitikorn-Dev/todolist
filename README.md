# Task Manager

A simple task management application (Next.js App Router + Supabase), built for a 4-person university team. See [CLAUDE.md](./CLAUDE.md) for the full specification and [ARCHITECTURE.md](./ARCHITECTURE.md)/[DATABASE.md](./DATABASE.md) for design details.

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and anon key:

   ```bash
   cp .env.example .env.local
   ```

2. Push the database migrations in `supabase/migrations/` to that project (see [DATABASE.md](./DATABASE.md)).
3. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app. The entry page is [src/app/page.tsx](./src/app/page.tsx).

## Testing

```bash
npm run test          # unit + integration (Vitest)
npm run test:unit
npm run test:integration
npm run test:e2e       # Playwright (uses your system-installed Chrome)
npm run lint
npm run typecheck
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
