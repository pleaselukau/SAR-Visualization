import { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function ParallelCoordiantePlot() {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    // Sample data: 5 properties, 20 compounds
    const data = d3.range(105).map(() => ({
      mw: Math.random() * 500,
      logp: Math.random() * 5,
      tpsa: Math.random() * 150,
      pka: Math.random() * 14,
      logd: Math.random() * 5
    }));

    const dimensions = ["mw", "logp", "tpsa", "pka", "logd"];
    const y = {};
    dimensions.forEach(d => {
      y[d] = d3.scaleLinear()
        .domain(d3.extent(data, p => p[d]))
        .range([height - 20, 20]);
    });

    const x = d3.scalePoint()
      .domain(dimensions)
      .range([50, width - 50]);

    // Line generator
    const line = d => d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));

    svg.selectAll("path")
      .data(data)
      .join("path")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-opacity", 0.5);
  }, []);

  return <svg ref={ref} className="w-full h-full"></svg>;
}