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

    const width = ref.current.clientWidth || 400;
    const height = ref.current.clientHeight || 300;

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

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Y scales for each dimension ---
    const y = {};
    dimensions.forEach((dim) => {
      y[dim] = d3
        .scaleLinear()
        .domain(d3.extent(compounds, (d) => +d[dim]))
        .nice()
        .range([innerHeight, 0]);
    });

    // --- X scale for dimensions ---
    const x = d3.scalePoint().domain(dimensions).range([0, innerWidth]);

    // --- Brush state: active filters per dimension (data-space ranges) ---
    const activeFilters = {};

    // --- Helper: check if a compound passes all active filters ---
    const passesFilters = (d) => {
      return Object.entries(activeFilters).every(([dim, [min, max]]) => {
        const value = +d[dim];
        return value >= min && value <= max;
      });
    };

    // --- Line generator for a compound across all dimensions ---
    const line = (d) =>
      d3.line()(
        dimensions.map((p) => [x(p), y[p](+d[p])])
      );

    // --- Draw all polylines ---
    const paths = g
      .append("g")
      .attr("class", "paths")
      .selectAll("path")
      .data(compounds)
      .join("path")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", (d) =>
        selectedIds.includes(d.ID) ? "orange" : "steelblue"
      )
      .attr("stroke-opacity", (d) =>
        selectedIds.includes(d.ID) ? 1 : 0.4
      )
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        event.stopPropagation();
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

    // --- Function to update visual opacity based on filters + selection ---
    function updatePathStyles() {
      paths
        .attr("stroke-opacity", (d) => {
          const inFilter = passesFilters(d);
          const isSelected = selectedIds.includes(d.ID);
          if (!Object.keys(activeFilters).length) {
            // No filters: original behavior
            return isSelected ? 1 : 0.4;
          }
          // With filters: fade out non-matching
          if (!inFilter) return 0.05;
          return isSelected ? 1 : 0.8;
        })
        .attr("stroke", (d) =>
          selectedIds.includes(d.ID) ? "orange" : "steelblue"
        );
    }

    // --- Axes container ---
    const axis = d3.axisLeft();
    const axesG = g
      .selectAll(".dimension")
      .data(dimensions)
      .join("g")
      .attr("class", "dimension")
      .attr("transform", (d) => `translate(${x(d)},0)`);

    // --- Add axes, labels, and brushes ---
    axesG.each(function (dim) {
      const axisG = d3.select(this);

      // Axis
      axisG.call(axis.scale(y[dim]));

      // Label
      axisG
        .append("text")
        .attr("y", -10)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "12px")
        .text(displayNames[dim] || dim);

      // --- Brush for this dimension (range filter) ---
      const brush = d3
        .brushY()
        .extent([
          [-10, 0], // a little left/right padding
          [10, innerHeight],
        ])
        .on("brush end", (event) => {
          const sel = event.selection;
          if (!sel) {
            // Brush cleared → remove filter for this dim
            delete activeFilters[dim];
          } else {
            const [y0, y1] = sel;
            // Convert back from pixel space to data space
            const min = y[dim].invert(y1); // note: y is inverted
            const max = y[dim].invert(y0);
            activeFilters[dim] = [min, max];
          }
          updatePathStyles();
        });

      axisG
        .append("g")
        .attr("class", "brush")
        .call(brush);
    });

    // When selectedIds change, refresh styles (so filter + selection both apply)
    updatePathStyles();
  }, [compounds, selectedIds, windowSize]);

  return <svg ref={ref} className="w-full h-full"></svg>;
}
