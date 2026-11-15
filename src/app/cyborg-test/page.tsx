"use client";

import dynamic from "next/dynamic";

// TEMPORARY dev page for the cyborg intro (remove before shipping): it would
// otherwise be exported as a public route.
const CyborgScene = dynamic(() => import("@/components/intro/CyborgScene"), { ssr: false });

export default function CyborgTestPage() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <CyborgScene debug />
      <p
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          margin: 0,
          font: "11px/1.4 ui-monospace, monospace",
          letterSpacing: "0.08em",
          color: "#7d8393",
          pointerEvents: "none",
        }}
      >
        R — repetir · S — cámara lenta · Z — zoom dentro · arrastrar — girar
      </p>
    </div>
  );
}
