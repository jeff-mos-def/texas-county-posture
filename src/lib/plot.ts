// Draws Observable Plot charts to SVG markup at build time.
import * as Plot from "@observablehq/plot";
import { parseHTML } from "linkedom";

export { Plot };

export function renderPlot(
  options: Plot.PlotOptions,
  after?: (svg: Element) => void,
): string {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  const node = Plot.plot({
    document: document as unknown as Document,
    style: { background: "transparent", fontSize: "13px", overflow: "visible" },
    ...options,
  }) as unknown as Element;
  // Plot adds its own <style>; the site CSS owns presentation instead.
  node.querySelectorAll("style").forEach((s) => s.remove());
  after?.(node);
  return node.outerHTML;
}

/** Tag each element of a mark group (by its className, prefixed "m-") with a data attribute, in data order. */
export function tagMark(svg: Element, name: string, attr: string, values: string[]) {
  const group = svg.querySelector(`g.m-${name}`);
  if (!group) return;
  Array.from(group.children).forEach((el, i) => {
    if (values[i] !== undefined) el.setAttribute(attr, values[i]);
  });
}

/** Axis formatter for margins: R+20, Even, D+10. */
export const marginTick = (d: number) => (d === 0 ? "Even" : `${d > 0 ? "R" : "D"}+${Math.abs(d)}`);

/** Chart widths, matched to the column each chart sits in, so text renders near its set size. */
export const WIDE = 832;
export const NARROW = 360;

/**
 * Renders a chart twice, at a wide and a narrow width, and lets CSS show the
 * one that fits. Build-time SVG can't reflow, so this keeps labels legible on phones.
 */
export function renderResponsive(
  build: (width: number) => Plot.PlotOptions,
  after?: (svg: Element) => void,
  wide = WIDE,
): string {
  return `<div class="v-wide">${renderPlot(build(wide), after)}</div><div class="v-narrow">${renderPlot(build(NARROW), after)}</div>`;
}

/** Nice symmetric-ish domain for margins that always includes Even. */
export function marginDomain(values: number[], pad = 5): [number, number] {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const lo = Math.floor((min - (min < 0 ? pad : 0)) / 10) * 10;
  const hi = Math.ceil((max + (max > 0 ? pad : 0)) / 10) * 10;
  // Symmetric around Even, sized to the most lopsided value, so both halves always show.
  const extent = Math.max(-lo, hi);
  return [-extent, extent];
}

export const ink = {
  ink: "#1f2428",
  ink2: "#52514e",
  muted: "#6d6b66",
  grid: "#e1e0d9",
  rule: "#c3c2b7",
  surface: "#fcfcfb",
  neutralBar: "#52514e",
};
