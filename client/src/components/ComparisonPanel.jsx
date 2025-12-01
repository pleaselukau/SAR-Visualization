// Panel to compare selected compounds side by side
import { useState } from "react";
import * as d3 from "d3";

export default function ComparisonPanel({ compounds, comparisonCompounds }) {
  if (!compounds || compounds.length === 0 || !comparisonCompounds) return null;

  const [expanded, setExpanded] = useState(false);
  const partCCompounds = [
    "CAR-0000075",
    "CAR-0000008",
    "CAR-0000036",
    "CAR-0000015",
    "CAR-0000018",
    "CAR-0000034",
    "CAR-0000023",
    "CAR-0000009",
    "CAR-0000081",
    "CAR-0000016",
    "CAR-0000035",
    "CAR-0000040",
    "CAR-0000041",
    "CAR-0000082",
  ];

  // Filter compounds to only those selected for comparison
  const selectedCompounds = compounds.filter((c) =>
    comparisonCompounds.includes(c.ID)
  );

  if (!expanded) {
    return (
      <div className="relative w-full h-full">
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white/80 border hover:bg-white z-10"
        >
          Expand
        </button>

        <div className="flex flex-col w-full h-full divide-y divide-gray-300">
          {/* Show message if no compounds selected */}
          {selectedCompounds.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-center p-4">
              No compounds selected for comparison.
              <br />
              <br />
              Please select up to 2 compounds using the "Compare (Max 2)" mode
              in the Selection Panel to view them here.
            </div>
          )}

          {/* Display selected compounds side by side */}
          {selectedCompounds.map((compound) => (
            <div
              key={compound.ID}
              className="flex-1 h-full flex items-center justify-center overflow-hidden gap-2"
            >
              <div
                className="text-sm font-semibold"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                }}
              >
                {compound.name || `Compound ${compound.ID}`}
              </div>

              <img
                src={`/svgs/${compound.name}.svg`}
                alt={compound.name || `Compound ${compound.ID}`}
                className="flex-1 max-h-full object-contain "
              />

              {/* <div className="flex-1 flex flex-col items-center h-full w-full">
                <div className="flex flex-col w-full h-1/4">
                  <img
                    src={`/svgs_part_b/${compound.name}.svg`}
                    className="h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-center w-full h-1/4">
                  <img
                    src={`/svgs_part_a/${compound.name}.svg`}
                    className="h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-center w-full h-1/4">
                  <img
                    src={`/substructures/COMMON.svg`}
                    className="h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-center w-full h-1/4">
                  {partCCompounds.includes(compound.name) && (
                    <img
                      src={`/svgs_part_c/CAR-0000075.svg`}
                      className="h-full object-contain"
                    />
                  )}
                </div>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-lg w-[95vw] h-[95vh] p-2 flex">
        <button
          onClick={() => {
            setExpanded(false);
            setSelectedSimilarityPair(null);
          }}
          className="absolute flex items-center justify-center w-[32px] h-[32px] top-2 right-2 z-100 p-0 rounded bg-gray-100 hover:bg-gray-200"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
              fill="#000000"
            />
          </svg>
        </button>

        <div className="flex flex-1 flex-col h-full divide-y divide-gray-300">
          {/* Show message if no compounds selected */}
          {selectedCompounds.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-center p-4">
              No compounds selected for comparison.
              <br />
              <br />
              Please select up to 2 compounds using the "Compare (Max 2)" mode
              in the Selection Panel to view them here.
            </div>
          )}

          {/* Display selected compounds side by side */}
          {selectedCompounds.map((compound) => (
            <div
              key={compound.ID}
              className="flex-1 h-full flex items-center justify-center overflow-hidden gap-2"
            >
              <div
                className="text-sm font-semibold"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                }}
              >
                {compound.name || `Compound ${compound.ID}`}
              </div>

              <img
                src={`/svgs/${compound.name}.svg`}
                alt={compound.name || `Compound ${compound.ID}`}
                className="flex-1 max-h-full object-contain "
              />
            </div>
          ))}
        </div>

        {selectedCompounds.length === 2 && (
          <div className="flex-1 flex flex-col items-center h-full w-full border-l border-gray-300 justify-between">
            <div className="flex w-full h-1/3 justify-between items-start">
              <img
                src={`/svgs_part_b/${selectedCompounds[0].name}.svg`}
                className="image-cover object-center border rounded-full scale-70"
              />

              {partCCompounds.includes(selectedCompounds[0].name) && (
                <img
                  src={`/svgs_part_c/CAR-0000075.svg`}
                  className="image-cover border rounded-full w-[100px] h-[100px]"
                />
              )}

              <img
                src={`/svgs_part_a/${selectedCompounds[0].name}.svg`}
                className="image-cover border rounded-full w-[100px] h-[100px]"
              />
            </div>

            <div className="flex items-center justify-end w-full h-1/3 p-4">
              <img src={`/substructures/COMMON.svg`} className="" />
            </div>

            <div className="flex w-full h-1/3 justify-between items-end">
              <img
                src={`/svgs_part_b/${selectedCompounds[1].name}.svg`}
                className=""
              />

              {partCCompounds.includes(selectedCompounds[1].name) && (
                <img src={`/svgs_part_c/CAR-0000075.svg`} className="" />
              )}

              <img
                src={`/svgs_part_a/${selectedCompounds[1].name}.svg`}
                className=""
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
