import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';
import brandingConfig from './config/sections/branding.json';

export const dynamic = "force-dynamic";

async function getBaseUrl(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'app', 'config', 'sections', 'branding.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const branding = JSON.parse(data);
    return branding.websiteUrl.replace(/\/$/, '');
  } catch {
    return brandingConfig.websiteUrl.replace(/\/$/, '');
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getBaseUrl();
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
