# Deploy Atlas Ledger frontend to Vercel

## Vercel project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `atlas-ledger/frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

If the Vercel project root is the **repository root** instead, the repo-level `vercel.json` already points the build to `atlas-ledger/frontend/dist`.

## Local build (must pass before deploy)

```bash
cd atlas-ledger/frontend
npm install
npm run build
```

## CLI deploy

```bash
cd atlas-ledger/frontend
npx vercel login
npx vercel --prod
```

## SPA routing

`vercel.json` in this folder rewrites all routes to `/index.html` so client-side paths do not 404.
