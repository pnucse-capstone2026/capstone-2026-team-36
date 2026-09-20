import { Handle, Position } from "@xyflow/react";

const HANDLES = [
  { id: "top", deg: -90, pos: Position.Top },
  { id: "top-right", deg: -45, pos: Position.Top },
  { id: "right", deg: 0, pos: Position.Right },
  { id: "bottom-right", deg: 45, pos: Position.Right },
  { id: "bottom", deg: 90, pos: Position.Bottom },
  { id: "bottom-left", deg: 135, pos: Position.Bottom },
  { id: "left", deg: 180, pos: Position.Left },
  { id: "top-left", deg: -135, pos: Position.Left },
] as const;

function HandleAt({ type, id, deg, pos }: { type: "source" | "target"; id: string; deg: number; pos: (typeof HANDLES)[number]["pos"] }) {
  const rad = (deg * Math.PI) / 180;
  const x = 50 + 50 * Math.cos(rad);
  const y = 50 + 50 * Math.sin(rad);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Handle type={type} position={pos} id={`${id}-${type === "source" ? "src" : "tgt"}`} />
    </div>
  );
}

type CircleNodeProps = {
  data: { label: string };
};

export function CircleNode({ data }: CircleNodeProps) {
  return (
    <div
      className="circle-node"
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        border: "2px solid #334155",
        position: "relative",
      }}
    >
      {HANDLES.map((h) => (
        <HandleAt key={`src-${h.id}`} type="source" id={h.id} deg={h.deg} pos={h.pos} />
      ))}
      {HANDLES.map((h) => (
        <HandleAt key={`tgt-${h.id}`} type="target" id={h.id} deg={h.deg} pos={h.pos} />
      ))}
      <span>{data.label}</span>
    </div>
  );
}
