"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPublicSlug, parseContacts } from "@/lib/utils";
import { profileSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { type ProfileFormState } from "@/lib/types";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createProfile(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the profile fields." };
  }

  const profile = parsed.data;
  const { error } = await supabase.from("profiles").insert({
    owner_id: user.id,
    display_name: profile.display_name,
    photo_url: profile.photo_url || null,
    emergency_contacts: parseContacts(profile.emergency_contacts),
    allergies: profile.allergies || null,
    medications: profile.medications || null,
    emergency_instructions: profile.emergency_instructions || null,
    lost_mode_enabled: profile.lost_mode_enabled,
    lost_mode_message: profile.lost_mode_message || null,
    public_slug: createPublicSlug(profile.display_name),
    is_active: profile.is_active
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfile(
  profileId: string,
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createSupabaseServerClient();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Please check the profile fields." };
  }

  const profile = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: profile.display_name,
      photo_url: profile.photo_url || null,
      emergency_contacts: parseContacts(profile.emergency_contacts),
      allergies: profile.allergies || null,
      medications: profile.medications || null,
      emergency_instructions: profile.emergency_instructions || null,
      lost_mode_enabled: profile.lost_mode_enabled,
      lost_mode_message: profile.lost_mode_message || null,
      is_active: profile.is_active
    })
    .eq("id", profileId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/profiles/${profileId}/edit`);
  redirect("/dashboard");
}

export async function toggleProfileActive(profileId: string, isActive: boolean) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", profileId);
  revalidatePath("/dashboard");
}

export async function deleteProfile(profileId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").delete().eq("id", profileId);
  revalidatePath("/dashboard");
}
