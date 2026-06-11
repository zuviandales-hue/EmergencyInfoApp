import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { type EmergencyProfile } from "@/lib/types";

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("owner_id", user.id)
    .eq("id", id)
    .single();
  const profile = data as EmergencyProfile | null;

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-4xl px-5 py-8">
        <Link className="mb-6 inline-flex text-sm font-bold text-danger-700" href="/dashboard">
          Back to dashboard
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h1 className="text-3xl font-black text-slate-950">Edit {profile.display_name}</h1>
          <p className="mt-2 text-slate-600">Changes appear on the public QR page after saving.</p>
          <div className="mt-7">
            <ProfileForm profile={profile} />
          </div>
        </div>
      </section>
    </main>
  );
}
