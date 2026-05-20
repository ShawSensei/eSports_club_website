Reset the local Supabase database — wipes all data, reapplies every migration in order, then runs seed.sql.

```bash
supabase db reset
```

After reset, regenerate TypeScript types:
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

Warn the user before running: this destroys all local data and cannot be undone.
