import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { postures } from "../config";

export type County = CollectionEntry<"counties">["data"];

export async function getCounty(id: string): Promise<County> {
  const entry = await getEntry("counties", id);
  if (!entry) throw new Error(`No county data file for "${id}" in src/data/counties/`);
  return entry.data;
}

export function postureColor(label: string | undefined): string | undefined {
  return postures.find((p) => p.label === label)?.color;
}

/** Fill for a profiled county whose posture isn't set yet. */
export const POSTURE_UNSET_COLOR = "#c3c2b7";

export function postureText(c: County): string {
  if (!c.posture) return "Posture not set";
  const trend = c.posture.trend ? `, trending ${c.posture.trend}` : "";
  return `${c.posture.label}${trend}`;
}

/** Published profiles joined with their county data, sorted by county name. */
export async function getProfiles() {
  const profiles = await getCollection("profiles", (p) => import.meta.env.DEV || !p.data.draft);
  const joined = await Promise.all(
    profiles.map(async (p) => ({
      id: p.id,
      href: `/counties/${p.id}/`,
      profile: p,
      county: await getCounty(p.data.county.id),
    })),
  );
  return joined.sort((a, b) => a.county.name.localeCompare(b.county.name));
}
