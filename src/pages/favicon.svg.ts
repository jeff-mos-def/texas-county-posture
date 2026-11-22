// Favicon drawn from the Texas outline at build time.
import type { APIRoute } from "astro";
import { texasMap } from "../lib/texas";

export const GET: APIRoute = () => {
  const map = texasMap(60, 60);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 64 64"><path d="${map.outline}" fill="#1f2428"/></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
};
