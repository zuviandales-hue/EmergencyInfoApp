"use client";

import { useState } from "react";

type ShareState = "idle" | "locating" | "sending" | "sent" | "error";

export function ShareLocationButton({ slug }: { slug: string }) {
  const [state, setState] = useState<ShareState>("idle");
  const [message, setMessage] = useState("");

  async function sendLocation(payload: { latitude?: number; longitude?: number; accuracy?: number }) {
    setState("sending");
    const response = await fetch(`/api/profiles/${slug}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Could not send alert. / 送信できませんでした。");
    }

    setState("sent");
    setMessage("Location alert sent. / 位置情報を送りました。");
  }

  async function onClick() {
    setMessage("");

    if (!navigator.geolocation) {
      try {
        await sendLocation({});
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "Could not send alert. / 送信できませんでした。");
      }
      return;
    }

    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await sendLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        } catch (error) {
          setState("error");
          setMessage(error instanceof Error ? error.message : "Could not send alert. / 送信できませんでした。");
        }
      },
      async () => {
        try {
          await sendLocation({});
        } catch (error) {
          setState("error");
          setMessage(error instanceof Error ? error.message : "Could not send alert. / 送信できませんでした。");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  return (
    <div className="space-y-2">
      <p className="rounded-md bg-slate-100 p-3 text-base font-bold leading-6 text-slate-800">
        Send your current location to the guardian only if you agree.
        <br />
        同意する場合だけ、現在地を保護者に送ってください。
      </p>
      <button
        className="emergency-action-button bg-slate-900 text-white hover:bg-slate-800"
        disabled={state === "locating" || state === "sending"}
        onClick={onClick}
        type="button"
      >
        {state === "locating"
          ? (
              <>
                <span>Getting location...</span>
                <span>現在地を確認中</span>
              </>
            )
          : state === "sending"
            ? (
                <>
                  <span>Sending...</span>
                  <span>送信中</span>
                </>
              )
            : (
                <>
                  <span>Share my location</span>
                  <span>現在地を送る</span>
                </>
              )}
      </button>
      {message ? (
        <p className={`rounded-md p-3 text-base font-bold ${state === "error" ? "bg-danger-50 text-danger-700" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
