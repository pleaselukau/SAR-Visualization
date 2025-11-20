export default function ComparisonPanel({
  compounds,
  heatmapAndComparisonCompunds,
}) {
  if (!compounds || compounds.length === 0 || !heatmapAndComparisonCompunds)
    return null;

  // const selectedCompounds = (
  //   heatmapAndComparisonCompunds?.length
  //     ? compounds.filter((c) => heatmapAndComparisonCompunds.includes(c.ID))
  //     : []
  // )
  //   .concat(compounds)
  //   .slice(0, 2);

  const selectedCompounds = compounds.filter((c) =>
    heatmapAndComparisonCompunds.includes(c.ID)
  );

  console.log;

  return (
    <div className="flex flex-col w-full h-full">
      {selectedCompounds.map((compound) => (
        // <div
        //   key={compound.ID}
        //   className="relative w-full h-[400px] overflow-hidden"
        //   style={{
        //     backgroundImage: `url(/automation_svgs/${compound.name}.svg)`,
        //     backgroundSize: "contain",
        //     backgroundRepeat: "no-repeat",
        //     backgroundPosition: "center",
        //   }}
        // >
        //   <div className="absolute top-2 left-2 bg-white/70 px-2 py-1 text-sm font-semibold">
        //     {compound.name || `Compound ${compound.ID}`}
        //   </div>
        // </div>

        <div
          key={compound.ID}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          <img
            src={`/automation_svgs/${compound.name}.svg`}
            alt={compound.name || `Compound ${compound.ID}`}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2 bg-white/70 px-2 py-1 text-sm font-semibold">
            {compound.name || `Compound ${compound.ID}`}
          </div>
        </div>
      ))}
    </div>
  );
}
