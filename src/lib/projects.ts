import "server-only";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { categories } from "@/content/categories";
import { db, schema } from "./db";
import type { Project, ProjectStatus } from "./db/schema";

const p = schema.projects;
const publicOrder = [asc(p.sortOrder), desc(p.publishedAt)];

export async function getPublishedProjects(category?: string): Promise<Project[]> {
  const where = category ? and(eq(p.status, "published"), eq(p.category, category)) : eq(p.status, "published");
  return db().select().from(p).where(where).orderBy(...publicOrder);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const featured = await db()
    .select()
    .from(p)
    .where(and(eq(p.status, "published"), eq(p.featured, true)))
    .orderBy(...publicOrder)
    .limit(limit);
  if (featured.length) return featured;
  return db().select().from(p).where(eq(p.status, "published")).orderBy(...publicOrder).limit(limit);
}

export async function getPublishedBySlug(slug: string): Promise<Project | null> {
  const rows = await db().select().from(p).where(and(eq(p.slug, slug), eq(p.status, "published"))).limit(1);
  return rows[0] ?? null;
}

/** Categories that currently contain at least one published project, in canonical order. */
export async function getActiveCategories() {
  const rows = await db()
    .select({ category: p.category, n: sql<number>`count(*)::int` })
    .from(p)
    .where(eq(p.status, "published"))
    .groupBy(p.category);
  const counts = new Map(rows.map((r) => [r.category, r.n]));
  return categories.filter((c) => counts.has(c.slug)).map((c) => ({ ...c, count: counts.get(c.slug)! }));
}

export async function getNextProject(current: Project): Promise<Project | null> {
  const all = await getPublishedProjects();
  if (all.length < 2) return null;
  const i = all.findIndex((x) => x.id === current.id);
  return all[(i + 1) % all.length];
}

// ---------- Admin ----------

export async function adminListProjects(status: ProjectStatus) {
  return db()
    .select()
    .from(p)
    .where(eq(p.status, status))
    .orderBy(status === "archived" ? desc(p.archivedAt) : asc(p.sortOrder), desc(p.updatedAt));
}

export async function adminCounts() {
  const rows = await db().select({ status: p.status, n: sql<number>`count(*)::int` }).from(p).groupBy(p.status);
  const out: Record<ProjectStatus, number> = { draft: 0, published: 0, archived: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function adminGetProject(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await db().select().from(p).where(eq(p.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function slugTaken(slug: string, exceptId?: string) {
  const rows = await db()
    .select({ id: p.id })
    .from(p)
    .where(exceptId ? and(eq(p.slug, slug), ne(p.id, exceptId)) : eq(p.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function nextSortOrder() {
  const [{ max }] = await db().select({ max: sql<number>`coalesce(max(${p.sortOrder}), 0)::int` }).from(p);
  return max + 1;
}
