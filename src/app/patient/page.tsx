"use client";

import { SiteHeader } from "@/components/ui/SiteHeader";
import { SetupBanner } from "@/components/ui/SetupBanner";
import { PatientForm } from "@/components/patient/PatientForm";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function PatientPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Patient intake</h1>
          <p className="mt-1.5 text-sm text-muted">
            Fill in your details below. Fields marked <span className="text-rose-500">*</span> are required.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6">
            <SetupBanner />
          </div>
        )}

        <PatientForm />
      </main>
    </div>
  );
}
