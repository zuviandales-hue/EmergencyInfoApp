export type EmergencyContact = {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
};

export type EmergencyProfile = {
  id: string;
  owner_id: string;
  display_name: string;
  photo_url: string | null;
  emergency_contacts: EmergencyContact[];
  allergies: string | null;
  medications: string | null;
  emergency_instructions: string | null;
  lost_mode_enabled: boolean;
  lost_mode_message: string | null;
  public_slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileFormState = {
  error?: string;
  success?: string;
};
