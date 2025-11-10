import { useState, useEffect } from "react";

import ScatterPlot from "./components/ScatterPlot.jsx";
import ParallelCoordiantePlot from "./components/ParallelCoordiantePlot.jsx";
import RadarChart from "./components/RadarChart.jsx";
import Heatmap from "./components/Heatmap.jsx";
import SelectionPanel from "./components/SelectionPanel.jsx";
import ComparisonPanel from "./components/ComparisonPanel.jsx";
import Tooltip from "./components/Tooltip.jsx";

export default function App() {
  const [compounds, setCompounds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [scatterPlotDimensions, setScatterPlotDimensions] = useState(0);
  const [heatmapAndComparisonCompunds, setHeatmapAndComparisonCompunds] =
    useState([]);

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    compound: null,
  });

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setCompounds(data))
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  return (
    <div className="h-screen w-screen grid grid-cols-3 grid-rows-2 gap-1.5 bg-gray-100 p-1.5 overflow-hidden">
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ParallelCoordiantePlot
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          setTooltip={setTooltip}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ScatterPlot
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          scatterPlotDimensions={scatterPlotDimensions}
          setTooltip={setTooltip}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <SelectionPanel
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          scatterPlotDimensions={scatterPlotDimensions}
          setScatterPlotDimensions={setScatterPlotDimensions}
          heatmapAndComparisonCompunds={heatmapAndComparisonCompunds}
          setHeatmapAndComparisonCompunds={setHeatmapAndComparisonCompunds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <RadarChart
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex flex-col items-center justify-center">
        <Heatmap
          compounds={compounds}
          heatmapAndComparisonCompunds={heatmapAndComparisonCompunds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ComparisonPanel
          compounds={compounds}
          heatmapAndComparisonCompunds={heatmapAndComparisonCompunds}
        />
      </div>

      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        compound={tooltip.compound}
      />
    </div>
  );
}
