"use client";

import { useTransition } from "react";
import { deleteProfile, toggleProfileActive } from "@/lib/actions";

export function ProfileActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        className="secondary-button text-sm"
        disabled={isPending}
        type="button"
        onClick={() => startTransition(() => toggleProfileActive(id, !isActive))}
      >
        {isActive ? "Disable QR" : "Enable QR"}
      </button>
      <button
        className="danger-button text-sm"
        disabled={isPending}
        type="button"
        onClick={() => {
          if (window.confirm("Delete this emergency profile? This cannot be undone.")) {
            startTransition(() => deleteProfile(id));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}
