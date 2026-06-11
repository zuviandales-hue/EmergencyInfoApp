import { z } from "zod";

const checkboxBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (value === undefined) {
      return defaultValue;
    }

    return value === true || value === "true" || value === "on";
  }, z.boolean());

export const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Display name is required").max(120),
  photo_url: z
    .string()
    .trim()
    .url("Photo URL must be a valid HTTPS URL")
    .refine((url) => url.startsWith("https://"), "Photo URL must use HTTPS")
    .optional()
    .or(z.literal("")),
  emergency_contacts: z.string().trim().min(1, "At least one emergency contact is required"),
  allergies: z.string().trim().max(4000).optional(),
  medications: z.string().trim().max(4000).optional(),
  emergency_instructions: z.string().trim().max(4000).optional(),
  lost_mode_enabled: checkboxBoolean(false),
  lost_mode_message: z.string().trim().max(2000).optional(),
  is_active: checkboxBoolean(true)
});
