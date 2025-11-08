import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function RadarChart() {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;
    const radius = Math.min(width, height) / 2 - 40;
    const levels = 5;

    const data = [
      { mw: 300, logp: 2, tpsa: 50, pka: 7, logd: 1.5 }
    ];

    const allAxes = ["mw", "logp", "tpsa", "pka", "logd"];
    const angleSlice = (2 * Math.PI) / allAxes.length;
    const rScale = d3.scaleLinear()
      .domain([0, 500]) // Adjust domain per property if needed
      .range([0, radius]);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Draw grid
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = radius * (lvl / levels);
      g.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ccc");
    }

    // Draw axes
    allAxes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const lineCoord = [
        [0, 0],
        [rScale(500) * Math.cos(angle), rScale(500) * Math.sin(angle)]
      ];
      g.append("line")
        .attr("x1", lineCoord[0][0])
        .attr("y1", lineCoord[0][1])
        .attr("x2", lineCoord[1][0])
        .attr("y2", lineCoord[1][1])
        .attr("stroke", "#999");
    });

    // Draw data
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    data.forEach(datum => {
      const radarData = allAxes.map(k => ({ axis: k, value: datum[k] }));
      g.append("path")
        .datum(radarData)
        .attr("d", radarLine)
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);
    });
  }, []);

  return <svg ref={ref} className="w-full h-full"></svg>;
}