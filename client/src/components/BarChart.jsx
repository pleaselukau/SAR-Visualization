import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChart({
  data,
  width = 200,
  height = 120,
  direction = "up",
}) {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const barWidth = width / data.length;
    const maxValue = d3.max(data);

    const scale = d3.scaleLinear().domain([0, maxValue]).range([0, height]);

    const group = svg.append("g");

    group
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * barWidth + 10)
      .attr("width", barWidth - 20)
      .attr("height", (d) => scale(d))
      .attr("fill", "#3b82f6")
      .attr("y", (d) => (direction === "up" ? height - scale(d) : 0));
  }, [data, width, height, direction]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      className="overflow-visible"
    ></svg>
  );
}
