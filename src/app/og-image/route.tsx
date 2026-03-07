import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          fontFamily: "monospace",
          padding: 0,
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#0000ff",
            padding: "16px 32px",
          }}
        >
          <span
            style={{
              color: "#ffff00",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            PINT MARKETS
          </span>
          <span style={{ color: "#ffffff", fontSize: 32 }}>P.100</span>
        </div>

        {/* Cyan line */}
        <div style={{ height: 4, backgroundColor: "#00ffff", display: "flex" }} />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 60px",
            gap: 24,
          }}
        >
          {/* Title */}
          <div
            style={{
              color: "#ffff00",
              fontSize: 64,
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "0.04em",
              display: "flex",
            }}
          >
            LONDON PINT PRICES
          </div>

          {/* Separator */}
          <div
            style={{
              color: "#ffff00",
              fontSize: 28,
              display: "flex",
              overflow: "hidden",
            }}
          >
            ════════════════════════════════════
          </div>

          {/* Description */}
          <div
            style={{
              color: "#00ffff",
              fontSize: 36,
              textAlign: "center",
              display: "flex",
            }}
          >
            Find the cheapest pint near you
          </div>

          {/* Features row */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#00ff00", fontSize: 28 }}>■</span>
              <span style={{ color: "#ffffff", fontSize: 28 }}>LIVE PRICES</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#ff00ff", fontSize: 28 }}>■</span>
              <span style={{ color: "#ffffff", fontSize: 28 }}>HEATMAPS</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#ff0000", fontSize: 28 }}>■</span>
              <span style={{ color: "#ffffff", fontSize: 28 }}>LEADERBOARDS</span>
            </div>
          </div>

          {/* Price example */}
          <div
            style={{
              display: "flex",
              border: "3px solid #00ff00",
              padding: "16px 40px",
              marginTop: 16,
              gap: 24,
              alignItems: "center",
            }}
          >
            <span style={{ color: "#00ff00", fontSize: 52, fontWeight: 700 }}>
              £3.49
            </span>
            <span style={{ color: "#ffffff", fontSize: 28 }}>
              cheapest pint today
            </span>
          </div>
        </div>

        {/* Footer bar */}
        <div style={{ height: 4, backgroundColor: "#00ffff", display: "flex" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#000000",
            padding: "12px 32px",
          }}
        >
          <span style={{ color: "#ff0000", fontSize: 24, fontWeight: 700 }}>
            HOME
          </span>
          <span style={{ color: "#00ff00", fontSize: 24, fontWeight: 700 }}>
            SEARCH
          </span>
          <span style={{ color: "#ffff00", fontSize: 24, fontWeight: 700 }}>
            MAP
          </span>
          <span style={{ color: "#00ffff", fontSize: 24, fontWeight: 700 }}>
            LEADERBOARD
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
