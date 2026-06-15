import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CONFIG_DIR = path.join(process.cwd(), "app", "config", "sections");

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
    try {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch (_) {}
    await fs.writeFile(
      adminFilePath,
      JSON.stringify({ password: "admin" }, null, 2),
      "utf-8"
    );
    return "admin";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const actualPassword = await getAdminPassword();

    if (password === actualPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
