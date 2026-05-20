Run the full quality gate for the current phase in this order:

1. `npm run typecheck` — report any TypeScript errors
2. `npm run lint` — report any ESLint warnings or errors
3. `npm run build` — confirm the production build passes

If all three pass, output a ready-to-use git commit command following the project convention:
```
git commit -m "feat: phase [N] — [short description]"
```

If any step fails, list the errors and fix them before reporting the phase as done.
