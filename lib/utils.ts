import { type EmergencyContact } from "@/lib/types";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export function makePublicProfileUrl(slug: string) {
  return `${getAppUrl()}/p/${slug}`;
}

export function createPublicSlug(displayName: string) {
  const base = displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);

  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  return `${base || "profile"}-${random}`;
}

export function parseContacts(rawContacts: string): EmergencyContact[] {
  return rawContacts
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", relationship = "", phone = "", email = ""] = line
        .split("|")
        .map((value) => value.trim());

      return {
        name,
        relationship: relationship || undefined,
        phone: phone || undefined,
        email: email || undefined
      };
    })
    .filter((contact) => contact.name || contact.phone || contact.email);
}

export function contactsToText(contacts: EmergencyContact[] | null | undefined) {
  return (contacts ?? [])
    .map((contact) =>
      [contact.name, contact.relationship, contact.phone, contact.email]
        .filter(Boolean)
        .join(" | ")
    )
    .join("\n");
}

export function getPrimaryContact(contacts: EmergencyContact[] | null | undefined) {
  return contacts?.find((contact) => contact.phone || contact.email) ?? null;
}

export function getEmailContact(contacts: EmergencyContact[] | null | undefined) {
  return contacts?.find((contact) => contact.email) ?? null;
}

export function mapsLink(latitude?: number | null, longitude?: number | null) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
