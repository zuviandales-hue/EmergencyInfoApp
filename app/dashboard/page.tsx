import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileActions } from "@/components/ProfileActions";
import { QRCodeCard } from "@/components/QRCodeCard";
import { signOut } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getPrimaryContact, makePublicProfileUrl } from "@/lib/utils";
import { type EmergencyProfile } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .returns<EmergencyProfile[]>();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-danger-700">SafeQR</p>
            <h1 className="text-2xl font-black text-slate-950">Emergency profiles</h1>
          </div>
          <form action={signOut}>
            <button className="secondary-button w-full sm:w-auto" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600">Create and manage QR profiles. Public pages only work while the profile is active.</p>
          <Link className="primary-button w-full sm:w-auto" href="/dashboard/profiles/new">
            New profile
          </Link>
        </div>

        {!profiles?.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-black text-slate-950">No profiles yet</h2>
            <p className="mt-2 text-slate-600">Start with one emergency contact and add medical instructions that a scanner can safely see.</p>
            <Link className="primary-button mt-5" href="/dashboard/profiles/new">
              Create first profile
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {profiles.map((profile) => {
              const contact = getPrimaryContact(profile.emergency_contacts);
              const publicUrl = makePublicProfileUrl(profile.public_slug);

              return (
                <article key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-5 md:grid-cols-[1fr_260px]">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-black text-slate-950">{profile.display_name}</h2>
                          <p className={`mt-1 text-sm font-bold ${profile.is_active ? "text-emerald-700" : "text-slate-500"}`}>
                            {profile.is_active ? "Active public QR" : "Disabled"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-bold text-slate-900">Primary contact:</span>{" "}
                          {contact ? [contact.name, contact.phone, contact.email].filter(Boolean).join(" | ") : "None"}
                        </p>
                        <p>
                          <span className="font-bold text-slate-900">Slug:</span> {profile.public_slug}
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Link className="secondary-button text-sm" href={`/dashboard/profiles/${profile.id}/edit`}>
                          Edit
                        </Link>
                        <a className="secondary-button text-sm" href={publicUrl} target="_blank" rel="noreferrer">
                          Public page
                        </a>
                      </div>
                      <ProfileActions id={profile.id} isActive={profile.is_active} />
                    </div>
                    <QRCodeCard url={publicUrl} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
