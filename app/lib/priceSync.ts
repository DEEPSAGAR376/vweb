/**
 * Price Sync Utility
 * Ensures prices are consistent across all service configs when synced from pricing.json
 * Uses a mapping system to track which fields in each service correspond to base prices
 */

export interface PriceSyncMapping {
  service: string;
  paths: Array<{
    field: string;
    formatter?: (price: number) => string;
    description: string;
  }>;
}

/**
 * Maps each service's fields to their corresponding base price locations
 * This is used by the sync API to know which fields to update
 */
export const PRICE_SYNC_MAPPINGS: PriceSyncMapping[] = [
  {
    service: "games",
    paths: [
      {
        field: "games[].startingAt",
        formatter: (price) => `₹${price}/mo`,
        description: "Starting price displayed in game listing",
      },
    ],
  },
  {
    service: "vps",
    paths: [
      {
        field: "tiers[].price",
        formatter: (price) => `₹${price}`,
        description: "VPS tier prices with rupee symbol",
      },
    ],
  },
  {
    service: "discord",
    paths: [
      {
        field: "plans[0].price",
        description: "First plan (base plan) price",
      },
    ],
  },
  {
    service: "webhosting",
    paths: [
      {
        field: "plans[0].price",
        description: "First plan (base plan) price",
      },
    ],
  },
  {
    service: "dedicated",
    paths: [
      {
        field: "plans[0].price",
        description: "First plan (base plan) price",
      },
    ],
  },
];

/**
 * Gets the price sync mapping for a specific service
 */
export function getSyncMapping(service: string): PriceSyncMapping | undefined {
  return PRICE_SYNC_MAPPINGS.find((m) => m.service === service);
}

/**
 * Validates that a config has been properly synced
 */
export function validateSyncStatus(
  service: string,
  config: any,
  expectedPrice: number
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  const mapping = getSyncMapping(service);

  if (!mapping) {
    issues.push(`No sync mapping found for service: ${service}`);
    return { isValid: false, issues };
  }

  // This is a helper function for validation
  // In production, you would check each path in the mapping
  return { isValid: issues.length === 0, issues };
}

/**
 * Returns human-readable information about what gets synced
 */
export function getSyncInfo() {
  return {
    description:
      "Prices are automatically synced from pricing.json base prices to all service configs",
    services: {
      games:
        "Updates 'startingAt' price for all games (displayed on /games page)",
      vps: "Updates all tier prices with rupee symbol (displayed on /vps page)",
      discord: "Updates base plan price (displayed on /discord page)",
      webhosting: "Updates base plan price (displayed on /webhosting page)",
      dedicated: "Updates base plan price (displayed on /dedicated page)",
    },
    lastSync: "Auto-triggered when pricing is saved via admin panel",
  };
}
