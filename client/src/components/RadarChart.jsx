
// Imported React hooks for managing state and lifecycle
import { useRef, useEffect, useState } from "react";
// Imported D3.js for data visualization
import * as d3 from "d3";


// RadarChart component renders a radar (spider) chart for selected compounds using D3.js
// Props:
// - compounds: contains compound objects
// - selectedIds: contains selected compound IDs
// - setSelectedIds: function to update selected IDs
export default function RadarChart({ compounds, selectedIds, setSelectedIds }) {
  // Ref to the SVG element for D3 rendering
  const ref = useRef();

  // Track window size for responsive chart rendering
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });


  // Effect: Update window size state on resize for responsive chart
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Effect: Rendered the radar chart whenever data, selection, or window size changes
  useEffect(() => {
    // If no data is present then do nothing
    if (!compounds || compounds.length === 0) return;

    // Filtered compounds to only those that are selected
    const selectedCompounds = compounds.filter((c) =>
      selectedIds.includes(c["ID"])
    );

    // Have Set opacity so all selected compounds are visible (overlap)
    const opacity = 1 / selectedCompounds.length;

    // Selected the SVG element for D3 rendering
    const svg = d3.select(ref.current);
    // Cleared previous chart
    svg.selectAll("*").remove();

    // Got SVG dimensions
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;
    // Calculated radar chart radius
    const radius = Math.min(width, height) / 2 - 40;
    // Number of concentric levels (rings)
    const levels = 5;

    // Axes to plot (properties of compounds)
    const axes = ["weight", "log_p", "log_d", "pka", "tpsa", "potency"];
    // Human-readable axis labels
    const axesDisplayNames = {
      weight: "Weight",
      log_p: "Log P",
      log_d: "Log D",
      pka: "pKa",
      tpsa: "TPSA",
      potency: "Potency",
    };
    // Angle between each axis
    const angleSlice = (2 * Math.PI) / axes.length;

    // Created a scale for each axis based on data extent
    const rScale = {};
    axes.forEach((axis) => {
      rScale[axis] = d3
        .scaleLinear()
        .domain(d3.extent(compounds, (d) => +d[axis]))
        .range([0, radius]);
    });

    // Main group for chart, centered in SVG
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Have Drawn concentric circles for levels
    for (let lvl = 1; lvl <= levels; lvl++) {
      g.append("circle")
        .attr("r", (radius * lvl) / levels)
        .attr("fill", "none")
        .attr("stroke", "#ccc");
    }

    // Drawn axes (lines and labels)
    axes.forEach((axis, i) => {
      // Calculated angle for this axis
      const angle = angleSlice * i - Math.PI / 2;
      // Calculated end point for axis line
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      // Drawn axis line
      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#999");

      // Drawn axis label
      g.append("text")
        .attr("x", x * 1.1)
        .attr("y", y * 1.1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .text(axesDisplayNames[axis]);
    });

    // D3 line generator for radar polygons
    const radarLine = d3
      .lineRadial()
      .radius((d) => d.value)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Drawn radar polygons for each selected compound
    selectedCompounds.forEach((c) => {
      // Prepared data for this compound (scaled values for each axis)
      const radarData = axes.map((axis) => ({
        axis,
        value: rScale[axis](+c[axis]),
      }));

      // g.append("path")
      //   .datum(radarData)
      //   .attr("d", radarLine)
      //   .attr("fill", selectedIds.includes(c.ID) ? "orange" : "steelblue")
      //   .attr("fill-opacity", 0.0095)
      //   .attr("stroke", selectedIds.includes(c.ID) ? "orange" : "steelblue")
      //   .attr("stroke-width", 1.5)
      //   .style("cursor", "pointer")
      //   .on("click", () => {
      //     if (selectedIds.includes(c.ID)) {
      //       setSelectedIds(selectedIds.filter((id) => id !== c.ID));
      //     } else {
      //       setSelectedIds([...selectedIds, c.ID]);
      //     }
      //   });

      // Draw radar polygon for this compound
      g.append("path")
        .datum(radarData)
        .attr("d", radarLine)
        .attr("fill", "steelblue")
        .attr("fill-opacity", opacity)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);
    });
  }, [compounds, selectedIds, windowSize]);

  // Rendered SVG element for D3 to use
  return <svg ref={ref} className="w-full h-full"></svg>;
}
