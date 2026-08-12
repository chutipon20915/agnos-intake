import Link from "next/link";
import { ArrowRight, ClipboardList, MonitorSmartphone, Radio } from "lucide-react";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Radio className="h-3.5 w-3.5 text-brand-500" />
            Real-time intake, powered by Supabase
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Patients fill in the form.
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              Staff watch it happen live.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted sm:text-lg">
            A responsive patient intake form synchronized in real time with a staff dashboard.
            Every field the patient types appears instantly on the staff side — no refresh, no delay.
          </p>
        </section>

        {/* Two entry points */}
        <section className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          <EntryCard
            href="/patient"
            icon={<ClipboardList className="h-6 w-6" />}
            title="Patient Form"
            body="Enter your personal details on any device. Clean, validated, mobile-first."
            cta="Open the form"
          />
          <EntryCard
            href="/staff"
            icon={<MonitorSmartphone className="h-6 w-6" />}
            title="Staff Dashboard"
            body="Monitor every active patient live — who's typing, who submitted, who went idle."
            cta="Open the dashboard"
          />
        </section>

        {/* How it works */}
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-muted">
            How the real-time sync works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step n={1} title="Patient types" body="Each keystroke is broadcast on a per-session channel; committed values are saved to Postgres (debounced)." />
            <Step n={2} title="Supabase relays" body="Postgres change-streams + broadcast + presence push updates to every subscribed staff client instantly." />
            <Step n={3} title="Staff sees it live" body="The dashboard reflects field values, typing focus, and connection status within milliseconds." />
          </div>
        </section>
      </main>
    </div>
  );
}

function EntryCard({
  href,
  icon,
  title,
  body,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/5"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
        {n}
      </span>
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
