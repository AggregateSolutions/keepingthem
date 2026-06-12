interface Props {
  url: string;
  label: string;
}

export default function StreamBanner({ url, label }: Props) {
  const live = !!url;

  return (
    <>
      <div
        style={{
          background: live ? "#0d1f0d" : "var(--bg-base)",
          border: `1px solid ${live ? "#1a4a1a" : "var(--border)"}`,
          borderRadius: "6px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: live ? "#4caf50" : "var(--text-dim)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
            {live ? label : "Livestream link coming soon"}
          </strong>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {live
              ? "Service is streaming — click to join"
              : "Check back closer to the service date"}
          </p>
        </div>
        {live ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#1a4a1a",
              color: "#8fd68f",
              border: "1px solid #2a6a2a",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Watch now
          </a>
        ) : (
          <span
            style={{
              background: "var(--brown-dark)",
              color: "var(--text-dim)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
            }}
          >
            Not yet available
          </span>
        )}
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--text-faint)" }}>
        The streaming link will be shared here once confirmed by the service provider. Please check back closer to the date.
      </p>
    </>
  );
}
