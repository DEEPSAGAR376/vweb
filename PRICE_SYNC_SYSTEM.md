# Price Synchronization System

## Overview

The price synchronization system ensures that prices set by admins in the control panel are immediately reflected on all public-facing pages. This document explains how the system works and how to use it.

## How It Works

### Architecture

```
Admin Panel (Homepage Pricing Tab)
         ↓
pricing.json (Base prices)
         ↓
Automatic Sync API (/api/admin/sync-prices)
         ↓
Service Config Files (games.json, vps.json, etc.)
         ↓
Public Pages (/games, /vps, /dedicated, /webhosting, /discord)
```

### Price Synchronization Flow

1. **Admin Updates Base Prices**
   - Admin opens the "Homepage Pricing" tab in the admin panel
   - Admin updates base prices (e.g., Games: ₹120, VPS: ₹150, etc.)
   - Admin clicks "Save Homepage Pricing"

2. **Automatic Sync Triggered**
   - After saving, the system automatically calls `/api/admin/sync-prices`
   - The sync API reads the updated base prices from `pricing.json`
   - It updates all service configurations with the new prices

3. **Services Updated**
   - **Games** (`games.json`): Updates `games[].startingAt` price
   - **VPS** (`vps.json`): Updates all tier prices
   - **Dedicated** (`dedicated.json`): Updates base plan price
   - **Web Hosting** (`webhosting.json`): Updates base plan price
   - **Discord Bot** (`discord.json`): Updates base plan price

4. **Pages Fetch Live Data**
   - Public pages fetch data from `/api/admin/config?section=[service]` on mount
   - They immediately display the updated prices
   - No need for manual refresh or cache clearing

## Admin Features

### 1. Automatic Sync (Default)
- When admin saves pricing from "Homepage Pricing" tab, sync happens automatically
- Admin sees confirmation message: "Prices synced! Updated X prices across all services."

### 2. Manual Sync Button
- "Sync Prices to Services" button available in the pricing section
- Allows admin to manually trigger sync anytime
- Useful if prices get out of sync or need emergency update

### 3. Service-Specific Price Editing
- Admin can also edit individual service prices directly in their respective tabs
- Changes are saved independently
- These won't affect homepage pricing unless manually updated

## Config Files

### pricing.json (Base Prices)
```json
{
  "section": {
    "plans": [
      {
        "titleKey": "pricingPlans.gameServers.title",
        "basePrice": 120
      },
      {
        "titleKey": "pricingPlans.vpsHosting.title",
        "basePrice": 150
      }
    ]
  }
}
```

### games.json (After Sync)
```json
{
  "games": [
    {
      "name": "Minecraft",
      "startingAt": "₹120/mo"
    }
  ]
}
```

### vps.json (After Sync)
```json
{
  "tiers": [
    {
      "price": "₹150"
    }
  ]
}
```

## API Endpoints

### GET /api/admin/config?section=[service]
Fetches current configuration for a service (used by public pages).

**Parameters:**
- `section`: The service name (pricing, games, vps, dedicated, webhosting, discord)

**Response:**
```json
{
  "games": [...],
  "locations": [...],
  "planTypes": [...]
}
```

### POST /api/admin/config?section=[service]
Updates configuration for a service (used by admin panel).

**Parameters:**
- `section`: The service name
- `body`: Updated configuration object

### POST /api/admin/sync-prices
Synchronizes prices from pricing.json to all service configs.

**Authentication:** Requires valid `ADMIN_PASSWORD` token

**Response:**
```json
{
  "success": true,
  "message": "Price synchronization completed",
  "results": {
    "games": {
      "updated": true,
      "count": 8,
      "message": "Successfully synced games pricing"
    },
    "vps": {
      "updated": true,
      "count": 24,
      "message": "Successfully synced vps pricing"
    }
  }
}
```

## Testing the Sync

### Test Case 1: Homepage Pricing Update
1. Go to `/admin`
2. Login with admin password
3. Click "Homepage Pricing" tab
4. Change "Game Servers" price from 120 to 150
5. Click "Save Homepage Pricing"
6. Verify: Go to `/games` page
7. Check that all games show "Starting at ₹150/mo"

### Test Case 2: Manual Sync
1. Go to `/admin` → "Homepage Pricing"
2. Click "Sync Prices to Services"
3. Wait for confirmation message
4. Verify prices in `games.json`, `vps.json`, etc.

### Test Case 3: Service-Specific Changes
1. Go to `/admin` → "Game Pricing"
2. Change a Minecraft plan price from 256 to 300
3. Click "Save Game Pricing"
4. Go to `/games` page
5. Verify Minecraft shows the updated price for that plan

## Troubleshooting

### Prices Not Updating on Public Pages
- **Solution**: Pages fetch live data on mount, but may cache. Clear browser cache or hard refresh (Ctrl+Shift+R)
- Verify the config files were actually updated: Check `app/config/sections/[service].json`

### Sync Button Disabled or Grayed Out
- **Solution**: Ensure admin session is still valid. Logout and login again.
- Check browser console for any error messages.

### Prices Changed in Admin but Not Saved
- **Solution**: Always click the "Save" button for the service before expecting sync
- Manual sync button only syncs already-saved prices

## Configuration Details

### Price Format by Service
- **Games**: `₹120/mo` format in `startingAt` field
- **VPS**: `₹150` format in `price` field (no /mo)
- **Dedicated**: Raw number format `5000` in `price` field
- **Web Hosting**: Raw number format `100` in `price` field
- **Discord**: Raw number format `30` in `price` field

### Sync Mapping
See `app/lib/priceSync.ts` for the complete mapping of which fields in each service config get synced.

## Security

- Only authenticated admins (with correct `ADMIN_PASSWORD`) can trigger sync
- Sync operations are logged in server console
- Config files are validated before sync to prevent corruption

## Performance

- Sync completes in < 100ms
- Public pages cache API responses using React state (no stale cache)
- Fresh data is fetched on every page visit due to client-side state management

## Future Enhancements

- [ ] Add sync history/audit log
- [ ] Allow scheduled price changes
- [ ] Add price change notifications
- [ ] Implement version control for config changes
- [ ] Add rollback functionality
