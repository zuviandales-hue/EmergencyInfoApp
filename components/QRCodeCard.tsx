"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeCard({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    }).then(setDataUrl);
  }, [url]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-bold text-slate-700">Emergency QR</p>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="SafeQR emergency profile QR code" className="mx-auto h-56 w-56" src={dataUrl} />
      ) : (
        <div className="grid h-56 w-full place-items-center rounded bg-slate-100 text-sm text-slate-500">
          Generating QR...
        </div>
      )}
      <a className="secondary-button mt-4 w-full text-sm" href={dataUrl} download="safeqr-code.png">
        Download QR
      </a>
    </div>
  );
}
