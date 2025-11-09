import { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function RadarChart({ compounds, selectedIds, setSelectedIds }) {
  const ref = useRef();

  useEffect(() => {
    if (!compounds || compounds.length === 0) return;

    const selectedCompounds = compounds.filter((c) =>
      selectedIds.includes(c["ID"])
    );

    const opacity = 1 / selectedCompounds.length;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;
    const radius = Math.min(width, height) / 2 - 40;
    const levels = 5;

    const axes = ["weight", "log_p", "log_d", "pka", "tpsa", "potency"];
    const axesDisplayNames = {
      weight: "Weight",
      log_p: "Log P",
      log_d: "Log D",
      pka: "pKa",
      tpsa: "TPSA",
      potency: "Potency",
    };
    const angleSlice = (2 * Math.PI) / axes.length;

    const rScale = {};
    axes.forEach((axis) => {
      rScale[axis] = d3
        .scaleLinear()
        .domain(d3.extent(compounds, (d) => +d[axis]))
        .range([0, radius]);
    });

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    for (let lvl = 1; lvl <= levels; lvl++) {
      g.append("circle")
        .attr("r", (radius * lvl) / levels)
        .attr("fill", "none")
        .attr("stroke", "#ccc");
    }

    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#999");

      g.append("text")
        .attr("x", x * 1.1)
        .attr("y", y * 1.1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "12px")
        .text(axesDisplayNames[axis]);
    });

    const radarLine = d3
      .lineRadial()
      .radius((d) => d.value)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    selectedCompounds.forEach((c) => {
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

      g.append("path")
        .datum(radarData)
        .attr("d", radarLine)
        .attr("fill", "steelblue")
        .attr("fill-opacity", opacity)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);
    });
  }, [compounds, selectedIds]);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
