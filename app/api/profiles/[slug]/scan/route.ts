import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { getClientIp, hashClientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getEmailContact, mapsLink } from "@/lib/utils";
import { type EmergencyProfile } from "@/lib/types";

type ScanPayload = {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
};

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isValidCoordinate(latitude: number | null, longitude: number | null) {
  if (latitude === null && longitude === null) {
    return true;
  }

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = (await request.json().catch(() => ({}))) as ScanPayload;
  const latitude = toNumber(body.latitude);
  const longitude = toNumber(body.longitude);
  const accuracy = toNumber(body.accuracy);

  if (!isValidCoordinate(latitude, longitude)) {
    return NextResponse.json({ error: "Invalid location payload." }, { status: 400 });
  }

  const scannerIpHash = hashClientIp(getClientIp(request));
  const supabase = createSupabaseAdminClient();
  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, emergency_contacts, public_slug, is_active")
    .eq("public_slug", slug)
    .eq("is_active", true)
    .single();
  const profile = data as EmergencyProfile | null;

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found or disabled." }, { status: 404 });
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recentScanCount, error: countError } = await supabase
    .from("scan_events")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("scanner_ip_hash", scannerIpHash)
    .gte("created_at", tenMinutesAgo);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((recentScanCount ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Too many alerts for this QR code. Please wait before trying again." },
      { status: 429 }
    );
  }

  const { data: scanEvent, error: insertError } = await supabase
    .from("scan_events")
    .insert({
      profile_id: profile.id,
      scanner_lat: latitude,
      scanner_lng: longitude,
      scanner_accuracy: accuracy,
      scanner_ip_hash: scannerIpHash,
      scanner_user_agent: request.headers.get("user-agent")
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const emailContact = getEmailContact(profile.emergency_contacts);
  const recipient = emailContact?.email;
  const locationLink = mapsLink(latitude, longitude);

  let alertSent = false;

  if (recipient && process.env.RESEND_API_KEY && process.env.RESEND_ALERT_FROM) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailResult = await resend.emails
      .send({
        from: process.env.RESEND_ALERT_FROM,
        to: recipient,
        subject: `SafeQR alert for ${profile.display_name}`,
        text: [
          `Someone scanned the SafeQR profile for ${profile.display_name}.`,
          locationLink ? `Scanner location: ${locationLink}` : "The scanner did not share a location.",
          accuracy ? `Location accuracy: about ${Math.round(accuracy)} meters.` : null,
          "Open your SafeQR dashboard to review the profile."
        ]
          .filter(Boolean)
          .join("\n")
      })
      .catch(() => null);

    alertSent = Boolean(emailResult?.data?.id);

    if (alertSent && scanEvent?.id) {
      await supabase.from("scan_events").update({ alert_sent: true }).eq("id", scanEvent.id);
    }
  }

  return NextResponse.json({ ok: true, locationShared: Boolean(locationLink), alertSent });
}
