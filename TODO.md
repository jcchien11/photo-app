# Folio — Photo App TODO

## Pages
- [ ] `/photos` — All Photos page (every photo across all albums, masonry grid)
- [ ] `/shared` — Shared page (albums shared with/by you)

## Filtering & Search
- [ ] Date range filter (on dashboard and album view)
- [ ] Location filter with map view (filter albums/photos by location)
- [ ] Search within album photos (by tag, location, date)
- [ ] Tag management page (view/rename/delete tags globally)

## Photo Features
- [ ] Slideshow mode (auto-advancing fullscreen)
- [ ] Download individual photo + bulk download selected
- [ ] EXIF/GPS location auto-read from uploaded photos
- [ ] Sort within album (by date, tag, favorite)
- [ ] Drag to reorder photos in album

## Album Features
- [ ] Album cover picker from existing album photos (currently picks from placeholder library)
- [ ] Duplicate album
- [ ] Move photos between albums

## Sharing
- [ ] Shared album view page (public-facing, read-only, pixieset-style)
- [ ] Password-protected album option

## UX / Polish
- [ ] Infinite scroll or pagination on large grids
- [ ] Loading skeletons
- [ ] Toast notifications (album created, photos added, link copied, etc.)
- [ ] Mobile nav — bottom tab bar on mobile
- [ ] Empty state illustrations

## Tech Stack Reference
- Next.js 14 (App Router) — frontend only for now
- Tailwind CSS + shadcn UI primitives (Radix UI)
- Fonts: Playfair Display (serif headings) + Inter (sans body)
- State: React Context + localStorage (no backend yet)
- Images: picsum.photos placeholder seeds
- Design ref: pixieset.com editorial style — minimal, warm, high-end photography

## What's Already Built
- Dashboard: albums grid + list view, sort, tag filter, search
- Create album dialog (2-step: details → cover photo)
- Edit album dialog
- Album view: cinematic hero, sticky nav, masonry photo grid
- Add photos dialog (picker from 60-photo mock library)
- Share dialog (copyable link, social buttons, invite by email)
- Photo lightbox (keyboard nav ←/→/Esc, favorite, download)
- Tag filter strip per album
- Favorites toggle per photo
- Select mode for bulk remove
- Set cover photo from grid
- State persists to localStorage
