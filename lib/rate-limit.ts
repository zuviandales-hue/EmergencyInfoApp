import "server-only";

import { createHash } from "crypto";
import { type NextRequest } from "next/server";

const FALLBACK_SALT = "safeqr-development-salt-change-me";

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function hashClientIp(ip: string) {
  const salt = process.env.SCAN_RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SALT;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
