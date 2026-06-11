"use client";

import { useActionState } from "react";
import { createProfile, updateProfile } from "@/lib/actions";
import { contactsToText } from "@/lib/utils";
import { type EmergencyProfile } from "@/lib/types";

export function ProfileForm({ profile }: { profile?: EmergencyProfile }) {
  const action = profile ? updateProfile.bind(null, profile.id) : createProfile;
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <p className="rounded-md bg-danger-50 p-3 text-sm font-semibold text-danger-700">{state.error}</p> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="label" htmlFor="display_name">
            Display name
          </label>
          <input className="field" defaultValue={profile?.display_name} id="display_name" name="display_name" required />
        </div>
        <div className="space-y-2">
          <label className="label" htmlFor="photo_url">
            Photo URL
          </label>
          <input className="field" defaultValue={profile?.photo_url ?? ""} id="photo_url" name="photo_url" type="url" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label" htmlFor="emergency_contacts">
          Emergency contacts
        </label>
        <textarea
          className="field min-h-28"
          defaultValue={contactsToText(profile?.emergency_contacts)}
          id="emergency_contacts"
          name="emergency_contacts"
          placeholder="Name | relationship | phone | email"
          required
        />
        <p className="text-xs text-slate-500">One contact per line. Example: Ana Santos | Mother | +1 555 0100 | ana@example.com</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="label" htmlFor="allergies">
            Allergies
          </label>
          <textarea className="field min-h-28" defaultValue={profile?.allergies ?? ""} id="allergies" name="allergies" />
        </div>
        <div className="space-y-2">
          <label className="label" htmlFor="medications">
            Medications
          </label>
          <textarea className="field min-h-28" defaultValue={profile?.medications ?? ""} id="medications" name="medications" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label" htmlFor="emergency_instructions">
          Emergency instructions
        </label>
        <textarea
          className="field min-h-32"
          defaultValue={profile?.emergency_instructions ?? ""}
          id="emergency_instructions"
          name="emergency_instructions"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <input name="lost_mode_enabled" type="hidden" value="false" />
        <label className="flex items-center gap-3 text-base font-bold text-slate-900">
          <input
            className="h-5 w-5 accent-danger-600"
            defaultChecked={profile?.lost_mode_enabled}
            name="lost_mode_enabled"
            type="checkbox"
            value="true"
          />
          Lost mode enabled
        </label>
        <div className="mt-4 space-y-2">
          <label className="label" htmlFor="lost_mode_message">
            Lost mode message
          </label>
          <textarea
            className="field min-h-24"
            defaultValue={profile?.lost_mode_message ?? ""}
            id="lost_mode_message"
            name="lost_mode_message"
            placeholder="Example: I may be lost. Please call my guardian and stay with me in a safe public place."
          />
        </div>
      </div>

      <input name="is_active" type="hidden" value="false" />
      <label className="flex items-center gap-3 text-base font-bold text-slate-900">
        <input
          className="h-5 w-5 accent-danger-600"
          defaultChecked={profile?.is_active ?? true}
          name="is_active"
          type="checkbox"
          value="true"
        />
        QR profile is active
      </label>

      <button className="primary-button w-full sm:w-auto" disabled={isPending} type="submit">
        {isPending ? "Saving..." : profile ? "Save changes" : "Create emergency profile"}
      </button>
    </form>
  );
}
