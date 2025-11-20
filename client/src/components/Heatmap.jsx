import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function Heatmap({
  compounds,
  heatmapAndComparisonCompunds,
  similarityMatrix,
  onExpand,
  onCellClick,
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
    // Need compounds and a non-empty similarity matrix
    if (
      !compounds ||
      compounds.length === 0 ||
      !similarityMatrix ||
      similarityMatrix.length === 0
    )
      return;
    console.log("sample row", similarityMatrix[0]);
    console.log("unique values", Array.from(new Set(similarityMatrix.flat())));


    // We assume similarityMatrix is aligned with compounds order
    const n = Math.min(compounds.length, similarityMatrix.length);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth || 400;
    const height = ref.current.clientHeight || 400;

    const margin = { top: 80, right: 20, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Indices 0..n-1 for compounds
    const indices = d3.range(n);

    const x = d3
      .scaleBand()
      .domain(indices)
      .range([0, innerWidth])
      .padding(0);

    const y = d3
      .scaleBand()
      .domain(indices)
      .range([0, innerHeight])
      .padding(0);

    // Flatten matrix into array of cells
    const data = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        data.push({
          row: i,
          col: j,
          value: similarityMatrix[i][j],
          compRow: compounds[i],
          compCol: compounds[j],
        });
      }
    }

    const color = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([0, 1]); // similarity in [0,1]

    // Draw heatmap cells
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.col))
      .attr("y", (d) => y(d.row))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", (d) => color(d.value))
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 0.5);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
      })
      .on("click", (event, d) => {
        const info = {
          compRow: d.compRow,
          compCol: d.compCol,
          similarity: d.value,
          rowIndex: d.row,
          colIndex: d.col,
        };
        if (onCellClick) {
          onCellClick(info);
        } else {
          console.log(
            "Clicked pair:",
            d.compRow?.name,
            d.compCol?.name,
            "similarity",
            d.value.toFixed(3)
          );
        }

      });

    // X-axis labels (columns) – compound IDs
    g.append("g")
      .selectAll("text")
      .data(indices)
      .join("text")
      .attr("x", (i) => x(i) + x.bandwidth() / 2)
      .attr("y", -50)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("transform", (i) => {
        const xPos = x(i) + x.bandwidth() / 2;
        //return `translate(${xPos}, -10) rotate(-60)`;
        const yPos = -50;
        return `rotate(-90, ${xPos}, ${yPos})`;
      })
      .style("font-size", "8px")
      .text((i) => compounds[i]?.name || `C${i + 1}`);
    // X-axis labels (columns) – vertical CAR IDs
    // g.append("g")
    //   .selectAll("text")
    //   .data(indices)
    //   .join("text")
    //   .attr("x", (i) => x(i) + x.bandwidth() / 2)
    //   .attr("y", -5) // slightly above the heatmap
    //   .attr("text-anchor", "end")
    //   .attr("dominant-baseline", "middle")
    //   // rotate each label -90° around its own (x,y) position
    //   .attr("transform", (i) => {
    //     const xPos = x(i) + x.bandwidth() / 2;
    //     
    //     return `rotate(-90, ${xPos}, ${yPos})`;
    //   })
    //   .style("font-size", "8px")
    //   .text((i) => activeCompounds[i]?.name || `C${i + 1}`);

    // Y-axis labels (rows) – compound IDs
    g.append("g")
      .selectAll("text")
      .data(indices)
      .join("text")
      .attr("x", -10)
      .attr("y", (i) => y(i) + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .style("font-size", "8px")
      .text((i) => compounds[i]?.name || `C${i + 1}`);


    // Title for the panel
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -margin.top + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Structural Similarity Heatmap");
  }, [compounds, similarityMatrix, heatmapAndComparisonCompunds, windowSize]);

  return (
    <div className="relative w-full h-full">
      {onExpand && (
        <button
          onClick={onExpand}
          className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-white/80 border hover:bg-white"
        >
          Expand
        </button>
      )}
      <svg ref={ref} className="w-full h-full"></svg>
    </div>
  );
}
