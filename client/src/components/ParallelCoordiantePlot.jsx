import { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function ParallelCoordiantePlot({
  compounds,
  selectedIds,
  setSelectedIds,
}) {
  const ref = useRef();

  useEffect(() => {
    if (!compounds || compounds.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    const margin = { top: 40, right: 30, bottom: 40, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dimensions = ["weight", "log_p", "log_d", "pka", "tpsa", "potency"];

    const y = {};

    dimensions.forEach((dim) => {
      y[dim] = d3
        .scaleLinear()
        .domain(d3.extent(compounds, (d) => +d[dim]))
        .range([innerHeight, 0]);
    });

    const x = d3.scalePoint().domain(dimensions).range([0, innerWidth]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Line generator for parallel coordinates
    const line = (d) => d3.line()(dimensions.map((p) => [x(p), y[p](+d[p])]));

    // Draw lines for each compound
    g.selectAll("path")
      .data(compounds)
      .join("path")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", (d) =>
        selectedIds.includes(d.ID) ? "orange" : "steelblue"
      )
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        // toggle selection
        if (selectedIds.includes(d.ID)) {
          setSelectedIds(selectedIds.filter((id) => id !== d.ID));
        } else {
          setSelectedIds([...selectedIds, d.ID]);
        }
      });

    // Draw vertical axes
    const axis = d3.axisLeft();
    const axesG = g
      .selectAll(".dimension")
      .data(dimensions)
      .join("g")
      .attr("class", "dimension")
      .attr("transform", (d) => `translate(${x(d)},0)`);

    axesG.each(function (dim) {
      d3.select(this).call(axis.scale(y[dim]));

      // Add axis label at top
      d3.select(this)
        .append("text")
        .attr("y", -10)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "12px")
        .text(dim);
    });
  }, [compounds, selectedIds]);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
