import { useState } from "react";

export default function SelectionPanel({
  compounds,
  selectedIds,
  setSelectedIds,
  scatterPlotDimensions,
  setScatterPlotDimensions,
  heatmapAndComparisonCompunds,
  setHeatmapAndComparisonCompunds,
}) {
  const [mode, setMode] = useState("highlight");

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

  const toggleHighlight = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id) => {
    setHeatmapAndComparisonCompunds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      alert("You can select a maximum of 2 compounds.");
      return prev;
    });
  };

  // const toggleCompare = (id) => {
  //   setHeatmapAndComparisonCompunds((prev) => {
  //     if (prev[0] === id) return []; // deselect if already selected
  //     return [id]; // always select only this one
  //   });
  // };

  const isSelected = (id) =>
    mode === "highlight"
      ? selectedIds.includes(id)
      : heatmapAndComparisonCompunds.includes(id);

  const toggleSelection =
    mode === "highlight" ? toggleHighlight : toggleCompare;

  return (
    <div className="flex flex-col items-center justify-start h-full w-full p-2 gap-1 overflow-hidden">
      <div className="flex items-center justify-between w-full">
        <label className="text-sm font-semibold mr-2 whitespace-nowrap">
          Scatter Plot Dimensions:
        </label>
        <select
          className="border rounded p-2 flex-1 ml-2"
          value={scatterPlotDimensions}
          onChange={(e) => setScatterPlotDimensions(Number(e.target.value))}
        >
          {Object.entries(dimensionMap).map(([key, [x, y]]) => (
            <option key={key} value={key}>
              {displayNames[x]} vs {displayNames[y]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-full justify-between items-center mt-2">
        <label className="text-sm font-semibold">Selection Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="highlight">Highlight (Multiple)</option>
          <option value="compare">Compare (Max 2)</option>
        </select>
      </div>

      {(selectedIds.length !== 0 ||
        heatmapAndComparisonCompunds.length !== 0) && (
        <div className="w-full border rounded p-1">
          <div
            className="flex flex-wrap gap-2 overflow-y-auto"
            style={{
              maxHeight: `${3 * 26 + 2 * 8}px`,
              minHeight: `${1 * 26}px`,
            }}
          >
            {(mode === "highlight"
              ? selectedIds
              : heatmapAndComparisonCompunds
            ).map((id) => {
              const compound = compounds.find((c) => c.ID === id);
              if (!compound) return null;
              return (
                <div
                  key={id}
                  className={`flex items-center px-2 py-1 rounded border text-xs font-semibold ${
                    mode === "highlight"
                      ? "bg-blue-100 border-blue-400"
                      : "bg-green-100 border-green-400"
                  }`}
                  style={{ height: "26px" }}
                >
                  <span className="mr-1">
                    {compound.name || `Compound ${compound.ID}`}
                  </span>
                  <button
                    className="font-bold hover:text-gray-500 text-xs"
                    onClick={() => toggleSelection(id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border rounded p-2 bg-white w-full space-y-2">
        {compounds.map((compound) => (
          <div
            key={compound.ID}
            onClick={() => toggleSelection(compound.ID)}
            className={`relative flex justify-between items-center border rounded-lg p-2 shadow-sm cursor-pointer hover:shadow-md transition ${
              isSelected(compound.ID)
                ? mode === "highlight"
                  ? "border-blue-500 bg-blue-50"
                  : "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex flex-col">
              <div className="font-semibold mb-1 text-sm">
                {compound.name || `Compound ${compound.ID}`}
              </div>

              <div className="grid grid-cols-2 gap-x-3 text-xs text-gray-600 w-[225px]">
                <div>
                  <b>Weight:</b> {compound.weight}
                </div>
                <div>
                  <b>Log P:</b> {compound.log_p}
                </div>
                <div>
                  <b>Log D:</b> {compound.log_d}
                </div>
                <div>
                  <b>pKa:</b> {compound.pka}
                </div>
                <div>
                  <b>TPSA:</b> {compound.tpsa}
                </div>
                <div>
                  <b>Potency:</b> {compound.potency}
                </div>
              </div>
            </div>

            <img
              src={`/automation_svgs/${compound.name}.svg`}
              alt={compound.name || `Compound ${compound.ID}`}
              className="w-[70px] h-[70px] object-contain"
            />

            {mode === "compare" &&
              heatmapAndComparisonCompunds.includes(compound.ID) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {heatmapAndComparisonCompunds.indexOf(compound.ID) + 1}
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
