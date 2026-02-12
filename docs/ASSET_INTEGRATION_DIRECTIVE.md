# ASSET INTEGRATION DIRECTIVE

**Context:** Three brand images are in `C:\Users\jbwagoner\Downloads\`. Integrate them into the Sutra.team site as favicon, logo, agent avatar, hero image, OG image, and remove all default Next.js placeholder SVGs.

---

## Step 1: Copy Images into Project

```bash
# Create asset directories
mkdir -p public/images/agents
mkdir -p public/images/og

# Copy from Downloads
cp "C:\Users\jbwagoner\Downloads\logo_OZEN_with_lotus.png" public/images/logo.png
cp "C:\Users\jbwagoner\Downloads\SUTRAmedium.png" public/images/agents/sutra.png
cp "C:\Users\jbwagoner\Downloads\6_anime_AGI_robot_judges_zen_monks.png" public/images/council-hero.png
```

---

## Step 2: Generate Favicon from Logo

Use the OZEN lotus logo (`public/images/logo.png`) to create favicon files.

Install sharp if not available:
```bash
npm install sharp --save-dev
```

Create a script `scripts/generate-favicon.mjs`:

```javascript
import sharp from 'sharp';
import path from 'path';

const input = path.resolve('public/images/logo.png');

// ICO-compatible PNG at 32x32
await sharp(input)
  .resize(32, 32)
  .png()
  .toFile('public/favicon-32x32.png');

// Apple touch icon 180x180
await sharp(input)
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');

// Standard favicon (browsers accept .png renamed to .ico for simple cases,
// but for true .ico, just use the 32x32 png and reference it in metadata)
await sharp(input)
  .resize(32, 32)
  .png()
  .toFile('public/favicon.png');

// 192x192 for PWA / Android
await sharp(input)
  .resize(192, 192)
  .png()
  .toFile('public/icon-192.png');

// 512x512 for PWA / Android
await sharp(input)
  .resize(512, 512)
  .png()
  .toFile('public/icon-512.png');

console.log('Favicons generated.');
```

Run it:
```bash
node scripts/generate-favicon.mjs
```

Then update `src/app/layout.tsx` metadata to use the new favicons:

```typescript
export const metadata: Metadata = {
  title: "Sutra.team — Persona Hosting Platform",
  description: "Your AI needs a council, not a chatbot. Council deliberation with AI agents grounded in the Noble Eightfold Path, synthesized by Sutra.",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "Sutra.team — Persona Hosting Platform",
    description: "Your AI needs a council, not a chatbot.",
    images: [{ url: '/images/og/og-default.png', width: 1200, height: 630 }],
    siteName: "Sutra.team",
    type: "website",
    url: "https://sutra.team",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sutra.team — Persona Hosting Platform",
    description: "Your AI needs a council, not a chatbot.",
    images: ['/images/og/og-default.png'],
  },
};
```

---

## Step 3: Generate OG Image

Use the council hero image to create a 1200x630 OG image. Crop/resize to fit the OG aspect ratio with a dark overlay and text.

Add to `scripts/generate-favicon.mjs` (or create `scripts/generate-og.mjs`):

```javascript
import sharp from 'sharp';
import path from 'path';

const input = path.resolve('public/images/council-hero.png');

// Get image dimensions first
const metadata = await sharp(input).metadata();

// Center-crop to 1200x630 aspect ratio
const targetWidth = 1200;
const targetHeight = 630;

await sharp(input)
  .resize(targetWidth, targetHeight, {
    fit: 'cover',
    position: 'center',
  })
  // Add a semi-transparent dark overlay for text readability
  .composite([
    {
      input: Buffer.from(
        `<svg width="${targetWidth}" height="${targetHeight}">
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)"/>
          <text x="60" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">Sutra.team</text>
          <text x="60" y="360" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.85)">Your AI needs a council, not a chatbot.</text>
          <text x="60" y="560" font-family="Arial, sans-serif" font-size="20" fill="rgba(201,168,76,1)">sutra.team</text>
        </svg>`
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile('public/images/og/og-default.png');

console.log('OG image generated.');
```

Run it:
```bash
node scripts/generate-og.mjs
```

---

## Step 4: Add Logo to Navigation

Update the site header/nav component to use the OZEN lotus logo. Find the nav component (likely in `src/components/layout/` or `src/app/layout.tsx` or a `Header.tsx` / `Navbar.tsx` component).

Replace any text-only "SUTRA" branding or default Next.js logo with:

```tsx
import Image from 'next/image';

// In the nav/header:
<Link href="/" className="flex items-center gap-2">
  <Image
    src="/images/logo.png"
    alt="Sutra.team"
    width={36}
    height={36}
    className="rounded-full"
  />
  <span className="text-lg font-bold tracking-wide">SUTRA</span>
</Link>
```

---

## Step 5: Add Sutra Avatar to Agent/Room UI

The Sutra bust image (`public/images/agents/sutra.png`) should appear as the default agent avatar. Update the room page or any agent display component to show it:

```tsx
import Image from 'next/image';

// Default agent avatar when no specific agent image is available
<Image
  src="/images/agents/sutra.png"
  alt="Sutra"
  width={64}
  height={64}
  className="rounded-full"
/>
```

If there's an agent sidebar, participant list, or council agent card component, use this image for the Sutra synthesis agent.

---

## Step 6: Add Council Hero Image

Use the anime council scene on the `/council` page as a hero image. Find the council page component (`src/app/council/page.tsx` or similar) and add:

```tsx
import Image from 'next/image';

// Hero section of the council page
<div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl">
  <Image
    src="/images/council-hero.png"
    alt="The Council of Rights — AI agents and zen monks in deliberation"
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
  <div className="absolute bottom-8 left-8 right-8">
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">The Council</h1>
    <p className="text-lg text-white/80">Eight agents grounded in the Noble Eightfold Path. Six domain experts. One synthesis.</p>
  </div>
</div>
```

---

## Step 7: Delete Default Next.js Placeholder SVGs

Remove all default Next.js SVGs that are no longer used:

```bash
rm -f public/file.svg
rm -f public/globe.svg
rm -f public/next.svg
rm -f public/vercel.svg
rm -f public/window.svg
```

Also check `src/app/page.tsx` and any other files for references to these SVGs and remove them. Search for:
- `file.svg`
- `globe.svg`
- `next.svg`
- `vercel.svg`
- `window.svg`

---

## Step 8: Verify and Build

```bash
npm run build
```

Confirm:
- [ ] Favicon shows the OZEN lotus in browser tab
- [ ] Nav bar shows logo + "SUTRA" text
- [ ] `/council` page has hero image
- [ ] OG image exists at `public/images/og/og-default.png`
- [ ] No references to old default SVGs remain
- [ ] Build passes with no errors

---

## File Summary

| Source File | Destination | Usage |
|-------------|-------------|-------|
| `logo_OZEN_with_lotus.png` | `public/images/logo.png` | Favicon, nav logo |
| `SUTRAmedium.png` | `public/images/agents/sutra.png` | Default agent avatar |
| `6_anime_AGI_robot_judges_zen_monks.png` | `public/images/council-hero.png` | Council page hero, OG image source |
| (generated) | `public/favicon.png` | Browser tab icon |
| (generated) | `public/apple-touch-icon.png` | iOS home screen |
| (generated) | `public/icon-192.png` | Android/PWA |
| (generated) | `public/icon-512.png` | Android/PWA |
| (generated) | `public/images/og/og-default.png` | Social sharing preview |
