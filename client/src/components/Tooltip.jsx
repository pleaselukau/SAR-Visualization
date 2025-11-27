// Tooltip component to show compound details on hover

export default function Tooltip({ visible, x, y, compound }) {
  if (!visible || !compound) return null;

  const displayNames = {
    weight: "Weight",
    log_p: "Log P",
    log_d: "Log D",
    pka: "pKa",
    tpsa: "TPSA",
    potency: "Potency",
  };

  return (
    <div
      className="
        absolute bg-white border border-gray-300 rounded-lg p-3 shadow-lg
        pointer-events-none min-w-[400px] z-[1000]
      "
      style={{
        left: x + 10,
        top: y + 10,
      }}
    >
      <div className="flex w-full">
        <div className="w-1/3">
          <div className="font-bold">{compound.name}</div>

          <ul className="mt-2 space-y-1 text-sm">
            {Object.entries(compound).map(([key, value]) => {
              if (
                key === "ID" ||
                key === "name" ||
                key === "smiles" ||
                key === "potency_string" ||
                key === "synonyms"
              )
                return null;

              return (
                <li key={key} className="flex gap-1">
                  <span className="font-semibold">
                    {displayNames[key] || key}:
                  </span>

                  <span className="ml-2">{value}</span>
                </li>
              );
            })}

            {/* Synonyms removed for cleaner tooltip */}
            {/* <li className="flex flex-col gap-1">
              <span className="font-semibold">Synonyms:</span>
              <div className="ml-2 block">
                {String(compound.synonyms)
                  .split(",")
                  .map((syn, idx) => (
                    <div key={idx} className="break-words">
                      {syn.trim()}
                    </div>
                  ))}
              </div>
            </li> */}
          </ul>
        </div>

        <div className="w-2/3 flex justify-center items-center">
          <img
            src={`/svgs/${compound.name}.svg`}
            alt={compound.name || `Compound ${compound.ID}`}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
