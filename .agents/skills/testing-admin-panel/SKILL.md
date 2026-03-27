# Testing tutarnet Admin Panel

## Environment Setup

### Prerequisites
- Node.js v22+ (project uses v22.12.0)
- npm 10+

### Dev Server
```bash
npm run dev
# Runs on localhost:3000 via Next.js 16.x with Turbopack
```

### Required Environment Variables
Create `.env.local` with:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `NEXT_PUBLIC_APP_URL` — typically `http://localhost:3000`

Optional (features degrade gracefully without these):
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — rate limiting
- `OPENAI_API_KEY` — AI features

### Devin Secrets Needed
- `SUPABASE_DATABASE_URL` — PostgreSQL connection string for tutarnet
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key

## Auth Bypass for Testing

The middleware at `src/middleware.ts` (or `proxy.ts`) checks for the existence of an `sb-access-token` cookie — it does NOT validate the token. To bypass the login redirect for admin pages:

```bash
# Via curl
curl -b "sb-access-token=dummy" http://localhost:3000/admin-paneli/site-ayarlari

# In browser: set cookie via DevTools console
document.cookie = "sb-access-token=dummy; path=/"
```

Note: With proper Supabase env vars configured, the pages load data from the real DB even with a dummy auth token. The middleware only gates page access, not API calls.

## Admin Pages to Test

### `/admin-paneli/site-ayarlari`
Most complex page (~1200 lines). Test these controls:
- **Category sidebar**: 12 categories with icons, active state (accent bg + left border)
- **Section tabs**: Active tab has accent underline, clicking switches content
- **Form controls**: Text inputs, textareas, select dropdowns, toggle switches, color pickers, range sliders, password fields (with eye/copy icons)
- **Badges**: "ENV" (blue) for environment-sourced values, "DB" (green) for DB-sourced values
- **Dirty state**: Modifying any field shows yellow "değişti" badge + unsaved counter in header
- **Toast notifications**: Appear on save actions

### `/admin-paneli/analitik`
- **KPI cards**: 4 cards (Partner, Kullanıcı, Hizmet, Randevu) with trend badges and SVG sparklines
- **Period selector**: 7 Gün / 30 Gün / 90 Gün buttons — active has accent bg
- **Bar chart**: "Aylık Büyüme Trendi" with month labels
- **Lower stats**: Partner distribution table + Platform summary with colored values
- SVG charts use CSS variable colors (`var(--color-admin-accent)`, etc.) — verify these resolve

### `/admin-paneli/error.tsx`
Error boundary — only triggers on runtime errors. Verify via code review that it uses Tailwind classes.

## Tailwind Migration Testing Tips

### Color Token Mapping
Admin color tokens are defined in `tailwind.config.ts` under `extend.colors.admin` and as CSS custom properties in `globals.css` `@theme inline` block. Key mappings:
- `T.accent` → `bg-admin-accent` / `text-admin-accent` (resolves to `#6366f1`)
- `T.textPrimary` → `text-admin-text-primary` (resolves to `#0f172a`)
- `T.textSecondary` → `text-admin-text-secondary` (resolves to `#64748b`)
- `T.border` → `border-admin-border` (resolves to `#e2e8f0`)

### SVG Color Handling
SVG `stroke`/`fill` attributes cannot use Tailwind classes. Instead, use CSS variable references:
```tsx
const COLORS = {
  accent: "var(--color-admin-accent)",
  success: "var(--color-admin-success)",
  // etc.
};
```

### Lucide Icon Colors
Lucide icons use `currentColor`. Change from `color={T.accent}` prop to `className="text-admin-accent"`.

### Tailwind v4 Plugin Syntax
Tailwind v4 uses `@plugin` directive in CSS, NOT `require()` in config:
```css
/* globals.css */
@import "tailwindcss";
@plugin "tailwindcss-animate";
```

## Lint & Type Check
```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript strict check
```

## Known Issues
- The `middleware` file convention shows a deprecation warning ("use proxy instead") — this is a Next.js 16.x change, not a bug
- `tokens.ts` still exists and is imported by pages not yet migrated (moderasyon, personel, etc.) — will be removed in final cleanup phase
- No CI pipeline is configured on the repo
