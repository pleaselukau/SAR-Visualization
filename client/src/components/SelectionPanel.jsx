export default function SelectionPanel({
  compounds,
  selectedIds,
  setSelectedIds,
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4">
      <label className="text-lg font-semibold">Select Property:</label>
      <select className="border rounded p-2 w-3/4">
        <option value="mw">Molecular Weight</option>
        <option value="logp">Log P</option>
        <option value="tpsa">TPSA</option>
        <option value="pka">pKa</option>
        <option value="logd">Log D</option>
      </select>

      <label className="text-lg font-semibold">Select Compound:</label>
      <select className="border rounded p-2 w-3/4">
        <option value="comp1">Compound 1</option>
        <option value="comp2">Compound 2</option>
        <option value="comp3">Compound 3</option>
      </select>
    </div>
  );
}
