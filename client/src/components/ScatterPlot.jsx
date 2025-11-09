import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ScatterPlot({
  compounds,
  selectedIds,
  setSelectedIds,
  xProp = "weight",
  yProp = "log_p",
}) {
  const ref = useRef();

  useEffect(() => {
    if (!compounds || compounds.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(compounds, (d) => +d[xProp]))
      .nice()
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(compounds, (d) => +d[yProp]))
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw points
    g.selectAll("circle")
      .data(compounds)
      .join("circle")
      .attr("cx", (d) => x(+d[xProp]))
      .attr("cy", (d) => y(+d[yProp]))
      .attr("r", 5)
      .attr("fill", (d) =>
        selectedIds.includes(d.ID) ? "orange" : "steelblue"
      )
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("click", (event, d) => {
        if (selectedIds.includes(d.ID)) {
          setSelectedIds(selectedIds.filter((id) => id !== d.ID));
        } else {
          setSelectedIds([...selectedIds, d.ID]);
        }
      });

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xProp);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(yProp);
  }, [compounds, selectedIds, xProp, yProp]);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
