import { FeatureCollection, Geometry } from "geojson";
import { useAppContext } from "../contexts/AppContext";
import * as d3 from "d3";

import countries3to2 from "countries-list/minimal/countries.3to2.min.json";
import { useEffect, useRef } from "react";

const width = 960;
const height = 500;

export default function TopCountries() {
  const { stats } = useAppContext();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!stats) return;

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(Object.values(stats.countryDistribution)) || 0]);

    // Load GeoJSON data for world map
    d3.json<FeatureCollection<Geometry, { name: string }>>(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    ).then((world) => {
      if (!world) return;

      const projection = d3
        .geoNaturalEarth1()
        .scale(150)
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      // Draw the map
      d3.select(svgRef.current)
        .selectAll("path")
        .data(world.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
          const value =
            stats.countryDistribution[
              countries3to2[d.id as keyof typeof countries3to2]
            ];
          return value ? colorScale(value) : "#ccc"; // Default for missing data
        })
        .attr("stroke", "#333");
    });
  }, [stats, svgRef]);

  return (
    <div>
      <h2>Where is this being researched?</h2>
      <svg ref={svgRef} width="960" height="500"></svg>
    </div>
  );
}
