# keepingthem.net — Claude Guidelines

## Privacy rule — memorial profile data

Never read, quote, summarize, or store the personal content of files inside `data/akan/`, `data/*/`, or any memorial config file. This includes names, dates, tribute text, addresses, phone numbers, or any other personal information about the deceased or their family.

When working with these files:
- Edit them only when the user explicitly asks for a structural or content change
- Confirm changes by describing what field was updated, not the value written
- Do not include profile content in memory, commit messages, or summaries

## Environment variables

Credentials live in `.env.local` — never read, quote, commit, or log this file. It is already excluded via `.gitignore`. Netlify environment variables hold the production equivalents and should be treated the same way.

## Project overview

Stack: Next.js 16 (App Router), Tailwind v4, Netlify deployment, Cloudflare domain.
Strategy: Static first, Supabase integration second.

## File structure

```
app/
  page.tsx                  homepage
  akan/
    page.tsx                Akan culture directory
    [slug]/page.tsx         individual memorial

components/                 UI components — do not put content here
data/
  akan/                     ← PRIVATE — do not read or quote content
  culture/akan.ts           cultural education text (not personal)

types/memorial.ts           MemorialConfig type
```

## Design rules

- Background is always dark — never white as a page background
- Gold `#c8962e` is the only accent color on memorial pages
- Cormorant Garamond for all headings, names, quotes, program text
- DM Sans for UI, labels, navigation, body copy
- Lotus stripe dividers on the homepage; Kente stripe on culture/memorial pages
- No gradients, drop shadows, or rounded corners on single-sided borders
- Everything must work on mobile — this site is viewed at funerals
