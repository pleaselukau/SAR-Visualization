import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function ParallelCoordiantePlot({
  compounds,
  selectedIds,
  setSelectedIds,
  setTooltip,
}) {
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

    const svg = d3.select(ref.current);

    svg.selectAll("*").remove();

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    const margin = { top: 30, right: 30, bottom: 30, left: 30 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const dimensions = ["weight", "log_p", "log_d", "pka", "tpsa", "potency"];

    const displayNames = {
      weight: "Weight",
      log_p: "Log P",
      log_d: "Log D",
      pka: "pKa",
      tpsa: "TPSA",
      potency: "Potency",
    };

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

    const line = (d) => d3.line()(dimensions.map((p) => [x(p), y[p](+d[p])]));

    g.selectAll("path")
      .data(compounds)
      .join("path")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", (d) =>
        selectedIds.includes(d.ID) ? "orange" : "steelblue"
      )
      .attr("stroke-opacity", (d) => (selectedIds.includes(d.ID) ? 1 : 0.5)) // .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        if (selectedIds.includes(d.ID)) {
          setSelectedIds(selectedIds.filter((id) => id !== d.ID));
        } else {
          setSelectedIds([...selectedIds, d.ID]);
        }
      })
      .on("mouseover", (event, d) => {
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          compound: d,
        });
      })
      .on("mousemove", (event) => {
        setTooltip((prev) => ({ ...prev, x: event.pageX, y: event.pageY }));
      })
      .on("mouseout", () => {
        setTooltip({ visible: false, x: 0, y: 0, compound: null });
      });

    const axis = d3.axisLeft();
    const axesG = g
      .selectAll(".dimension")
      .data(dimensions)
      .join("g")
      .attr("class", "dimension")
      .attr("transform", (d) => `translate(${x(d)},0)`);

    axesG.each(function (dim) {
      d3.select(this).call(axis.scale(y[dim]));

      d3.select(this)
        .append("text")
        .attr("y", -10)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "12px")
        .text(displayNames[dim] || dim);
    });
  }, [compounds, selectedIds, windowSize]);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
