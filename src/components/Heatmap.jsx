import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function Heatmap() {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    const data = Array.from({ length: 5 }, () => 
      Array.from({ length: 5 }, () => Math.random())
    );

    const x = d3.scaleBand().domain(d3.range(5)).range([0, width]).padding(0.05);
    const y = d3.scaleBand().domain(d3.range(5)).range([0, height]).padding(0.05);
    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

    svg.selectAll()
      .data(data.flatMap((row, i) => row.map((v, j) => ({ i, j, v }))))
      .join("rect")
      .attr("x", d => x(d.j))
      .attr("y", d => y(d.i))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.v));
  }, []);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
