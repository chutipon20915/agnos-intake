import { SiteHeader } from "@/components/ui/SiteHeader";
import { StaffDashboard } from "@/components/staff/StaffDashboard";

export default function StaffPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <StaffDashboard />
      </main>
    </div>
  );
}
