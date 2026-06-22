import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { createHmac, timingSafeEqual } from "crypto";

const CONFIG_DIR = path.join(process.cwd(), "app", "config", "sections");

// Derive the expected session token from the env password
function deriveExpectedToken(): string | null {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return null;
  return createHmac("sha256", envPassword)
    .update("admin-session-v1")
    .digest("hex");
}

// Check authorization
function isAuthorized(request: Request): boolean {
  const expected = deriveExpectedToken();
  if (!expected) return false;

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

interface PricingPlan {
  titleKey: string;
  basePrice: number;
}

interface ServiceConfig {
  [key: string]: any;
  games?: Array<{ startingAt?: string; [key: string]: any }>;
  tiers?: Array<{ price?: string; [key: string]: any }>;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // Read pricing.json to get base prices
    const pricingPath = path.join(CONFIG_DIR, "pricing.json");
    const pricingContent = await fs.readFile(pricingPath, "utf-8");
    const pricingData = JSON.parse(pricingContent);

    const plans = pricingData.section?.plans || [];
    const priceMap = new Map<string, number>();

    // Build a map of service to base price
    plans.forEach((plan: PricingPlan) => {
      const titleKey = plan.titleKey;
      const basePrice = plan.basePrice;

      // Map pricing plans to service configs
      if (titleKey.includes("gameServers")) {
        priceMap.set("games", basePrice);
      } else if (titleKey.includes("vpsHosting")) {
        priceMap.set("vps", basePrice);
      } else if (titleKey.includes("dedicatedServers")) {
        priceMap.set("dedicated", basePrice);
      } else if (titleKey.includes("webHosting")) {
        priceMap.set("webhosting", basePrice);
      } else if (titleKey.includes("discord")) {
        priceMap.set("discord", basePrice);
      }
    });

    // Now sync prices to each service config
    const services = ["games", "vps", "dedicated", "webhosting", "discord"];
    const results: Record<string, { updated: boolean; count: number; message: string }> = {};

    for (const service of services) {
      const filePath = path.join(CONFIG_DIR, `${service}.json`);
      const basePrice = priceMap.get(service);

      if (basePrice === undefined) {
        results[service] = { updated: false, count: 0, message: "No base price found" };
        continue;
      }

      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const config: ServiceConfig = JSON.parse(fileContent);
        let priceUpdateCount = 0;
        const priceFormatted = `₹${basePrice}/mo`;

        // For games - update startingAt prices
        if (service === "games" && Array.isArray(config.games)) {
          config.games.forEach((game: any) => {
            if (game.startingAt !== undefined) {
              game.startingAt = priceFormatted;
              priceUpdateCount++;
            }
          });
        }

        // For VPS - update tier prices (formatted with currency)
        if (service === "vps" && Array.isArray(config.tiers)) {
          config.tiers.forEach((tier: any) => {
            if (tier.price !== undefined) {
              // Format price with rupee symbol
              tier.price = `₹${basePrice}`;
              priceUpdateCount++;
            }
          });
        }

        // For other services with plans array - update first plan (base plan)
        if (
          (service === "discord" || service === "webhosting" || service === "dedicated") &&
          Array.isArray(config.plans)
        ) {
          if (config.plans.length > 0 && config.plans[0].price !== undefined) {
            config.plans[0].price = String(basePrice);
            priceUpdateCount++;
          }
        }

        // Write updated config back
        await fs.writeFile(filePath, JSON.stringify(config, null, 2));

        results[service] = {
          updated: true,
          count: priceUpdateCount,
          message: `Successfully synced ${service} pricing`,
        };
      } catch (error) {
        results[service] = {
          updated: false,
          count: 0,
          message: `Error updating: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price synchronization completed",
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
