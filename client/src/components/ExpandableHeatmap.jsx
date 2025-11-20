import Heatmap from "./Heatmap.jsx";

export default function ExpandedHeatmap({
  compounds,
  heatmapAndComparisonCompunds,
  similarityMatrix,
  onClose,
  selectedSimilarityPair,
  setSelectedSimilarityPair,
}) {
  const formatVal = (v) =>
    v === undefined || v === null || v === ""
      ? "N/A"
      : typeof v === "number"
      ? v.toFixed(3)
      : v;

  const getPotency = (c) => c.potency ?? c.pEC50 ?? c.pIC50 ?? "N/A";

  const getSvgFor = (c) => (c?.name ? `/svgs/${c.name}.svg` : null);

  const a = selectedSimilarityPair?.compRow || {};
  const b = selectedSimilarityPair?.compCol || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] h-[90vh] p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            Structural Similarity Heatmap
          </h2>
          <button
            onClick={() => {
              onClose();
            }}
            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Big Heatmap */}
          <div className="flex-1 border rounded overflow-hidden">
            <Heatmap
              compounds={compounds}
              heatmapAndComparisonCompunds={heatmapAndComparisonCompunds}
              similarityMatrix={similarityMatrix}
              onCellClick={(info) => setSelectedSimilarityPair(info)}
            />
          </div>

          {/* Side Panel */}
          <div className="w-80 h-full border rounded p-3 text-xs bg-gray-50 flex flex-col overflow-y-auto">
            <h3 className="font-semibold mb-2">Selected Pair</h3>

            {!selectedSimilarityPair && (
              <p className="text-gray-500">
                Click a cell in the heatmap to see details here.
              </p>
            )}

            {selectedSimilarityPair && (
              <>
                <p className="mb-3 text-sm">
                  <span className="font-medium">Similarity:</span>{" "}
                  {formatVal(selectedSimilarityPair.similarity)}
                </p>

                <div className="mb-4">
                  <h4 className="font-medium mb-1">
                    Compound A (Y-Axis): {a.name || "N/A"}
                  </h4>
                  {getSvgFor(a) && (
                    <img
                      src={getSvgFor(a)}
                      alt={a.name}
                      className="w-full h-auto mb-2 border rounded bg-white object-contain"
                    />
                  )}
                  <div className="space-y-0.5">
                    <p>Weight: {formatVal(a.weight)}</p>
                    <p>Log P: {formatVal(a.log_p)}</p>
                    <p>Log D: {formatVal(a.log_d)}</p>
                    <p>pKa: {formatVal(a.pka)}</p>
                    <p>TPSA: {formatVal(a.tpsa)}</p>
                    <p>Potency: {formatVal(getPotency(a))}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1">
                    Compound B (X-Axis): {b.name || "N/A"}
                  </h4>
                  {getSvgFor(b) && (
                    <img
                      src={getSvgFor(b)}
                      alt={b.name}
                      className="w-full h-auto mb-2 border rounded bg-white object-contain"
                    />
                  )}
                  <div className="space-y-0.5">
                    <p>Weight: {formatVal(b.weight)}</p>
                    <p>Log P: {formatVal(b.log_p)}</p>
                    <p>Log D: {formatVal(b.log_d)}</p>
                    <p>pKa: {formatVal(b.pka)}</p>
                    <p>TPSA: {formatVal(b.tpsa)}</p>
                    <p>Potency: {formatVal(getPotency(b))}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
