export default function LotusStripe({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        overflow: "hidden",
        lineHeight: 0,
        transform: flip ? "scaleY(-1)" : undefined,
      }}
    >
      <svg
        viewBox="0 0 1200 32"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 32 }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Repeating lotus petal motif — 20 units wide, centered on a baseline */}
        {Array.from({ length: 60 }).map((_, i) => {
          const x = i * 20 + 10;
          return (
            <g key={i} transform={`translate(${x}, 16)`}>
              {/* Center petal */}
              <path
                d={`M0,-10 C2,-6 2,0 0,2 C-2,0 -2,-6 0,-10Z`}
                fill={i % 3 === 0 ? "#c8962e" : i % 3 === 1 ? "#6b8cba" : "#8b5a5a"}
                opacity="0.7"
              />
              {/* Left petal */}
              <path
                d={`M0,2 C-3,0 -6,-3 -4,-7 C-2,-4 -1,-1 0,2Z`}
                fill={i % 3 === 0 ? "#6b8cba" : i % 3 === 1 ? "#8b5a5a" : "#c8962e"}
                opacity="0.5"
              />
              {/* Right petal */}
              <path
                d={`M0,2 C3,0 6,-3 4,-7 C2,-4 1,-1 0,2Z`}
                fill={i % 3 === 0 ? "#8b5a5a" : i % 3 === 1 ? "#c8962e" : "#6b8cba"}
                opacity="0.5"
              />
              {/* Dot center */}
              <circle cx="0" cy="2" r="1" fill="#c4b49a" opacity="0.6" />
            </g>
          );
        })}
        {/* Baseline */}
        <line x1="0" y1="20" x2="1200" y2="20" stroke="#3d2e1a" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
