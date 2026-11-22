// Texas county shapes from the Census Bureau's 2017 cartographic boundary
// files, as redistributed in the us-atlas package (counties-10m.json).
import us from "us-atlas/counties-10m.json";
import { feature, mesh, merge } from "topojson-client";
import { geoConicEqualArea, geoPath } from "d3-geo";
import type { Topology, GeometryCollection } from "topojson-specification";

const topo = us as unknown as Topology<{ counties: GeometryCollection<{ name: string }> }>;
const isTexas = (id: unknown) => String(id).startsWith("48");

const texasGeoms = topo.objects.counties.geometries.filter((g) => isTexas(g.id));
const texasCollection = { type: "GeometryCollection", geometries: texasGeoms } as GeometryCollection<{
  name: string;
}>;

const countyFeatures = (feature(topo, texasCollection) as any).features as Array<{
  id: string;
  properties: { name: string };
  geometry: any;
}>;
const outline = merge(topo, texasGeoms as any);
const borders = mesh(topo, topo.objects.counties, (a: any, b: any) => a !== b && isTexas(a.id) && isTexas(b.id));

export type TexasCounty = { fips: string; name: string; d: string };

export function texasMap(width: number, height: number) {
  const projection = geoConicEqualArea()
    .parallels([27.5, 35])
    .rotate([100, 0])
    .fitSize([width, height], outline as any);
  const path = geoPath(projection);
  const counties: TexasCounty[] = countyFeatures
    .map((f) => ({ fips: String(f.id), name: f.properties.name, d: path(f as any) ?? "" }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    counties,
    outline: path(outline as any) ?? "",
    borders: path(borders as any) ?? "",
    bounds: (fips: string) => {
      const f = countyFeatures.find((c) => String(c.id) === fips);
      return f ? path.bounds(f as any) : null;
    },
  };
}

/** Every Texas county, alphabetical, for search and the county index. */
export const texasCounties = countyFeatures
  .map((f) => ({ fips: String(f.id), name: f.properties.name }))
  .sort((a, b) => a.name.localeCompare(b.name));
