import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function ScatterPlot({
  compounds,
  selectedIds,
  setSelectedIds,
  scatterPlotDimensions,
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

    const dimensionMap = {
      1: ["weight", "log_p"],
      2: ["weight", "log_d"],
      3: ["weight", "pka"],
      4: ["weight", "tpsa"],
      5: ["weight", "potency"],
      6: ["log_p", "log_d"],
      7: ["log_p", "pka"],
      8: ["log_p", "tpsa"],
      9: ["log_p", "potency"],
      10: ["log_d", "pka"],
      11: ["log_d", "tpsa"],
      12: ["log_d", "potency"],
      13: ["pka", "tpsa"],
      14: ["pka", "potency"],
      15: ["tpsa", "potency"],
    };

    const displayNames = {
      weight: "Weight",
      log_p: "Log P",
      log_d: "Log D",
      pka: "pKa",
      tpsa: "TPSA",
      potency: "Potency",
    };

    const [xProp, yProp] = dimensionMap[scatterPlotDimensions] || [
      "weight",
      "log_p",
    ];

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

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(displayNames[xProp]);

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(displayNames[yProp]);
  }, [compounds, selectedIds, scatterPlotDimensions, windowSize]);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
