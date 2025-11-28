// ParallelCoordinatePlot component to visualize compounds across multiple dimensions

import { useRef, useEffect, useState, act } from "react";
import * as d3 from "d3";

// Fisheye scaling function for interactive distortion effect
function fisheyeScale(scale, focusX, distortion = 2) {
  const domain = scale.domain();
  const range = scale.range();

  const [r0, r1] = range;
  const axisLength = r1 - r0;

  const newPos = domain.map((d) => {
    const x = scale(d);
    const left = x < focusX;
    const dist = Math.abs(x - focusX);
    const factor = (distortion + 1) / (distortion + dist / axisLength);
    return left ? focusX - dist * factor : focusX + dist * factor;
  });

  const newScale = {};
  domain.forEach((d, i) => (newScale[d] = newPos[i]));
  return newScale;
}

export default function ParallelCoordiantePlot({
  compounds,
  selectedIds,
  setSelectedIds,
  setTooltip,
}) {
  const ref = useRef();

  // Active filters state for brushing
  const [activeFilters, setActiveFilters] = useState({});

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

    console.log("active filters:", JSON.stringify(activeFilters));

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

    //Y scales for each dimension
    const y = Object.fromEntries(
      dimensions.map((dim) => [
        dim,
        d3
          .scaleLinear()
          .domain(d3.extent(compounds, (d) => +d[dim]))
          .nice()
          .range([innerHeight, 0]),
      ])
    );

    //X scale for dimensions
    const x = d3.scalePoint().domain(dimensions).range([0, innerWidth]);

    // check if a compound passes all active filters
    const passesFilters = (d) =>
      Object.entries(activeFilters).every(
        ([dim, [min, max]]) => +d[dim] >= min && +d[dim] <= max
      );

    // Line generator for a compound across all dimensions
    const line = (d) => d3.line()(dimensions.map((p) => [x(p), y[p](+d[p])]));

    // Draw all polylines
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
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
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

    // Function to update path styles based on selection and filtering
    const updatePathStyles = () => {
      paths
        .attr("display", (d) => {
          // Selected compounds always visible
          if (selectedIds.includes(d.ID)) return "inline";

          // Non-selected compounds: only show if pass filters
          if (Object.keys(activeFilters).length === 0) return "inline";
          return passesFilters(d) ? "inline" : "none";
        })
        .attr("stroke", (d) =>
          selectedIds.includes(d.ID) ? "orange" : "steelblue"
        )
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");
    };

    // Axes container
    const axis = d3.axisLeft();
    const axesG = g
      .selectAll(".dimension")
      .data(dimensions)
      .join("g")
      .attr("class", "dimension")
      .attr("transform", (d) => `translate(${x(d)},0)`);

    // Add axes, labels, and brushes
    axesG.each(function (dim) {
      const axisG = d3.select(this);

      // Axis
      axisG.call(axis.scale(y[dim]));

      // Filter highlight container
      const filterG = axisG.append("g").attr("class", "filter-highlight");

      // Add white semi-transparent background for ticks
      axisG.selectAll(".tick").each(function () {
        const tick = d3.select(this);
        const text = tick.select("text");
        const bbox = text.node().getBBox();

        // Insert rect as a sibling before the text
        tick
          .insert("rect", "text")
          .attr("x", bbox.x - 1)
          .attr("y", bbox.y - 1)
          .attr("width", bbox.width + 2)
          .attr("height", bbox.height + 2)
          .attr("fill", "white")
          .attr("rx", 4)
          .attr("ry", 4);
      });

      // Axes Labels
      axisG
        .append("text")
        .attr("y", -10)
        .attr("x", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("font-size", "12px")
        .text(displayNames[dim] || dim);

      // Brush
      axisG
        .append("g")
        .attr("class", "brush")
        .call(
          d3
            .brushY()
            .extent([
              [-10, 0],
              [10, innerHeight],
            ])
            .on("brush end", (event) => {
              const sel = event.selection;
              setActiveFilters((prev) => {
                const updated = { ...prev };
                if (!sel) delete updated[dim];
                else
                  updated[dim] = [y[dim].invert(sel[1]), y[dim].invert(sel[0])];
                return updated;
              });
            })
        );
    });

    const updateFilterBoxes = () => {
      axesG.each(function (dim) {
        const axisG = d3.select(this);
        const filter = activeFilters[dim];

        const rect = axisG
          .select(".filter-highlight")
          .selectAll("rect")
          .data(filter ? [filter] : []);

        rect.join(
          (enter) =>
            enter
              .append("rect")
              .attr("x", -10)
              .attr("width", 20)
              .attr("fill", "orange")
              .attr("opacity", 0.3)
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("y", ([min, max]) => y[dim](max))
              .attr("height", ([min, max]) => y[dim](min) - y[dim](max)),
          (update) =>
            update
              .transition()
              .duration(100)
              .attr("y", ([min, max]) => y[dim](max))
              .attr("height", ([min, max]) => y[dim](min) - y[dim](max)),
          (exit) => exit.remove()
        );
      });
    };

    // svg.on("mousemove", (event) => {
    //   const [mouseX] = d3.pointer(event, svg.node());

    //   const xFisheye = fisheyeScale(x, mouseX, 2); // distortion factor 2

    //   // Update positions of axes
    //   axesG.attr("transform", (d) => `translate(${xFisheye[d]},0)`);

    //   // Update lines
    //   paths.attr("d", (d) =>
    //     d3.line()(dimensions.map((p) => [xFisheye[p], y[p](+d[p])]))
    //   );
    // });

    updatePathStyles();
    updateFilterBoxes();
  }, [compounds, selectedIds, activeFilters, windowSize]);

  return (
    <div className="relative w-full h-full">
      <svg ref={ref} className="w-full h-full"></svg>
      {activeFilters && Object.keys(activeFilters).length > 0 && (
        <button
          className="absolute flex items-center justify-center bottom-0 right-0 px-1 py-0.5 bg-orange-400 bg-opacity-30 text-white text-sm rounded z-10 gap-1"
          onClick={() => setActiveFilters({})}
        >
          <span>Reset Filters</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
              fill="#FFFFFF"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
