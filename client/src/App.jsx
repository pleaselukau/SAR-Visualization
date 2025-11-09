import { useState, useEffect } from "react";

import ScatterPlot from "./components/ScatterPlot.jsx";
import ParallelCoordiantePlot from "./components/ParallelCoordiantePlot.jsx";
import RadarChart from "./components/RadarChart.jsx";
import Heatmap from "./components/Heatmap.jsx";
import SelectionPanel from "./components/SelectionPanel.jsx";
import ComparisonPanel from "./components/ComparisonPanel.jsx";

export default function App() {
  const [compounds, setCompounds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => setCompounds(data))
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  return (
    <div className="h-screen w-screen grid grid-cols-3 grid-rows-2 gap-1.5 bg-gray-100 p-2 overflow-hidden">
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ParallelCoordiantePlot
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ScatterPlot
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <SelectionPanel
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <RadarChart
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <Heatmap
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ComparisonPanel
          compounds={compounds}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
      </div>
    </div>
  );
}
