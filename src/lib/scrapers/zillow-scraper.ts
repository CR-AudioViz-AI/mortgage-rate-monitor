/**
 * Zillow Mortgage Rate Scraper
 * 
 * Primary source for mortgage rate data. Zillow aggregates rates from
 * thousands of lenders and provides location-specific data.
 * 
 * Features:
 * - Supports all 92 locations (states, metros, regions)
 * - Extracts 30-year fixed, 15-year fixed, and 5/1 ARM rates
 * - Parses APR, points, and lender information
 * - Handles both HTML and JSON data formats
 * 
 * @timestamp 2025-11-12T14:35:00Z
 */

import { BaseScraper, ScraperConfig, RateData } from './base-scraper';
import * as cheerio from 'cheerio';

export class ZillowScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'Zillow',
      baseUrl: 'https://www.zillow.com/mortgage-rates',
      timeout: 15000, // 15 seconds
      maxRetries: 3,
      retryDelay: 2000, // 2 seconds
      rateLimit: 20, // 20 requests per minute
    };
    super(config);
  }

  /**
   * Main scraping method - extracts rates for a specific location
   */
  async scrapeRates(location: string, locationCode: string): Promise<RateData[]> {
    const url = this.buildUrl(locationCode);
    console.log(`[Zillow] Fetching rates for ${location} from: ${url}`);

    // Fetch page
    const response = await this.fetchWithTimeout(url);
    const html = await response.text();

    // Try JSON parsing first (Zillow often embeds JSON data)
    let ratesData = this.extractJsonData(html);

    // Fallback to HTML parsing if JSON not found
    if (!ratesData || ratesData.length === 0) {
      ratesData = this.parseHtmlData(html);
    }

    // If still no data, throw error
    if (!ratesData || ratesData.length === 0) {
      throw new Error('No rate data found in page');
    }

    // Transform to our standard format
    const rates: RateData[] = ratesData.map((rate) => ({
      location,
      locationCode,
      rateType: rate.loanType,
      rate: rate.rate,
      apr: rate.apr,
      points: rate.points,
      source: 'Zillow',
      scrapedAt: new Date(),
      rawData: rate,
    }));

    console.log(`[Zillow] Successfully scraped ${rates.length} rates for ${location}`);
    return rates;
  }

  /**
   * Build location-specific URL
   */
  private buildUrl(locationCode: string): string {
    // Handle different location code formats
    if (locationCode === 'US') {
      return `${this.config.baseUrl}/`;
    }

    // State codes (e.g., FL, CA, NY)
    if (locationCode.length === 2) {
      return `${this.config.baseUrl}/${locationCode.toLowerCase()}/`;
    }

    // Metro codes (e.g., tampa-fl, miami-fl)
    if (locationCode.includes('-')) {
      return `${this.config.baseUrl}/${locationCode.toLowerCase()}/`;
    }

    // Regional codes (e.g., NORTHEAST, SWFL)
    // These map to state or metro areas
    return this.mapRegionalCode(locationCode);
  }

  /**
   * Map regional codes to actual Zillow URLs
   */
  private mapRegionalCode(code: string): string {
    const regionalMap: Record<string, string> = {
      NORTHEAST: 'ny',
      SOUTHEAST: 'fl',
      MIDWEST: 'il',
      SOUTHWEST: 'tx',
      WEST: 'ca',
      SWFL: 'naples-fl',
    };

    const mapped = regionalMap[code] || 'fl';
    return `${this.config.baseUrl}/${mapped}/`;
  }

  /**
   * Extract rate data from embedded JSON (Zillow's preferred format)
   */
  private extractJsonData(html: string): any[] | null {
    try {
      // Look for JSON-LD structured data
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s
      );
      if (jsonLdMatch) {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData.offers || jsonData.rates) {
          return this.parseJsonRates(jsonData);
        }
      }

      // Look for embedded JavaScript data
      const scriptMatch = html.match(
        /<script[^>]*>[\s\S]*?window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/
      );
      if (scriptMatch) {
        const stateData = JSON.parse(scriptMatch[1]);
        if (stateData.mortgageRates) {
          return this.parseJsonRates(stateData.mortgageRates);
        }
      }

      // Look for rate table data
      const rateDataMatch = html.match(
        /rateData\s*[=:]\s*(\[[\s\S]*?\]);/
      );
      if (rateDataMatch) {
        const rateData = JSON.parse(rateDataMatch[1]);
        return this.parseJsonRates(rateData);
      }

      return null;
    } catch (error) {
      console.warn('[Zillow] Failed to extract JSON data:', error);
      return null;
    }
  }

  /**
   * Parse JSON rate data into standard format
   */
  private parseJsonRates(data: any): any[] {
    const rates: any[] = [];

    // Handle different JSON structures
    const rateArray = Array.isArray(data) ? data : data.rates || data.offers || [];

    for (const item of rateArray) {
      // Extract loan type
      let loanType = this.normalizeLoanType(
        item.loanType || item.loan_type || item.product || item.type
      );

      if (!loanType) continue;

      // Extract rate data
      const rate = this.extractNumber(String(item.rate || item.interestRate || 0));
      const apr = this.extractNumber(String(item.apr || item.APR || rate));
      const points = item.points ? this.extractNumber(String(item.points)) : 0;

      // Validate
      if (rate > 0 && rate < 20) {
        rates.push({
          loanType,
          rate,
          apr: apr || rate,
          points,
          lender: item.lender || 'Unknown',
        });
      }
    }

    return rates.length > 0 ? rates : null;
  }

  /**
   * Parse HTML data (fallback method)
   */
  private parseHtmlData(html: string): any[] {
    const $ = cheerio.load(html);
    const rates: any[] = [];

    // Strategy 1: Look for rate tables
    $('table.rate-table, table.mortgage-rates, [data-testid*="rate"]').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 3) {
          const loanTypeText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          const aprText = $(cells[2]).text().trim();

          const loanType = this.normalizeLoanType(loanTypeText);
          if (!loanType) return;

          try {
            const rate = this.extractNumber(rateText);
            const apr = this.extractNumber(aprText);

            if (rate > 0 && rate < 20) {
              rates.push({
                loanType,
                rate,
                apr,
                points: 0,
                lender: 'Multiple',
              });
            }
          } catch (error) {
            // Skip invalid rows
          }
        }
      });
    });

    // Strategy 2: Look for rate cards/sections
    $('.rate-card, .mortgage-rate-card, [class*="RateCard"]').each((_, card) => {
      const loanTypeText = $(card).find('.loan-type, .product-name, h3, h4').first().text().trim();
      const rateText = $(card).find('.rate, .interest-rate, [class*="Rate"]').first().text().trim();
      const aprText = $(card).find('.apr, [class*="Apr"]').first().text().trim();

      const loanType = this.normalizeLoanType(loanTypeText);
      if (!loanType) return;

      try {
        const rate = this.extractNumber(rateText);
        const apr = aprText ? this.extractNumber(aprText) : rate;

        if (rate > 0 && rate < 20) {
          rates.push({
            loanType,
            rate,
            apr,
            points: 0,
            lender: 'Multiple',
          });
        }
      } catch (error) {
        // Skip invalid cards
      }
    });

    // Strategy 3: Look for specific loan type sections
    const loanTypes = [
      { selector: '[data-loan-type="30-year-fixed"], #rate-30-year', type: '30-year-fixed' as const },
      { selector: '[data-loan-type="15-year-fixed"], #rate-15-year', type: '15-year-fixed' as const },
      { selector: '[data-loan-type="5-1-arm"], #rate-5-1-arm', type: '5-1-arm' as const },
    ];

    for (const { selector, type } of loanTypes) {
      const element = $(selector);
      if (element.length > 0) {
        const rateText = element.find('.rate, [class*="rate"]').first().text().trim();
        const aprText = element.find('.apr, [class*="apr"]').first().text().trim();

        try {
          const rate = this.extractNumber(rateText);
          const apr = aprText ? this.extractNumber(aprText) : rate;

          if (rate > 0 && rate < 20) {
            rates.push({
              loanType: type,
              rate,
              apr,
              points: 0,
              lender: 'Multiple',
            });
          }
        } catch (error) {
          // Skip
        }
      }
    }

    return rates.length > 0 ? rates : [];
  }

  /**
   * Normalize loan type text to standard format
   */
  private normalizeLoanType(text: string): '30-year-fixed' | '15-year-fixed' | '5-1-arm' | null {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalized.includes('30') && (normalized.includes('year') || normalized.includes('yr'))) {
      return '30-year-fixed';
    }

    if (normalized.includes('15') && (normalized.includes('year') || normalized.includes('yr'))) {
      return '15-year-fixed';
    }

    if (
      (normalized.includes('51') || normalized.includes('5/1') || normalized.includes('5-1')) &&
      normalized.includes('arm')
    ) {
      return '5-1-arm';
    }

    return null;
  }
}
