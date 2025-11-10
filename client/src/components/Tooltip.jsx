export default function Tooltip({ visible, x, y, compound }) {
  if (!visible || !compound) return null;

  const style = {
    position: "absolute",
    left: x + 10 + "px",
    top: y + 10 + "px",
    background: "white",
    border: "1px solid gray",
    borderRadius: "6px",
    padding: "10px",
    pointerEvents: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: 1000,
    minWidth: "150px",
  };

  return (
    <div style={style}>
      <strong>{compound.name}</strong>
      <br />
      {compound.image && (
        <img
          src={compound.image}
          alt={compound.name}
          style={{ width: "100px", height: "100px", objectFit: "contain" }}
        />
      )}
      <ul>
        {Object.entries(compound).map(([key, value]) => {
          if (key === "ID" || key === "name" || key === "image") return null;
          return (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
