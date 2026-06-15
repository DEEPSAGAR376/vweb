import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CONFIG_DIR = path.join(process.cwd(), "app", "config", "sections");

// Ensure the directory exists
async function ensureDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (e) {}
}

async function getAdminPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }
  const adminFilePath = path.join(CONFIG_DIR, "admin.json");
  try {
    const data = await fs.readFile(adminFilePath, "utf-8");
    const parsed = JSON.parse(data);
    return parsed.password || "admin123";
  } catch (e) {
    // Return default and save it
    await ensureDir();
    await fs.writeFile(
      adminFilePath,
      JSON.stringify({ password: "admin" }, null, 2),
      "utf-8"
    );
    return "admin";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (!section) {
    return NextResponse.json({ error: "Missing section parameter" }, { status: 400 });
  }

  // Validate section filename to prevent directory traversal
  const allowedSections = [
    "games",
    "vps",
    "dedicated",
    "discord",
    "webhosting",
    "navigation",
    "admin"
  ];
  if (!allowedSections.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const filePath = path.join(CONFIG_DIR, `${section}.json`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // If requesting admin config, hide password unless authorized
    if (section === "admin") {
      const passwordHeader = request.headers.get("x-admin-password");
      const actualPassword = await getAdminPassword();
      if (passwordHeader !== actualPassword) {
        return NextResponse.json({ passwordSet: true }, {
          headers: { "Cache-Control": "no-store, max-age=0" }
        });
      }
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    return NextResponse.json({ error: "Config file not found or invalid" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");

  if (!section) {
    return NextResponse.json({ error: "Missing section parameter" }, { status: 400 });
  }

  const allowedSections = [
    "games",
    "vps",
    "dedicated",
    "discord",
    "webhosting",
    "navigation",
    "admin"
  ];
  if (!allowedSections.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  // Verify password
  const passwordHeader = request.headers.get("x-admin-password");
  const actualPassword = await getAdminPassword();

  if (passwordHeader !== actualPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const filePath = path.join(CONFIG_DIR, `${section}.json`);

    await ensureDir();
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: `Configuration for ${section} updated successfully.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update configuration" }, { status: 500 });
  }
}
