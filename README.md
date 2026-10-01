# Memory Map

**Your life, in places.**

Memory Map is a mobile-first personal memory world that combines an interactive 3D globe, life timeline, photos, video, voice notes, people, places, emotions, Story Mode, and immersive Memory Rooms.

## What works

- Interactive Three.js / React Three Fiber memory globe with touch rotation, pinch/scroll zoom, glowing pins, clusters-by-place and animated journey routes.
- Create, edit, delete, favorite and search memories.
- Photo upload, camera capture, video upload and in-browser voice recording with pause/resume/preview.
- Manual coordinates plus browser geolocation with permission-denied handling.
- Exact, approximate and year-only dates.
- Timeline filters, People, Places, Emotions, Favorites, My Journey and Story Mode.
- Cinematic 3D Memory Rooms with emotion-influenced lighting.
- Share text and downloadable SVG share cards.
- JSON data export and local reset controls.
- Mobile-first glass UI with safe-area support, responsive desktop layouts and reduced-motion support.
- Installable PWA with service worker/offline app shell and cached recently loaded demo images.
- Optional Supabase email/password authentication, private Storage, RLS-secured memory rows and cloud media sync.
- Fully functional **Local Private Mode** when Supabase is not configured. Local mode stores data in the current browser/device.

## Stack

- React 18 + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- Framer Motion-ready UI architecture
- Lucide icons
- Supabase Auth / PostgreSQL / Storage (optional cloud mode)
- vite-plugin-pwa / Workbox

## Local development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run typecheck
npm run build
npm run preview
```

## Cloud mode with Supabase

The hosted demo works without cloud credentials. For secure multi-device accounts:

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/migrations/001_initial.sql`.
3. Copy `.env.example` to `.env.local`.
4. Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

5. In Supabase Auth, enable email/password. Email confirmation is optional.
6. Rebuild and deploy.

The migration creates a private `memory-media` Storage bucket and Row Level Security policies so authenticated users can only access rows/files under their own user ID.

## Demo vs real data

Demo memories are hard-coded in `src/data/demo.ts` and are kept separate from real accounts. Choosing **Explore Demo** never creates cloud records. A new Supabase account starts with an empty private memory collection. Local Private Mode also starts empty on first use and persists only in that browser.

## PWA

The manifest, service worker, app icons, safe-area layout, standalone display mode and offline app shell are generated through `vite-plugin-pwa`. The GitHub Pages base path is `/Memory-Map/`.

## GitHub Pages deployment

`.github/workflows/deploy.yml` builds `dist/` and deploys it using GitHub's official Pages Actions. In repository **Settings → Pages**, set the source to **GitHub Actions** once if Pages has not previously been enabled for the repository.

Expected URL:

`https://saaeiddev.github.io/Memory-Map/`

## Privacy notes

- Memories are never public by default.
- In cloud mode, private media uses signed URLs rather than public Storage URLs.
- AI features are intentionally not required for the core product and no personal media is sent to an AI provider.
- The Emotions view is a journal visualization only and makes no medical or psychological claims.

## Project structure

```text
src/
  components/     reusable UI, globe, room, editor, auth
  data/           demo-only memories
  pages/          app views
  services/       Supabase client + cloud persistence
  store/          local private persistence
  utils/          media/export/geospatial helpers
supabase/
  migrations/     database + RLS + storage setup
.github/workflows deploy pipeline
```

## Notes on media limits

The web UI validates local uploads at 20 MB per selected file for a responsive mobile experience. The Supabase bucket migration permits up to 50 MB per stored object; tune these values for your production plan and expected video usage.

---

Created as a real working PWA implementation of the Memory Map product concept.
