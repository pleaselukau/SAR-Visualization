import { useEffect, useRef } from "react";

import * as d3 from "d3";


export default function ScatterPlot({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 300;
    const margin = 40;

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([margin, width - margin]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([height - margin, margin]);

    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", "steelblue");

    svg.append("g")
      .attr("transform", `translate(0,${height - margin})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(y));
  }, [data]);

  return <svg ref={ref} width={400} height={300}></svg>;
}