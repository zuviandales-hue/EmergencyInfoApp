import { type EmergencyContact, type EmergencyProfile } from "@/lib/types";

export type PublicEmergencyProfile = Pick<
  EmergencyProfile,
  | "display_name"
  | "photo_url"
  | "allergies"
  | "medications"
  | "emergency_instructions"
  | "lost_mode_enabled"
  | "lost_mode_message"
  | "public_slug"
  | "is_active"
> & {
  emergency_phone: string | null;
};

export function selectPublicProfileFields() {
  return "display_name, photo_url, allergies, medications, emergency_instructions, lost_mode_enabled, lost_mode_message, public_slug, is_active, emergency_contacts";
}

export function toPublicEmergencyProfile(
  profile: Pick<
    EmergencyProfile,
    | "display_name"
    | "photo_url"
    | "allergies"
    | "medications"
    | "emergency_instructions"
    | "lost_mode_enabled"
    | "lost_mode_message"
    | "public_slug"
    | "is_active"
    | "emergency_contacts"
  >
): PublicEmergencyProfile {
  const contacts = (profile.emergency_contacts ?? []) as EmergencyContact[];
  const emergencyPhone = contacts.find((contact) => contact.phone)?.phone ?? null;

  return {
    display_name: profile.display_name,
    photo_url: profile.photo_url,
    allergies: profile.allergies,
    medications: profile.medications,
    emergency_instructions: profile.emergency_instructions,
    lost_mode_enabled: profile.lost_mode_enabled,
    lost_mode_message: profile.lost_mode_message,
    public_slug: profile.public_slug,
    is_active: profile.is_active,
    emergency_phone: emergencyPhone
  };
}
