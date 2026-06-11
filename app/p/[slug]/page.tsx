import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareLocationButton } from "@/components/ShareLocationButton";
import { selectPublicProfileFields, toPublicEmergencyProfile } from "@/lib/public-profile";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { type EmergencyProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

function EmergencyBlock({ title, titleJa, children }: { title: string; titleJa: string; children?: React.ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-black text-slate-950">
        {title}
        <span className="ml-2 text-slate-500">{titleJa}</span>
      </h2>
      <div className="mt-2 whitespace-pre-wrap text-xl font-bold leading-8 text-slate-950">{children}</div>
    </section>
  );
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select(selectPublicProfileFields())
    .eq("public_slug", slug)
    .eq("is_active", true)
    .single();
  const privateProfile = data as EmergencyProfile | null;

  if (!privateProfile) {
    notFound();
  }

  const profile = toPublicEmergencyProfile(privateProfile);
  const telHref = profile.emergency_phone ? `tel:${profile.emergency_phone.replace(/[^+\d]/g, "")}` : null;

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-3 rounded-lg bg-danger-700 p-5 text-white shadow-soft">
          <p className="text-2xl font-black leading-tight">This person may need help.</p>
          <p className="mt-1 text-xl font-black leading-tight">この人は助けが必要かもしれません。</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">{profile.display_name}</h1>
        </div>

        {profile.lost_mode_enabled ? (
          <div className="mb-3 rounded-lg border-4 border-danger-700 bg-danger-50 p-5 shadow-soft">
            <p className="text-2xl font-black text-danger-700">Lost Mode / 迷子・行方不明</p>
            <p className="mt-3 whitespace-pre-wrap text-2xl font-black leading-9 text-danger-900">
              {profile.lost_mode_message || "This person may need help. Please call the guardian. / この人は助けが必要かもしれません。保護者に電話してください。"}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="grid gap-3">
            {telHref ? (
              <a className="emergency-action-button bg-danger-600 text-white hover:bg-danger-700" href={telHref}>
                <span>Call emergency contact</span>
                <span>緊急連絡先に電話</span>
              </a>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-lg font-bold text-slate-700">
                No phone contact available
                <br />
                電話番号はありません
              </div>
            )}
            <ShareLocationButton slug={profile.public_slug} />
          </div>

          {profile.photo_url ? (
            <div className="relative h-64 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={profile.display_name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                src={profile.photo_url}
              />
            </div>
          ) : null}

          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-lg font-black text-amber-950">Stay with them in a safe public place.</p>
            <p className="mt-1 text-lg font-black text-amber-950">安全な場所で一緒にいてください。</p>
          </div>

          <EmergencyBlock title="Important health notes" titleJa="大切な体の情報">
            {profile.allergies || "No allergy notes listed. / アレルギー情報はありません。"}
          </EmergencyBlock>
          <EmergencyBlock title="Medicine" titleJa="薬">
            {profile.medications || "No medicine listed. / 薬の情報はありません。"}
          </EmergencyBlock>
          <EmergencyBlock title="What to do now" titleJa="今すること">
            {profile.emergency_instructions || "Call the emergency contact. If there is danger, call local emergency services. / 緊急連絡先に電話してください。危険な場合は救急・警察に連絡してください。"}
          </EmergencyBlock>

          <p className="px-1 pb-4 text-center text-sm font-semibold leading-6 text-slate-500">
            Limited emergency information only. No home address, guardian name, email, or private account details are shown.
            <br />
            緊急時に必要な情報だけを表示しています。住所、保護者名、メール、個人アカウント情報は表示しません。
          </p>
        </div>
      </section>
    </main>
  );
}
