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

  // New: structural similarity matrix (NxN, aligned with compounds order)
  const [similarityMatrix, setSimilarityMatrix] = useState([]);
  //New : bigger version of heatmap
  const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false);

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    compound: null,
  });

  // Helper: build NxN matrix from similarities.json + compounds list
  function buildSimilarityMatrix(compoundsData, similaritiesData) {
    const ids = compoundsData.map((c) => c.name); 
    const n = ids.length;

    // Precompute neighbor maps for quick lookup
    const neighborMaps = {};
    for (const [id, arr] of Object.entries(similaritiesData || {})) {
      neighborMaps[id] = new Map(
        (arr || []).map((d) => [d.compound, d.similarity])
      );
    }

    const matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 0)
    );

    for (let i = 0; i < n; i++) {
      const idA = ids[i];
      const mapA = neighborMaps[idA] || new Map();

      for (let j = 0; j < n; j++) {
        const idB = ids[j];
        if (i === j) {
          matrix[i][j] = 1; // self-similarity
        } else {
          const mapB = neighborMaps[idB] || new Map();
          const sAB = mapA.get(idB);
          const sBA = mapB.get(idA);
          const s = sAB ?? sBA ?? 0; // use either direction, or 0 if missing
          matrix[i][j] = s;
        }
      }
    }

    return matrix;
  }

  useEffect(() => {
    async function loadData() {
      try {
        // Load compounds and structural similarities in parallel
        const [dataRes, simRes] = await Promise.all([
          fetch("/data.json"),
          fetch("/similarities.json"),
        ]);

        const compoundsData = await dataRes.json();
        const similaritiesData = await simRes.json();

        setCompounds(compoundsData);

        // Build and store similarity matrix for the heatmap
        const matrix = buildSimilarityMatrix(compoundsData, similaritiesData);
        setSimilarityMatrix(matrix);
      } catch (err) {
        console.error("Failed to load data or similarities:", err);
      }
    }

    loadData();
  }, []);

  return (
    <>
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
            similarityMatrix={similarityMatrix} //  for structural similarity
            onExpand={() => setIsHeatmapExpanded(true)}   //for the bigger heatmap
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
      
      {isHeatmapExpanded && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-[90vw] h-[90vh] p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Structural Similarity Heatmap</h2>
              <button
                onClick={() => setIsHeatmapExpanded(false)}
                className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            <div className="flex-1 border rounded overflow-hidden">
              <Heatmap
                compounds={compounds}
                heatmapAndComparisonCompunds={heatmapAndComparisonCompunds}
                similarityMatrix={similarityMatrix}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
