"use client";

import dynamic from "next/dynamic";
import CeefaxLayout from "@/components/CeefaxLayout";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="py-8 text-ceefax-cyan text-2xl animate-pulse">
      ░░░ LOADING MAP... ░░░
    </div>
  ),
});

export default function MapPage() {
  return (
    <CeefaxLayout pageNumber="P.400">
      <h1 className="text-ceefax-yellow mb-2" style={{ fontSize: "2em" }}>
        ░░ PUB MAP ░░
      </h1>

      <MapClient />

      <p className="text-ceefax-magenta mt-4">
        A Teletext service from PINT MARKETS LTD
      </p>
    </CeefaxLayout>
  );
}
