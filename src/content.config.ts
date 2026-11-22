import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { postures } from "./config";

const postureLabel = z.enum(postures.map((p) => p.label) as [string, ...string[]]);
const margin = z.number(); // R share minus D share, in points

// One data file per county: src/data/counties/<id>.json
const counties = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/data/counties" }),
  schema: z.object({
    name: z.string(),
    // Five-digit county FIPS code, for example "48029" for Bexar.
    // null draws no shape on the maps (used by the fictional sample).
    fips: z.string().regex(/^48\d{3}$/).nullable(),
    sample: z.boolean().default(false),
    updated: z.coerce.date(),
    // Leave posture out until the cutoffs in src/config.ts are set.
    // Pages show "Posture not set" for a county without one.
    posture: z
      .object({
        label: postureLabel,
        trend: z.string().optional(),
        previous: z.object({ label: postureLabel, year: z.number() }).optional(),
      })
      .optional(),
    population: z.object({
      total: z.number(),
      changePct: z.number().optional(),
      baseline: z.string().optional(),
    }),
    registeredVoters: z.number(),
    precincts: z.number(),
    turnout: z.array(z.object({ year: z.number(), pct: z.number(), ballots: z.number() })).min(1),
    votesAdded: z.object({ since: z.number(), dem: z.number(), rep: z.number() }).optional(),
    topRace: z.object({
      year: z.number(),
      race: z.string(),
      rep: z.number(),
      dem: z.number(),
      other: z.number().optional(),
    }),
    marginHistory: z
      .array(z.object({ year: z.number(), race: z.string(), margin }))
      .min(1),
    // Years from marginHistory to show shifts against in the data card.
    // Leave out to compare against every earlier election.
    shiftBaselines: z.array(z.number()).optional(),
    areas: z.object({
      before: z.number(),
      after: z.number(),
      list: z.array(
        z.object({
          slug: z.string(),
          name: z.string(),
          note: z.string().optional(),
          precincts: z.number(),
          ballots: z.number(),
          ballotsChangePct: z.number(),
          marginBefore: margin,
          marginAfter: margin,
        }),
      ),
    }),
    downBallot: z.array(
      z.object({
        slug: z.string(),
        race: z.string(),
        result: z.string(),
        margin,
        topOfTicket: margin,
        topOfTicketArea: z.string(),
      }),
    ),
    demographics: z.object({
      source: z.string(),
      shares: z.array(z.object({ slug: z.string(), name: z.string(), pct: z.number() })),
      medianAge: z.number(),
      medianHouseholdIncome: z.number(),
    }),
    sources: z.array(z.object({ name: z.string(), use: z.string() })),
    // Reference facts for the County details panel. Leave out to hide the panel.
    // Population and median age come from the fields above; total area and
    // percent rural are computed from these values.
    details: z
      .object({
        website: z.string().url(),
        seat: z.string(),
        established: z.number(),
        landSqMi: z.number(),
        waterSqMi: z.number(),
        urbanPct: z.number(),
        latitude: z.number(),
        longitude: z.number(),
      })
      .optional(),
  }),
});

// One MDX profile per county: src/content/profiles/<id>.mdx
const profiles = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/profiles" }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    county: reference("counties"),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { counties, profiles };
