"use client";

import dynamic from "next/dynamic";

// TEMPORARY dev page for the cyborg intro (remove before shipping): it would
// otherwise be exported as a public route.
const CyborgScene = dynamic(() => import("@/components/intro/CyborgScene"), { ssr: false });

export default function CyborgTestPage() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <CyborgScene debug />
    </div>
  );
}
