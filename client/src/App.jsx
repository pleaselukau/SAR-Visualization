import ScatterPlot from "./components/ScatterPlot.jsx";
import ParallelCoordiantePlot from "./components/ParallelCoordiantePlot.jsx";
import RadarChart from "./components/RadarChart.jsx";
import Heatmap from "./components/Heatmap.jsx";
import SelectionMenu from "./components/SelectionMenu.jsx";
import StructureAnalysis from "./components/StructureAnalysis.jsx";

export default function App() {
  return (
    <div className="h-screen w-screen grid grid-cols-3 grid-rows-2 gap-1.5 bg-gray-100 p-2 overflow-hidden">
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ParallelCoordiantePlot />
      </div>
       <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ScatterPlot />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <SelectionMenu />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <RadarChart />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <Heatmap />
      </div>
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <StructureAnalysis />
      </div>
    </div>
  );
}