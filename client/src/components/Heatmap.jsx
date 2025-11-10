import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function Heatmap({ compounds, heatmapAndComparisonCompunds }) {
  const ref = useRef();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  useEffect(() => {
    if (!compounds || compounds.length === 0) return;

    const [comp1 = compounds[0], comp2 = compounds[1]] = (
      heatmapAndComparisonCompunds?.length
        ? compounds.filter((c) => heatmapAndComparisonCompunds.includes(c.ID))
        : []
    )
      .concat(compounds)
      .slice(0, 2);

    const displayNames = {
      weight: "Weight",
      log_p: "Log P",
      log_d: "Log D",
      pka: "pKa",
      tpsa: "TPSA",
    };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth || 400;
    const height = ref.current.clientHeight || 400;

    const margin = { top: 60, right: 20, bottom: 20, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const properties = ["weight", "log_p", "log_d", "pka", "tpsa"];

    // Create 5x5 matrix using absolute difference
    const data = [];
    properties.forEach((rowProp) => {
      properties.forEach((colProp) => {
        data.push({
          rowProp,
          colProp,
          value: Math.abs(+comp1[colProp] - +comp2[rowProp]), // absolute difference
        });
      });
    });

    const x = d3
      .scaleBand()
      .domain(properties)
      .range([0, innerWidth])
      .padding(0.05);

    const y = d3
      .scaleBand()
      .domain(properties)
      .range([0, innerHeight])
      .padding(0.05);

    const color = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, (d) => d.value)]);

    // Draw heatmap cells
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.colProp))
      .attr("y", (d) => y(d.rowProp))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d.value));

    // Column labels (compound 1 properties)
    g.append("g")
      .selectAll("text")
      .data(properties)
      .join("text")
      .attr("x", (d) => x(d) + x.bandwidth() / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text((d) => displayNames[d]);

    // Row labels (compound 2 properties)
    g.append("g")
      .selectAll("text")
      .data(properties)
      .join("text")
      .attr("x", -10)
      .attr("y", (d) => y(d) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .text((d) => displayNames[d]);

    // Optional: Add title for compound 1
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(comp1.name);

    // Optional: Add title for compound 2 (row axis)
    g.append("text")
      .attr("x", -margin.left + 20)
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr(
        "transform",
        `rotate(-90, ${-margin.left + 20}, ${innerHeight / 2})`
      )
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(comp2.name);
  }, [compounds, heatmapAndComparisonCompunds, windowSize]);

  return (
    <>
      <svg ref={ref} className="w-full h-full"></svg>
    </>
  );
}
