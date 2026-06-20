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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseUrl();
  
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/vps`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dedicated`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
