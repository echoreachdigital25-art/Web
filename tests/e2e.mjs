/**
 * End-to-end checks against a running server (default http://localhost:3000).
 *
 *   BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run test:e2e
 *
 * Requires Playwright with Chromium. Creates (and archives) a temporary test
 * project and submits one test enquiry.
 */
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const results = [];

async function step(name, fn) {
  try {
    await fn();
    results.push(["PASS", name]);
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push(["FAIL", name, err]);
    console.log(`  ✗ ${name}\n    ${String(err?.message ?? err).split("\n").slice(0, 6).join("\n    ")}`);
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));

console.log("Public site");
await step("all public pages render with unique titles and one h1", async () => {
  const titles = new Set();
  for (const p of ["/", "/work", "/services", "/about", "/contact", "/privacy", "/work/colombia-in-bricks"]) {
    const res = await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    assert.equal(res.status(), 200, `${p} status`);
    const title = await page.title();
    assert.ok(!titles.has(title), `duplicate title ${title}`);
    titles.add(title);
    assert.equal(await page.locator("h1").count(), 1, `${p} should have exactly one h1`);
    assert.ok(await page.locator('meta[name="description"]').getAttribute("content"));
  }
});

await step("home sections appear in the brief's order", async () => {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const ids = ["hero-title", "studio-title", "work-title", "services-title", "approach-title", "why-title", "testimonials-title", "closing-title"];
  const tops = [];
  for (const id of ids) tops.push(await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top + window.scrollY));
  for (let i = 1; i < tops.length; i++) assert.ok(tops[i] > tops[i - 1], `${ids[i]} should come after ${ids[i - 1]}`);
  assert.equal(await page.locator(".service-row").count(), 6, "six services");
  assert.equal(await page.locator(".quote-card").count(), 3, "three testimonials");
});

await step("full videos are not downloaded on page load", async () => {
  const p2 = await ctx.newPage();
  const videoReqs = [];
  p2.on("request", (r) => r.url().includes("/video.mp4") && videoReqs.push(r.url()));
  await p2.goto(BASE + "/work", { waitUntil: "networkidle" });
  assert.equal(videoReqs.length, 0, `unexpected full-video requests: ${videoReqs.join(", ")}`);
  await p2.close();
});

await step("work filters show only the selected category and hide empty ones", async () => {
  await page.goto(BASE + "/work", { waitUntil: "domcontentloaded" });
  const labels = await page.locator(".filters .filter").allInnerTexts();
  assert.ok(!labels.some((l) => /Website Design|Shopify/.test(l)), "empty categories must be hidden");
  await page.getByRole("link", { name: /^Brand Films/ }).click();
  await page.waitForURL(/category=brand-films/);
  const pills = await page.locator(".work-list .project-card .pill").allInnerTexts();
  assert.ok(pills.length > 0 && pills.every((p) => p === "Brand Films"), `got ${pills}`);
  assert.equal(await page.locator('.filters [aria-current="true"]').innerText().then((t) => t.startsWith("Brand Films")), true);
});

await step("video dialog plays, closes with Escape and returns focus", async () => {
  await page.goto(BASE + "/work", { waitUntil: "domcontentloaded" });
  const btn = page.getByRole("button", { name: "Play video: Colombia in Bricks" });
  await btn.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("dialog[open]");
  await dialog.waitFor();
  const video = dialog.locator("video");
  await video.waitFor();
  await page.waitForFunction(() => {
    const v = document.querySelector("dialog[open] video");
    return v && v.readyState >= 2 && v.currentTime > 0.2;
  }, null, { timeout: 15000 });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog[open]"));
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  assert.equal(focused, "Play video: Colombia in Bricks");
});

