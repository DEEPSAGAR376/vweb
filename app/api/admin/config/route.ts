import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { createHmac, timingSafeEqual } from "crypto";

const CONFIG_DIR = path.join(process.cwd(), "app", "config", "sections");

// Allowed sections — "admin" is intentionally excluded so config cannot be
// written/read as a section (password is now env-only).
const ALLOWED_SECTIONS = [
  "games",
  "vps",
  "dedicated",
  "discord",
  "webhosting",
  "navigation",
  "branding",
  "hero",
  "legal",
] as const;

async function ensureDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch {}
}

// Derive the expected session token from the env password.
// This mirrors the logic in /api/admin/auth/route.ts.
function deriveExpectedToken(): string | null {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return null;
  return createHmac("sha256", envPassword)
    .update("admin-session-v1")
    .digest("hex");
}

// Returns true if the Authorization header carries a valid session token.
function isAuthorized(request: Request): boolean {
  const expected = deriveExpectedToken();
  if (!expected) return false; // No env password → nobody gets in

  const authHeader = request.headers.get("Authorization") || "";
  const supplied = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!supplied) return false;

  try {
    const a = Buffer.from(supplied.padEnd(128));
    const b = Buffer.from(expected.padEnd(128));
    return timingSafeEqual(a, b) && supplied === expected;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (!section) {
    return NextResponse.json({ error: "Missing section parameter." }, { status: 400 });
  }

  if (!ALLOWED_SECTIONS.includes(section as any)) {
    return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  }

  const filePath = path.join(CONFIG_DIR, `${section}.json`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { error: "Config file not found or invalid." },
      { status: 404 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (!section) {
    return NextResponse.json({ error: "Missing section parameter." }, { status: 400 });
  }

  if (!ALLOWED_SECTIONS.includes(section as any)) {
    return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const filePath = path.join(CONFIG_DIR, `${section}.json`);

    await ensureDir();
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Configuration for ${section} updated successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update configuration." },
      { status: 500 }
    );
  }
}
