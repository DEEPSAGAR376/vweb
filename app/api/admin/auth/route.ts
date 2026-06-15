import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Derive a session token by HMAC-signing a constant payload with the env password.
// This means the token is deterministic (same every server restart) but NEVER exposes
// the raw password to the client.  All subsequent API calls verify this token.
function deriveToken(password: string): string {
  return createHmac("sha256", password)
    .update("admin-session-v1")
    .digest("hex");
}

export async function POST(request: Request) {
  // If ADMIN_PASSWORD is not configured, refuse ALL access.
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) {
    return NextResponse.json(
      { error: "Admin access is not configured on this server." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    // Constant-time comparison to prevent timing attacks
    const supplied = Buffer.from(password.padEnd(128));
    const expected = Buffer.from(envPassword.padEnd(128));

    let match = false;
    try {
      match = timingSafeEqual(supplied, expected) && password === envPassword;
    } catch {
      match = false;
    }

    if (match) {
      const token = deriveToken(envPassword);
      return NextResponse.json({ success: true, token }, {
        headers: { "Cache-Control": "no-store, max-age=0" }
      });
    } else {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
