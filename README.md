# KYNDE Motion — website and studio dashboard

The public website and private project dashboard for **KYNDE Motion**, an independent creative production and digital studio.

- **Public site:** Home, Our Work (with category filters and project pages), Services, About, Contact, Privacy notice and a 404 page.
- **Dashboard (`/admin`):** secure sign-in. Create, edit, preview, publish, unpublish, reorder, feature and archive projects. Upload videos and images, and read contact-form enquiries.

The visual layout is adapted from the editorial structure of the Aperture Framer template: oversized type in viewfinder brackets, a sticky statement with floating frames, bracketed project cards, a bento benefits grid, a fanned card close and a floating pill nav. It is rebuilt from scratch in KYNDE's navy, cyan and white palette, with KYNDE's own content and footage. No code, text or imagery from the template is used.

---

## Status at handover

| Area | Status |
| --- | --- |
| Five public pages, project pages, 404, sitemap, robots, social cards | ✅ Working and tested |
| Five supplied videos: inspected, transcoded for the web, posters and stills from real frames | ✅ Working (see "Portfolio media") |
| Category filters (only categories with published projects are shown) | ✅ Working and tested |
| Accessible video dialog (keyboard, Escape, focus return), lazy video loading | ✅ Working and tested |
| Contact form: validation, spam protection, saving to the database, honest confirmation | ✅ Working and tested |
| Dashboard: sign-in, server-side protection, full project lifecycle, enquiries | ✅ Working and tested |
| Uploads to local disk (development) | ✅ Tested |
| Uploads to S3-compatible storage (R2/S3) | ✅ Tested against a local S3 emulator. **Not yet tested against a real bucket** (needs your account) |
| Enquiry email notifications | ⏳ Built. **Not sent or tested** until a Resend API key and verified sender are configured |
| KYNDE logo files | ⏳ **Not received.** A temporary text wordmark and "KM" placeholder are in use (see "Logo assets") |
| Hosting / domain | ⏳ Not deployed. Nothing has been published or purchased |
| Privacy notice | ⚠️ A draft that describes the implemented data handling. Needs your review |

---

## Technology and hosting

| Need | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, React 19, TypeScript) | Server rendering for SEO, server actions for secure mutations |
| Database | **PostgreSQL** via Drizzle ORM (SQL migrations in `drizzle/`) | Durable and portable: Neon, Supabase, RDS or self-hosted all work |
| Media storage | **Any S3-compatible bucket**. Cloudflare R2 recommended | Browsers upload straight to the bucket, so large videos avoid serverless size limits. R2 has no egress fees, which suits video |
| Auth | Built in: one administrator account (scrypt password hash) and database-backed sessions | No third-party identity provider needed. No public sign-up |
| Email | **Resend** (optional) | Simple HTTPS API. Enquiries are saved whether or not email is configured |

### Supported deployment target: Vercel

This build is developed and tested for **Node.js hosting**. Vercel is the documented target. It also runs on any Node 20+ server (`npm run build && npm start`).

**Cloudflare:** Next.js can run on Cloudflare Workers through the OpenNext adapter (`@opennextjs/cloudflare`). This project has **not** been built or tested that way. It would need the adapter and a `wrangler` config. The database would connect through Cloudflare Hyperdrive or a serverless Postgres driver, and the `local` storage driver could not be used. If you choose Cloudflare, plan a short porting and testing step. Using **Cloudflare R2 for media together with Vercel for the site** works without changes.

### Accounts you will need (all have free tiers; nothing has been created or purchased)

1. **Vercel**: hosting.
2. **Neon** (or another Postgres provider): database.
3. **Cloudflare**: R2 bucket for uploads (a custom domain is optional).
4. **Resend** (optional): enquiry notification emails. Needs a domain you can add DNS records to.

---

## Local development

Requirements: Node.js 20.9+ and PostgreSQL 14+ (Docker works: `docker compose up -d`).

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edit `.env.local`. For local work these values are enough:

