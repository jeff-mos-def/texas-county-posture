# Texas County Posture theme

An Astro 7 theme for publishing Texas county voting-posture profiles. Every
county page opens with charts and maps, and every number on the page comes from
that county's data file.

## Run it (Ubuntu)

Needs Node.js 22.23.4 or newer.

```bash
cd texas-county-posture
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
```

`dist/` is plain static files and can go on any static host.

## Values still to set

These are marked `UNSET` in the code:

| Value | Where |
|---|---|
| Publication name | `src/config.ts`, `site.name` |
| Posture cutoffs (Safe, Lean, Swing) | `src/config.ts`, `postureCutoffs` (pages show "TBD" while null) |
| Content width | `src/styles/global.css`, `--measure` and `--wide` (placeholders) |
| Breakpoints | Tailwind's built-in values are in use (`48rem`, `64rem` in component styles) |
| Production URL | `astro.config.mjs`, add `site` |
| About page text | `src/pages/about.astro` |

## Add a county

1. Copy `src/data/counties/caliche.json` to `src/data/counties/<id>.json` and
   fill it in. Set `fips` to the county's five-digit FIPS code (for example
   `"48029"` for Bexar) so it shows on the maps. Set `sample` to `false`.
2. Copy `src/content/profiles/caliche.mdx` to `src/content/profiles/<id>.mdx`,
   set `county: <id>` in the frontmatter, and write the profile.
3. Delete the Caliche files once real counties exist.

The build fails with a clear message if a data file is missing a required
field, so a half-filled county can't publish.

## Numbers in the text

Write `[[path|format]]` in a profile and the build replaces it with the value
from that county's data file:

```mdx
Ballots cast rose by [[derived.ballotsAdded|count]], about [[derived.ballotsChangePct|pct0]].
```

- Paths follow the JSON. Inside a list, use the item's `year` or `slug`:
  `turnout.2026.ballots`, `areas.list.northgate.ballotsChangePct`.
- `derived.*` holds computed values: `ballotsAdded`, `ballotsChangePct`,
  `topMargin`, `areas.<slug>.shift`, `downBallot.<slug>.vsTop`.
- Formats: `count` (4,063), `pct` (52.1%), `pct0` (30%), `signedpct` (+6.8%),
  `margin` (R+11.4), `shift` (D+13.5), `points` (17.2), `money` ($61,200),
  `raw` (as stored, for years).

A typo in a path stops the build and names the missing value.

## Charts in a profile

Place these anywhere in a profile's MDX. They read the profile's county on their own.

| Component | Shows |
|---|---|
| `<TurnoutChart />` | Ballots cast and turnout, then and now |
| `<AreaShift />` | Margin then and now for each part of the county, with a picker |
| `<DownBallot />` | Each local race against the top of the ticket |
| `<Demographics />` | Median age, income, and population shares |
| `<MarginTrend />` | Margin across elections (already in the page header) |
| `<Note>...</Note>` | A short method note |

The header (locator map, posture scale, margin trend, data card) and the
methodology footer are built into every county page.

## How the charts work

Charts are drawn as SVG during the build with Observable Plot, and maps with
d3-geo. Each chart is drawn at two widths so labels stay readable on phones.
Small scripts add hover tooltips, the area picker, county search, and the
county index filters. With JavaScript off, every chart still shows, and each
one has a "Show the numbers" table.

Color is reserved for votes: red and blue appear only on data marks and the
posture scale. Posture colors were checked for color-vision separation; re-check
before changing them.

County shapes: U.S. Census Bureau 2017 cartographic boundary files, from the
`us-atlas` package.

## Files

```
src/config.ts                  site name, nav, postures, cutoffs, definitions
src/content.config.ts          data file and profile schemas
src/data/counties/*.json       one data file per county
src/content/profiles/*.mdx     one profile per county
src/components/charts/         chart components
src/components/maps/           statewide map and locator map
src/pages/                     front page, county index, county pages, methodology, about
src/lib/facts.mjs              formatting and computed values shared by text and charts
src/lib/remark-county-facts.mjs  the [[path|format]] replacer
```
