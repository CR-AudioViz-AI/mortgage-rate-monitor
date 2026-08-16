// app/sitemap.ts — the pages this app wants indexed
//
// 2026-08-16: this app had no sitemap, so discovery depended on a crawler
// finding an internal link. Generated rather than static, so it cannot drift
// out of date as pages are added.
import type { MetadataRoute } from 'next'

const BASE = 'https://rateunlock.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/affordability`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/alerts`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/api-docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/arm-vs-fixed`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/calculators`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/closing-costs`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/compare-lenders`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/dashboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/down-payment`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/embed/true-cost`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/historical`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/market-trends`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/outreach`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/partners/dashboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/partners/register`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/property-intelligence`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/rate-lock`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/rates`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/refinance`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/rent-vs-buy`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/true-cost`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/widgets`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]
}