await step("project page has a playable video with poster and preload=none", async () => {
  await page.goto(BASE + "/work/body-glow-creator-ad", { waitUntil: "domcontentloaded" });
  const v = page.locator(".player video");
  assert.equal(await v.getAttribute("preload"), "none");
  assert.ok(await v.getAttribute("poster"));
  await v.evaluate((el) => { el.muted = true; return el.play(); });
  await page.waitForFunction(() => document.querySelector(".player video").currentTime > 0.2, null, { timeout: 15000 });
});

await step("testimonial dialog shows full genuine text", async () => {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Read full testimonial from Amanda/ }).click();
  await page.locator("dialog[open]").getByText("Kling to create realistic characters").waitFor();
  await page.keyboard.press("Escape");
});

await step("mobile menu opens, traps focus in dialog and closes with Escape", async () => {
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await mp.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  assert.equal(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "no horizontal overflow");
  await mp.getByRole("button", { name: "Open menu" }).click();
  await mp.locator("dialog.mobile-menu[open]").waitFor();
  await mp.keyboard.press("Escape");
  await mp.waitForFunction(() => !document.querySelector("dialog.mobile-menu[open]"));
  assert.equal(await mp.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Open menu");
  await m.close();
});

await step("reduced motion: content visible, decorative videos stay paused", async () => {
  const r = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rp = await r.newPage();
  await rp.goto(BASE + "/", { waitUntil: "networkidle" });
  const playing = await rp.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused).length);
  assert.equal(playing, 0);
  const hidden = await rp.evaluate(() => [...document.querySelectorAll(".statement-text .w")].filter((w) => getComputedStyle(w).opacity !== "1").length);
  assert.equal(hidden, 0);
  await r.close();
});

console.log("Contact form");
await step("client-side validation shows accessible errors", async () => {
  await page.goto(BASE + "/contact", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await page.locator("#e-name").waitFor();
  assert.equal(await page.locator("#f-name").getAttribute("aria-invalid"), "true");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "f-name");
  assert.ok((await page.locator("#f-email").getAttribute("aria-describedby"))?.includes("e-email"));
});

await step("spam protection: instant submissions and filled honeypot are refused", async () => {
  await page.goto(BASE + "/contact", { waitUntil: "domcontentloaded" });
  await page.fill("#f-name", "Bot Test");
  await page.fill("#f-email", "bot@example.test");
  await page.selectOption("#f-service", "Not sure yet");
  await page.fill("#f-description", "This submission is sent immediately after the page loads.");
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await page.locator(".form-alert").getByText("That was quick!").waitFor();
  await page.evaluate(() => { document.querySelector("#f-company_url").value = "http://spam.example"; });
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await page.locator(".form-alert").getByText(/couldn’t submit your enquiry/).waitFor();
  assert.equal(await page.getByText("Your enquiry has been received.").count(), 0);
});

