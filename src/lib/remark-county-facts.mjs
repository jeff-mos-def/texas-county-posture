// Replaces [[path|format]] tokens in a county profile's prose with values
// from that county's data file, so the text can't drift from the charts.
// Example: "Ballots cast rose by [[derived.ballotsAdded|count]]."
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatToken } from "./facts.mjs";

const TOKEN = /\[\[([^\]]+)\]\]/g;

export function remarkCountyFacts() {
  return (tree, file) => {
    const frontmatter = file.data?.astro?.frontmatter ?? {};
    const countyId = frontmatter.county;
    if (!countyId) return;

    const dataPath = resolve(process.cwd(), "src/data/counties", `${countyId}.json`);
    const county = JSON.parse(readFileSync(dataPath, "utf8"));

    // Hand the county id to chart components so a profile can write <TurnoutChart />.
    walkAll(tree, (node) => {
      if (
        (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
        COUNTY_COMPONENTS.has(node.name) &&
        !node.attributes?.some((a) => a.name === "county")
      ) {
        node.attributes = [
          ...(node.attributes ?? []),
          { type: "mdxJsxAttribute", name: "county", value: countyId },
        ];
      }
    });

    walk(tree, (parent) => {
      // Merge adjacent text nodes first; the parser can split "[[" from the rest.
      const merged = [];
      for (const child of parent.children) {
        const prev = merged[merged.length - 1];
        if (child.type === "text" && prev?.type === "text") {
          prev.value += child.value;
        } else {
          merged.push(child.type === "text" ? { ...child } : child);
        }
      }
      for (const node of merged) {
        if (node.type === "text" && node.value.includes("[[")) {
          node.value = node.value.replace(TOKEN, (_, expr) => formatToken(county, expr));
        }
      }
      parent.children = merged;
    });
  };
}

export const COUNTY_COMPONENTS = new Set([
  "TurnoutChart",
  "AreaShift",
  "DownBallot",
  "Demographics",
  "MarginTrend",
  "DataCard",
]);

function walkAll(node, visit) {
  visit(node);
  if (Array.isArray(node.children)) for (const child of node.children) walkAll(child, visit);
}

function walk(node, visit) {
  if (Array.isArray(node.children)) {
    visit(node);
    for (const child of node.children) walk(child, visit);
  }
}
