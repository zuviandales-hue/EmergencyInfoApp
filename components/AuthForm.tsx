"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });

    setIsLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "sign-up") {
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1">
        <button
          className={`rounded px-3 py-2 text-sm font-bold ${mode === "sign-in" ? "bg-white shadow-sm" : "text-slate-600"}`}
          type="button"
          onClick={() => setMode("sign-in")}
        >
          Sign in
        </button>
        <button
          className={`rounded px-3 py-2 text-sm font-bold ${mode === "sign-up" ? "bg-white shadow-sm" : "text-slate-600"}`}
          type="button"
          onClick={() => setMode("sign-up")}
        >
          Create account
        </button>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            required
            className="field"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            required
            className="field"
            id="password"
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {message ? <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">{message}</p> : null}
        <button className="primary-button w-full" disabled={isLoading} type="submit">
          {isLoading ? "Please wait..." : mode === "sign-in" ? "Open dashboard" : "Create SafeQR account"}
        </button>
      </form>
    </div>
  );
}