```
DATABASE_URL=postgres://kynde:kynde_local@localhost:5432/kynde
AUTH_SECRET=<any random string of 32+ characters>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STORAGE_DRIVER=local
```

Then run each of these:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run admin:create -- --email you@yourdomain.com
```

```bash
npm run dev
```

The seed command creates the five portfolio projects. The admin command prompts you for a password.

Open http://localhost:3000. The dashboard is at http://localhost:3000/admin.

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Create a new SQL migration after editing `src/lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run db:seed` | Add the initial projects and register their media (safe to re-run) |
| `npm run admin:create -- --email …` | Create an administrator, or reset their password |
| `npm run test:e2e` | Browser tests against a running server (see "Testing") |

---

## Environment variables

See `.env.example` (names only). Summary:

- **Required:** `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`
- **Media:** `STORAGE_DRIVER=s3` with `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`. Optional: `UPLOAD_MAX_IMAGE_MB`, `UPLOAD_MAX_VIDEO_MB`
- **Email (optional):** `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_NOTIFY_TO`
- **Rate limiting:** `CLIENT_IP_HEADER` (`x-forwarded-for` on Vercel, `cf-connecting-ip` behind Cloudflare)

Secrets are only read on the server and are never sent to the browser. `.env*` files are git-ignored.

---

## Database

Schema: `src/lib/db/schema.ts`. Migrations: `drizzle/`.

| Table | Purpose |
| --- | --- |
| `projects` | Portfolio entries: title, slug, category, summary, optional case-study fields, media URLs, featured, order, status (`draft` / `published` / `archived`) |
| `media_assets` | Every uploaded file, so it can be re-selected from the media library |
| `enquiries` | Contact-form submissions, plus the real outcome of the email notification |
| `admin_users` | Administrator accounts (scrypt password hashes) |
| `admin_sessions` | Server-side sessions (only a SHA-256 hash of each cookie token is stored) |
| `rate_limit_events` | Sign-in and enquiry rate limiting (keys are HMAC-hashed; no raw IPs) |

After changing the schema, run `npm run db:generate`, review the new SQL file, commit it, then run `npm run db:migrate` against each environment.

---

## Administrator setup (secure owner access)

There is **no public sign-up page**, and no email address gets admin rights automatically. That includes the public contact address. Access is created from a terminal by someone with the production `DATABASE_URL`:

```bash
DATABASE_URL="<production connection string>" npm run admin:create -- --email you@yourdomain.com --name "Your Name"
```

- You will be asked for a password (minimum 12 characters; hidden input). Use a password manager.
- Running the same command again for an existing email **resets the password** and signs out all of that account's sessions.
- Sign-in is rate limited: 5 attempts per account and 20 per IP every 15 minutes.
- Sessions last 14 days, in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`__Host-` prefixed in production).
- **Every dashboard page, server action, upload endpoint and media endpoint checks the session against the database.** The `src/proxy.ts` redirect is only a convenience.
- Dashboard and preview routes send `noindex` and are disallowed in `robots.txt`.

---

## Media storage setup (Cloudflare R2)

1. In Cloudflare, go to **R2** and **Create bucket**, e.g. `kynde-media`.
2. Make files publicly readable. Either connect a **Custom Domain** (recommended, e.g. `media.yourdomain.com`) or enable the **r2.dev** public URL. Use that URL as `S3_PUBLIC_BASE_URL`.
3. Go to **R2 → Manage API tokens** and create a token with **Object Read & Write** on this bucket. Use its Access Key ID and Secret as `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`.
4. Set `S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`, `S3_REGION=auto`, `S3_BUCKET=kynde-media` and `STORAGE_DRIVER=s3`.
5. Add a **CORS policy** to the bucket. Browsers upload directly to the bucket, and the "use this frame as thumbnail" tool reads video pixels:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

6. Redeploy. `S3_PUBLIC_BASE_URL` is also read at build time so Next.js can optimise images from that domain.

How uploads work: the dashboard asks the server for permission. The server checks that you are signed in and checks the file type and size, then returns a 15-minute signed upload URL. The browser uploads directly to R2. The server then confirms that the object exists and that its first bytes match the declared type (a real JPEG/PNG/WebP/AVIF/MP4/WebM). Files that fail are deleted. Allowed: JPG, PNG, WebP and AVIF images (10 MB); MP4 and WebM videos (500 MB). Both limits are configurable.

**Video tips:** upload MP4 (H.264 + AAC) with "fast start" enabled. Most export presets ("Web", "YouTube 1080p") produce this. For long films you can also host on YouTube or Vimeo and paste the link. Those players load only when a visitor presses play.

**AWS S3 or other providers:** use the same variables with the provider's endpoint and region.

`STORAGE_DRIVER=local` stores uploads in `.data/uploads` and is for development only. It is refused in production unless `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true` is set, which is only appropriate on a single server with a persistent disk.

---

## Enquiry email notifications

Every enquiry is **saved to the database first** and shown in **Dashboard → Enquiries**. Email is an extra notification:

1. Create a Resend account and **verify your domain** (add the DNS records Resend gives you).
2. Create an API key and set `RESEND_API_KEY`.
3. Set `ENQUIRY_FROM_EMAIL` to an address on the verified domain, e.g. `KYNDE Motion <enquiries@yourdomain.com>`.
4. Optionally set `ENQUIRY_NOTIFY_TO`. It defaults to `flowsyncdigital@gmail.com`. Replies go to the visitor's address.

The dashboard shows the real outcome for each enquiry: **Notified** (accepted by Resend), **Email failed** (with the provider's error) or **No email sent** (not configured). Visitors are only ever told that their enquiry was *received*, never that an email was sent.

Spam protection: a hidden honeypot field, a signed render-time token (rejects instant bot submissions and stale forms), and a limit of 5 enquiries per hour per IP (stored hashed).

---

## Deploying to Vercel

1. Push this repository to GitHub and **Import** it in Vercel (the framework is detected as Next.js).
2. Create a Neon database (or use Vercel's Neon integration) and copy the **pooled** connection string into `DATABASE_URL`.
3. Add the other environment variables (see `.env.example`). Set `NEXT_PUBLIC_SITE_URL` to your final domain.
4. Run the migrations and seed **from your computer** against the production database:

```bash
DATABASE_URL="<prod>" npm run db:migrate
```

```bash
DATABASE_URL="<prod>" npm run db:seed
```

```bash
DATABASE_URL="<prod>" npm run admin:create -- --email you@yourdomain.com
```

5. Deploy, then add your domain in Vercel → Domains.
6. Open `/admin/login`, sign in, and check that a test upload works. That confirms the R2 credentials and CORS.

The five seed videos (about 44 MB) live in `public/media/` and are served from Vercel's CDN with long cache headers. Anything you upload later goes to R2.

---

## Portfolio media

All five supplied Google Drive videos were accessible. Each one was downloaded and watched before categories and descriptions were written:

| # | Working title | Category | Notes |
| --- | --- | --- | --- |
| 1 | Body Glow Creator Ad | UGC & AI Video Ads | Vertical 9:16, 58 s |
| 2 | Supply Chain Intelligence | Product Explainers | 16:9, 2 min |
| 3 | Conversational Commerce | Product Explainers | 16:9, 1 min 31 s |
| 4 | Colombia in Bricks | Brand Films | 16:9, 62 s |
| 5 | Clean Energy Futures | Brand Films | 16:9, 60 s |

- The titles are **neutral working titles**. Some videos show third-party product or company names on screen. We have **not** named any client, result or responsibility, because none was supplied. Edit titles and add confirmed details in the dashboard.
- For each video there is a web-optimised MP4 (H.264, fast start), a 6-second silent hover preview, a poster frame and gallery stills. Every image is a genuine frame from the videos. The hero background reel is a montage of short silent clips from the same videos.
- Google Drive share links are not used for playback. The files are served from the site itself (and later from R2).
- Categories without real projects (Website Design, Shopify & E-commerce, Product Commercials, Digital Campaigns) stay hidden until you publish a project in them.

---

## Logo assets

The two logo files mentioned in the brief (*KYNDE Motion Monogram Logo.png* and *KM Monogram Logo Variations-1.png*) **were not available in this build session**. Until they are added:

- The header and footer use a **temporary text wordmark** ("KYNDE Motion" set in Inter Tight).
- The floating nav and favicon use a **plain "KM" placeholder**. It is not an imitation of your logo.

To install the real logo:

1. Prepare individual transparent files from the supplied sheet, without stretching. Ideally use **SVG** or high-resolution **PNG** (at least 2× the display size):
   - `public/brand/kynde-motion-wordmark-white.png`: the full wordmark for dark backgrounds
   - `public/brand/km-monogram-cyan.png`: a square monogram
2. Set their paths and pixel sizes in `src/content/brand.ts`.
3. Replace `src/app/icon.svg` with the monogram (SVG), or add `src/app/icon.png` (512×512).

If the originals only exist as a combined sheet or a flattened JPG, ask your designer for vector (SVG/AI/PDF) or transparent PNG exports of each variation.

---

## Editing site content

Project content is managed in the dashboard. Fixed copy lives in small, readable files:

| File | Content |
| --- | --- |
| `src/content/site.ts` | Contact details, social links, sectors, regions |
| `src/content/services.ts` | The six services and their deliverables |
| `src/content/testimonials.ts` | The three genuine testimonials (do not add titles, ratings or photos that were not supplied) |
| `src/content/enquiry-options.ts` | Budget and timeline options on the contact form |
| `src/content/categories.ts` | Portfolio categories |
| `src/app/(site)/privacy/page.tsx` | Privacy notice (draft for owner review) |

---

## Testing

`tests/e2e.mjs` runs 29 browser checks. They cover all public pages and their headings, the home section order, lazy video loading, filters, video dialog keyboard behaviour, the testimonial dialog, the mobile menu, reduced motion, contact validation, spam protection and submission, dashboard protection (signed out, forged cookie, cross-origin), file-type and size validation, and the full project lifecycle: upload → draft → preview → frame capture → publish → edit → unpublish → archive → restore → delete. They also check sign-out invalidation.

Start the site, then run the tests:

```bash
npm run build && npm start
```

```bash
ADMIN_EMAIL=you@… ADMIN_PASSWORD=… npm run test:e2e
```

The tests need Playwright with Chromium. They create one test enquiry and a temporary project, then delete the project. The enquiry limit (5 per hour per IP) also applies to test runs, so more than five runs in an hour will fail the enquiry check by design.

---

## Accessibility, performance and SEO notes

- Semantic landmarks, one `h1` per page, skip link, visible focus, labelled form fields with linked error messages, and keyboard-operable menus and dialogs. axe-core reported no WCAG A/AA violations on the public pages at desktop and mobile widths.
- Motion is progressive enhancement. Content is fully visible without JavaScript. Reveals, parallax, tilt and the statement word-reveal turn off when the visitor prefers reduced motion, and parallax and tilt are disabled on touch devices. Background videos have pause controls.
- Videos use `preload="none"` with poster frames. Hover previews are small silent clips. Full videos load only when a visitor presses play.
- Images use `next/image` (responsive sizes, AVIF/WebP). Fonts are self-hosted (Inter and Inter Tight, SIL Open Font License).
- Each page has its own title, description and canonical URL, plus Open Graph and Twitter cards and a generated social image. `sitemap.xml` includes published projects. `robots.txt` excludes `/admin`, `/api` and `/preview`.
- No analytics or tracking cookies are installed. If you add analytics later, add a consent banner where required and update the privacy notice.

## Recommended before launch

- Add the real logo files.
- Review the privacy notice, and add your business name and hosting providers.
- Configure R2 and Resend, then send yourself a test enquiry.
- Confirm project titles and add any client details you have permission to share.
- Consider adding a Content-Security-Policy header once your final media and video domains are known.
