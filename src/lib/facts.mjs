// Shared by the charts, the data card, and the prose tokens, so every number
// on a county page comes from the same place.

/** Margin is R share minus D share. Positive = R, negative = D. */
export function formatMargin(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const v = Math.round(Math.abs(value) * 10) / 10;
  if (v === 0) return "Even";
  return `${value > 0 ? "R" : "D"}+${v.toFixed(1)}`;
}

/** A shift is a change in margin. Negative = moved toward D. */
export function formatShift(value) {
  return formatMargin(value);
}

export function formatCount(value) {
  return Number(value).toLocaleString("en-US");
}

export function formatPct(value, digits = 1) {
  const v = Number(value);
  return `${digits === 0 ? Math.round(v) : String(Math.round(v * 10 ** digits) / 10 ** digits)}%`;
}

export function formatSignedPct(value) {
  const v = Number(value);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${formatPct(Math.abs(v))}`;
}

export function formatMoney(value) {
  return `$${formatCount(Math.round(value))}`;
}

function points(v) {
  return (Math.round(Math.abs(v) * 10) / 10).toFixed(1);
}

/** Values computed from a county's data file. */
export function derive(county) {
  const turnout = [...(county.turnout ?? [])].sort((a, b) => a.year - b.year);
  const first = turnout[0];
  const last = turnout[turnout.length - 1];
  const history = [...(county.marginHistory ?? [])].sort((a, b) => a.year - b.year);
  const latest = history[history.length - 1];
  const topRace = county.topRace;
  const topMargin = topRace ? topRace.rep - topRace.dem : latest?.margin;

  const shifts = history.slice(0, -1).map((h) => ({
    vs: `${h.year} ${h.race}`,
    year: h.year,
    race: h.race,
    from: h.margin,
    value: topMargin - h.margin,
  }));

  return {
    topMargin,
    latest,
    ballotsAdded: first && last ? last.ballots - first.ballots : undefined,
    ballotsChangePct:
      first && last ? ((last.ballots - first.ballots) / first.ballots) * 100 : undefined,
    shifts,
    areas: (county.areas?.list ?? []).map((a) => ({
      ...a,
      shift: a.marginAfter - a.marginBefore,
    })),
    downBallot: (county.downBallot ?? []).map((r) => ({
      ...r,
      vsTop: r.margin - r.topOfTicket,
    })),
  };
}

/**
 * Look up a dotted path such as "turnout.2026.ballots" or "derived.ballotsAdded".
 * Inside an array, a segment matches an item's `year`, `slug`, or `name`,
 * then falls back to a numeric index.
 */
export function lookup(county, path) {
  const root = { ...county, derived: derive(county) };
  let node = root;
  for (const seg of path.split(".")) {
    if (node === undefined || node === null) return undefined;
    if (Array.isArray(node)) {
      node =
        node.find((item) => String(item.year) === seg) ??
        node.find((item) => item.slug === seg) ??
        node.find((item) => slugify(item.name ?? item.race ?? "") === seg) ??
        node[Number(seg)];
    } else {
      node = node[seg];
    }
  }
  return node;
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const formats = {
  count: formatCount,
  pct: (v) => formatPct(v),
  pct0: (v) => formatPct(v, 0),
  signedpct: formatSignedPct,
  margin: formatMargin,
  shift: formatShift,
  money: formatMoney,
  points,
  raw: (v) => String(v),
};

export function formatToken(county, expr) {
  const [path, fmt] = expr.split("|").map((s) => s.trim());
  const value = lookup(county, path);
  if (value === undefined) {
    throw new Error(`County fact "${path}" not found in ${county.name ?? "county data"}`);
  }
  if (fmt) {
    const f = formats[fmt];
    if (!f) throw new Error(`Unknown format "${fmt}" in [[${expr}]]`);
    return f(value);
  }
  return typeof value === "number" ? formatCount(value) : String(value);
}
