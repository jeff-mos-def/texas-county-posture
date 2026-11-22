// Site-wide settings. Every value marked UNSET still needs a real value.

export const site = {
  // UNSET: the publication's name.
  name: "Publication name",
  // One line under the name on the front page.
  description:
    "How every Texas county votes, profiled one county at a time.",
};

export const nav = [
  { href: "/", label: "Map" },
  { href: "/counties/", label: "Counties" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/about/", label: "About" },
];

// Posture labels, ordered from most Democratic to most Republican.
// Colors were checked with the dataviz palette validator (ordinal arms plus
// a neutral gray midpoint). Change a color only after re-validating.
export const postures = [
  { label: "Safe D", color: "#1c5cab" },
  { label: "Lean D", color: "#86b6ef" },
  { label: "Swing", color: "#dcdad2" },
  { label: "Lean R", color: "#ef9694" },
  { label: "Safe R", color: "#c0302f" },
] as const;

export type PostureLabel = (typeof postures)[number]["label"];

// UNSET: margin cutoffs (in points) that separate Safe, Lean, and Swing.
// Leave null until decided. The methodology page shows "TBD" while null.
export const postureCutoffs: null | { safe: number; lean: number } = null;

// Party colors for chart marks. Text never uses these colors.
export const party = {
  dem: "#2a78d6",
  rep: "#e34948",
  other: "#898781",
};

export const definitions = [
  {
    term: "Margin",
    text: "Republican share minus Democratic share of all ballots cast in the race, in points. Shown as R+ or D+.",
  },
  {
    term: "Shift",
    text: "The change in margin between two elections, labeled by which party it moved toward.",
  },
  {
    term: "Posture",
    text: "Safe, Lean, or Swing, based on recent margins and the direction they are moving.",
  },
];

export const defaultSources = [
  { name: "Texas Secretary of State official canvass", use: "results, turnout" },
  { name: "U.S. Census Bureau ACS 5-year estimates", use: "demographics" },
  { name: "Texas Legislative Council Capitol Data Portal", use: "precinct history" },
];
