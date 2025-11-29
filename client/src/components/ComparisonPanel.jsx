// Panel to compare selected compounds side by side

export default function ComparisonPanel({ compounds, comparisonCompounds }) {
  if (!compounds || compounds.length === 0 || !comparisonCompounds) return null;

  // Filter compounds to only those selected for comparison
  const selectedCompounds = compounds.filter((c) =>
    comparisonCompounds.includes(c.ID)
  );

  return (
    <div className="flex flex-col w-full h-full divide-y divide-gray-300">
      {/* Show message if no compounds selected */}
      {selectedCompounds.length === 0 && (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-center p-4">
          No compounds selected for comparison.
          <br />
          <br />
          Please select up to 2 compounds using the "Compare (Max 2)" mode in
          the Selection Panel to view them here.
        </div>
      )}

      {/* Display selected compounds side by side */}
      {selectedCompounds.map((compound) => (
        <div
          key={compound.ID}
          className={
            selectedCompounds.length === 1
              ? "w-full h-full flex flex-col items-center justify-center overflow-hidden"
              : "flex-1 h-full flex items-center justify-center overflow-hidden"
          }
        >
          {selectedCompounds.length === 2 && (
            <div
              className="text-sm font-semibold"
              style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
            >
              {compound.name || `Compound ${compound.ID}`}
            </div>
          )}

          <img
            src={`/svgs/${compound.name}.svg`}
            alt={compound.name || `Compound ${compound.ID}`}
            className="flex-1 max-h-full object-contain "
          />

          {selectedCompounds.length === 1 && (
            <div className="mt-2 text-center text-sm font-semibold">
              {compound.name || `Compound ${compound.ID}`}
            </div>
          )}

          {/* <div className="absolute top-2 left-2 bg-white/70 px-2 py-1 text-sm font-semibold">
            {compound.name || `Compound ${compound.ID}`}
          </div> */}
        </div>
      ))}
    </div>
  );
}
