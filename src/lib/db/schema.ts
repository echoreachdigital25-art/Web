import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Administrators. There is no public sign-up: rows are created only with
 * `npm run admin:create` (see README → "Administrator setup").
 */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)],
);

/** Server-side sessions. Only a SHA-256 hash of the cookie token is stored. */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(), // sha256(token)
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.userId)],
);

/**
 * Generic rate-limit ledger used for sign-in attempts and enquiry submissions.
 * `key` is a hashed identifier (never a raw IP address).
 */
export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bucket: text("bucket").notNull(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rate_limit_lookup_idx").on(t.bucket, t.key, t.createdAt)],
);

export type ProjectStatus = "draft" | "published" | "archived";
export type VideoSource = "file" | "youtube" | "vimeo" | "none";
export type Orientation = "landscape" | "portrait" | "square";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    summary: text("summary").notNull().default(""),
    // Optional case-study details. Leave empty unless confirmed and approved.
    client: text("client"),
    year: text("year"),
    role: text("role"),
    overview: text("overview"),
    deliverables: jsonb("deliverables").$type<string[]>().notNull().default([]),
    // Media
    thumbnailUrl: text("thumbnail_url"),
    thumbnailAlt: text("thumbnail_alt"),
    videoSource: text("video_source").$type<VideoSource>().notNull().default("none"),
    videoUrl: text("video_url"),
    previewUrl: text("preview_url"),
    orientation: text("orientation").$type<Orientation>().notNull().default("landscape"),
    gallery: jsonb("gallery").$type<{ url: string; alt: string }[]>().notNull().default([]),
    // Presentation
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<ProjectStatus>().notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("projects_slug_idx").on(t.slug),
    index("projects_status_order_idx").on(t.status, t.sortOrder),
  ],
);

/** Every file uploaded through the dashboard, so it can be re-selected later. */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").$type<"image" | "video">().notNull(),
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    originalName: text("original_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("media_assets_key_idx").on(t.storageKey)],
);

export type EmailStatus = "sent" | "failed" | "not_configured";

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    businessName: text("business_name"),
    email: text("email").notNull(),
    website: text("website"),
    service: text("service").notNull(),
    description: text("description").notNull(),
    budget: text("budget").notNull(),
    timeline: text("timeline").notNull(),
    emailStatus: text("email_status").$type<EmailStatus>().notNull().default("not_configured"),
    emailError: text("email_error"),
    readAt: timestamp("read_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiries_created_idx").on(t.createdAt)],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Enquiry = typeof enquiries.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
