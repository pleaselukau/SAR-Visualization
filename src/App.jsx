import ScatterPlot from "./components/ScatterPlot";
import ParallelCoordiantePlot from "./components/ParallelCoordiantePlot";
import RadarChart from "./components/RadarChart";
import Heatmap from "./components/Heatmap";
import SelectionMenu from "./components/SelectionMenu";

export default function App() {
  return (
    <div className="h-screen w-screen grid grid-cols-3 grid-rows-2 gap-2 bg-gray-100 p-2 overflow-hidden">
      
      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ScatterPlot />
      </div>

      <div className="bg-white rounded-xl shadow p-2 flex items-center justify-center">
        <ParallelCoordiantePlot />
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
        <p className="text-gray-400">Empty Panel</p>
      </div>

    </div>
  );
}