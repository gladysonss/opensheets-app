"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-8">
      <div className="container mx-auto max-w-7xl bg-white shadow-sm rounded-xl p-4 sm:p-6 border border-gray-200">
        <SwaggerUI url="/api/doc" />
      </div>
    </div>
  );
}
