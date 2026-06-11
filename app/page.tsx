import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-7">
          <div className="inline-flex rounded-full bg-danger-50 px-4 py-2 text-sm font-bold text-danger-700">
            SafeQR emergency profiles
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-normal text-slate-950 sm:text-5xl">
              A QR code for the moments when every second matters.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Create private guardian-managed emergency profiles for children, elderly relatives, dementia patients, and people with medical conditions.
            </p>
          </div>
          <div className="grid gap-3 text-base text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-bold text-slate-950">Limited public info</p>
              <p className="mt-1 text-sm">No owner address or private account data appears publicly.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-bold text-slate-950">Large emergency actions</p>
              <p className="mt-1 text-sm">Scanners can call or share location from a mobile-first page.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-bold text-slate-950">Disable any QR</p>
              <p className="mt-1 text-sm">Deactivate a public profile without deleting the record.</p>
            </div>
          </div>
          <Link className="secondary-button w-full sm:w-auto" href="/dashboard">
            Go to dashboard
          </Link>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
