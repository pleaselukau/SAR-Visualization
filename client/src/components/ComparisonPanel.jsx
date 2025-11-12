export default function ComparisonPanel({
  compounds,
  heatmapAndComparisonCompunds,
}) {
  if (!compounds || compounds.length === 0 || !heatmapAndComparisonCompunds)
    return null;

  const selectedCompounds = (
    heatmapAndComparisonCompunds?.length
      ? compounds.filter((c) => heatmapAndComparisonCompunds.includes(c.ID))
      : []
  )
    .concat(compounds)
    .slice(0, 2);

  return (
    <div className="flex flex-col w-full h-full">
      {selectedCompounds.map((compound) => (
        <div
          key={compound.ID}
          className="relative w-full h-[400px] overflow-hidden"
          style={{
            backgroundImage: `url(/svgs/${compound.name}.svg)`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute top-2 left-2 bg-white/70 px-2 py-1 text-sm font-semibold">
            {compound.name || `Compound ${compound.ID}`}
          </div>
        </div>
      ))}
    </div>
  );
}
