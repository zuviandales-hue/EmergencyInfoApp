import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function NewProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-4xl px-5 py-8">
        <Link className="mb-6 inline-flex text-sm font-bold text-danger-700" href="/dashboard">
          Back to dashboard
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h1 className="text-3xl font-black text-slate-950">Create emergency profile</h1>
          <p className="mt-2 text-slate-600">Add only information that is safe and useful for a stranger in an emergency.</p>
          <div className="mt-7">
            <ProfileForm />
          </div>
        </div>
      </section>
    </main>
  );
}