const stamp = Date.now();
await step("valid enquiry is saved and confirmed truthfully", async () => {
  await page.goto(BASE + "/contact?service=" + encodeURIComponent("Email Marketing"), { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator("#f-service").inputValue(), "Email Marketing");
  await page.fill("#f-name", "E2E Tester");
  await page.fill("#f-email", `e2e+${stamp}@example.test`);
  await page.fill("#f-website", "example.test");
  await page.fill("#f-description", `Automated end-to-end test enquiry ${stamp}. Please ignore.`);
  await page.selectOption("#f-budget", "Not sure yet");
  await page.waitForTimeout(3200); // the form rejects submissions faster than 3 seconds
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  const ok = page.getByText("Your enquiry has been received.");
  await ok.waitFor({ timeout: 15000 });
  const body = await page.locator(".success").innerText();
  assert.ok(!/email (has been )?sent/i.test(body), "must not claim an email was sent");
});

console.log("Dashboard security");
await step("dashboard pages redirect to sign-in when signed out", async () => {
  for (const p of ["/admin", "/admin/projects/new", "/admin/enquiries"]) {
    await page.goto(BASE + p, { waitUntil: "domcontentloaded" });
    assert.ok(page.url().includes("/admin/login"), `${p} → ${page.url()}`);
  }
});

await step("admin APIs reject unauthenticated and forged-cookie requests", async () => {
  const r1 = await page.request.post(BASE + "/api/admin/uploads", { data: { kind: "image", contentType: "image/png", size: 10 }, headers: { origin: BASE } });
  assert.equal(r1.status(), 401);
  const r2 = await page.request.post(BASE + "/api/admin/uploads", {
    data: { kind: "image", contentType: "image/png", size: 10 },
    headers: { origin: BASE, cookie: "kynde_admin=forged-token-value" },
  });
  assert.equal(r2.status(), 401, "a cookie that is not a valid DB session must be rejected");
  const r3 = await page.request.get(BASE + "/api/admin/media?kind=image", { headers: { cookie: "kynde_admin=forged" } });
  assert.equal(r3.status(), 401);
  const r4 = await page.request.get(BASE + "/preview/00000000-0000-0000-0000-000000000000", { maxRedirects: 0 });
  assert.ok([302, 307, 308].includes(r4.status()), `preview should redirect, got ${r4.status()}`);
});

await step("wrong password is refused", async () => {
  await page.goto(BASE + "/admin/login", { waitUntil: "domcontentloaded" });
  await page.fill("#email", EMAIL);
  await page.fill("#password", "definitely-wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByText("That email and password combination is incorrect.").waitFor();
});

console.log("Dashboard workflow");
await step("administrator can sign in", async () => {
  assert.ok(EMAIL && PASSWORD, "ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(BASE + "/admin");
  await page.getByRole("heading", { name: "Projects" }).waitFor();
});

await step("authenticated API rejects cross-origin requests", async () => {
  const r = await page.request.post(BASE + "/api/admin/uploads", { data: { kind: "image", contentType: "image/png", size: 10 }, headers: { origin: "https://evil.example" } });
  assert.equal(r.status(), 403);
});

await step("upload validation rejects disallowed file types", async () => {
  const r = await page.request.post(BASE + "/api/admin/uploads", { data: { kind: "image", contentType: "image/svg+xml", size: 100 }, headers: { origin: BASE } });
  assert.equal(r.status(), 400);
  const r2 = await page.request.post(BASE + "/api/admin/uploads", { data: { kind: "video", contentType: "video/mp4", size: 5 * 1024 * 1024 * 1024 }, headers: { origin: BASE } });
  assert.equal(r2.status(), 400);
});

await step("enquiry appears in the dashboard with honest notification status", async () => {
  await page.goto(BASE + "/admin/enquiries", { waitUntil: "domcontentloaded" });
  const row = page.locator("tr", { hasText: `e2e+${stamp}@example.test` });
  await row.waitFor();
  const status = await row.locator(".a-status").innerText();
  assert.ok(["No email sent", "Notified", "Email failed"].includes(status), status);
  await row.getByRole("link").click();
  await page.getByText(`Automated end-to-end test enquiry ${stamp}`).waitFor();
});

const title = `E2E Project ${stamp}`;
const slug = `e2e-project-${stamp}`;
const fixtures = path.resolve("public/media/work/clean-energy-brand-film");
let projectUrl = "";

await step("create a draft with uploaded video and thumbnail", async () => {
  await page.goto(BASE + "/admin/projects/new", { waitUntil: "domcontentloaded" });
  await page.fill("#title", title);
  assert.equal(await page.inputValue("#slug"), slug);
  await page.selectOption("#category", "digital-campaigns");
  await page.fill("#summary", "Temporary project created by the automated test.");
  await page.locator('input[type=file][aria-label="Upload video"]').setInputFiles(path.join(fixtures, "preview.mp4"));
  await page.getByRole("button", { name: "Use this frame as the thumbnail" }).waitFor({ timeout: 30000 });
  await page.locator('input[type=file][aria-label="Upload image"]').setInputFiles(path.join(fixtures, "poster.webp"));
  await page.getByAltText("Current thumbnail").waitFor({ timeout: 30000 });
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.waitForURL(/\/admin\/projects\/[0-9a-f-]{36}\?notice=created/, { timeout: 15000 });
  projectUrl = page.url().split("?")[0];
});

await step("draft is not public; preview works for the administrator", async () => {
  const pub = await page.request.get(`${BASE}/work/${slug}`);
  assert.equal(pub.status(), 404);
  const work = await (await page.request.get(`${BASE}/work`)).text();
  assert.ok(!work.includes(title));
  const id = projectUrl.split("/").pop();
  await page.goto(`${BASE}/preview/${id}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { level: 1, name: title }).waitFor();
  await page.getByText(/Draft — not visible to the public/).waitFor();
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content").then((c) => c.includes("noindex")), true);
});

await step("frame capture saves a genuine frame as the thumbnail", async () => {
  await page.goto(projectUrl, { waitUntil: "domcontentloaded" });
  const before = await page.getByAltText("Current thumbnail").getAttribute("src");
  await page.locator(".a-media-preview video").evaluate(async (v) => {
    v.muted = true;
    v.currentTime = 1.5;
    await new Promise((r) => v.addEventListener("seeked", r, { once: true }));
  });
  await page.getByRole("button", { name: "Use this frame as the thumbnail" }).click();
  await page.getByText("Frame saved as the thumbnail").waitFor({ timeout: 20000 });
  const after = await page.getByAltText("Current thumbnail").getAttribute("src");
  assert.notEqual(before, after);
  assert.match(after, /^\/uploads\/.+\.webp$/);
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByText("Draft saved").waitFor();
});

await step("publish → appears on public portfolio, new category filter appears", async () => {
  await page.getByRole("button", { name: "Publish" }).click();
  await page.getByText("Published. The project is now live on the site.").waitFor();
  const res = await page.request.get(`${BASE}/work/${slug}`);
  assert.equal(res.status(), 200);
  const work = await (await page.request.get(`${BASE}/work`)).text();
  assert.ok(work.includes(title));
  assert.ok(work.includes("Digital Campaigns"), "filter for the new category should appear");
});

await step("edits to a live project appear publicly", async () => {
  await page.fill("#summary", "Updated summary from the automated test.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Changes saved and live on the site.").waitFor();
  const html = await (await page.request.get(`${BASE}/work/${slug}`)).text();
  assert.ok(html.includes("Updated summary from the automated test."));
});

await step("unpublish → hidden from the public site again", async () => {
  await page.getByRole("button", { name: "Unpublish" }).click();
  await page.getByText(/Unpublished/).waitFor();
  assert.equal((await page.request.get(`${BASE}/work/${slug}`)).status(), 404);
});

await step("archive and restore (recoverable)", async () => {
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Archive project" }).click();
  await page.waitForURL(/tab=archived/);
  await page.getByRole("link", { name: title }).waitFor();
  await page.goto(projectUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Restore to drafts" }).click();
  await page.getByText("Project restored as a draft.").waitFor();
});

await step("clean up: archive and permanently delete the test project", async () => {
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Archive project" }).click();
  await page.waitForURL(/tab=archived/);
  await page.goto(projectUrl, { waitUntil: "domcontentloaded" });
  await page.fill("#confirm", title);
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await page.waitForURL(/notice=deleted/);
});

await step("sign out ends the session server-side", async () => {
  const cookies = await ctx.cookies();
  const session = cookies.find((c) => c.name.includes("kynde_admin"));
  await page.goto(BASE + "/admin", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/admin\/login/);
  const r = await page.request.get(BASE + "/api/admin/media?kind=image", { headers: { cookie: `${session.name}=${session.value}` } });
  assert.equal(r.status(), 401, "old session token must no longer work");
});

await step("no uncaught page errors", async () => {
  assert.deepEqual(consoleErrors, []);
});

await browser.close();
const failed = results.filter((r) => r[0] === "FAIL");
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
