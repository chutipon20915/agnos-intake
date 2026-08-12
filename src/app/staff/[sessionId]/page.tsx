"use client";

import { use } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SessionDetailView } from "@/components/staff/SessionDetailView";

// Next.js 16: dynamic route params are async; unwrap with React's `use()`
// inside a Client Component.
export default function SessionDetailPage({ params }: PageProps<"/staff/[sessionId]">) {
  const { sessionId } = use(params);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <SessionDetailView id={sessionId} />
      </main>
    </div>
  );
}
