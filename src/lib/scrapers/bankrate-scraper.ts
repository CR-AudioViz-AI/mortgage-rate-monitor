/**
 * Bankrate Mortgage Rate Scraper
 * 
 * Secondary source for mortgage rate data. Bankrate conducts weekly surveys
 * of the largest mortgage lenders and provides reliable market rates.
 * 
 * Features:
 * - Weekly rate surveys from major lenders
 * - State-specific rate data
 * - Supports 30-year fixed, 15-year fixed, and 5/1 ARM rates
 * - Includes points and APR data
 * - Historical rate tracking
 * 
 * @timestamp 2025-11-12T14:38:00Z
 */

import { BaseScraper, ScraperConfig, RateData } from './base-scraper';
import * as cheerio from 'cheerio';

export class BankrateScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'Bankrate',
      baseUrl: 'https://www.bankrate.com/mortgages/mortgage-rates',
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
    console.log(`[Bankrate] Fetching rates for ${location} from: ${url}`);

    // Fetch page
    const response = await this.fetchWithTimeout(url);
    const html = await response.text();

    // Try JSON extraction first
    let ratesData = this.extractJsonData(html);

    // Fallback to HTML parsing
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
      source: 'Bankrate',
      scrapedAt: new Date(),
      rawData: rate,
    }));

    console.log(`[Bankrate] Successfully scraped ${rates.length} rates for ${location}`);
    return rates;
  }

  /**
   * Build location-specific URL
   */
  private buildUrl(locationCode: string): string {
    // Bankrate uses state codes primarily
    if (locationCode === 'US') {
      return `${this.config.baseUrl}/`;
    }

    // State codes (e.g., FL, CA, NY)
    if (locationCode.length === 2) {
      return `${this.config.baseUrl}/${locationCode.toLowerCase()}/`;
    }

    // Metro codes - extract state from metro code (e.g., tampa-fl -> fl)
    if (locationCode.includes('-')) {
      const statePart = locationCode.split('-').pop();
      return `${this.config.baseUrl}/${statePart}/`;
    }

    // Regional codes - map to representative state
    const stateCode = this.mapRegionalCode(locationCode);
    return `${this.config.baseUrl}/${stateCode}/`;
  }

  /**
   * Map regional codes to state codes
   */
  private mapRegionalCode(code: string): string {
    const regionalMap: Record<string, string> = {
      NORTHEAST: 'ny',
      SOUTHEAST: 'fl',
      MIDWEST: 'il',
      SOUTHWEST: 'tx',
      WEST: 'ca',
      SWFL: 'fl',
    };

    return regionalMap[code] || 'fl';
  }

  /**
   * Extract rate data from embedded JSON
   */
  private extractJsonData(html: string): any[] | null {
    try {
      // Look for structured data
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/gs
      );
      
      if (jsonLdMatch) {
        for (const match of jsonLdMatch) {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/g, '');
          try {
            const jsonData = JSON.parse(jsonContent);
            
            // Check for financial service schema
            if (jsonData['@type'] === 'FinancialProduct' || jsonData.offers) {
              const rates = this.parseJsonRates(jsonData);
              if (rates && rates.length > 0) return rates;
            }
          } catch (e) {
            continue;
          }
        }
      }

      // Look for page data object
      const pageDataMatch = html.match(
        /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/
      );
      
      if (pageDataMatch) {
        const pageData = JSON.parse(pageDataMatch[1]);
        
        if (pageData.mortgageRates || pageData.rates) {
          return this.parseJsonRates(pageData.mortgageRates || pageData.rates);
        }
      }

      // Look for rate widget data
      const widgetDataMatch = html.match(
        /rateData\s*[=:]\s*(\{[\s\S]*?\});/
      );
      
      if (widgetDataMatch) {
        const widgetData = JSON.parse(widgetDataMatch[1]);
        return this.parseJsonRates(widgetData);
      }

      return null;
    } catch (error) {
      console.warn('[Bankrate] Failed to extract JSON data:', error);
      return null;
    }
  }

  /**
   * Parse JSON rate data into standard format
   */
  private parseJsonRates(data: any): any[] {
    const rates: any[] = [];

    // Handle array of rates
    if (Array.isArray(data)) {
      for (const item of data) {
        const parsed = this.parseRateItem(item);
        if (parsed) rates.push(parsed);
      }
      return rates.length > 0 ? rates : null;
    }

    // Handle object with rate properties
    if (typeof data === 'object') {
      // Check for rates array
      if (data.rates && Array.isArray(data.rates)) {
        for (const item of data.rates) {
          const parsed = this.parseRateItem(item);
          if (parsed) rates.push(parsed);
        }
      }

      // Check for individual rate types
      const rateTypes = [
        { key: 'thirtyYearFixed', type: '30-year-fixed' as const },
        { key: 'fifteenYearFixed', type: '15-year-fixed' as const },
        { key: 'fiveOneArm', type: '5-1-arm' as const },
        { key: '30YearFixed', type: '30-year-fixed' as const },
        { key: '15YearFixed', type: '15-year-fixed' as const },
        { key: '51Arm', type: '5-1-arm' as const },
      ];

      for (const { key, type } of rateTypes) {
        if (data[key]) {
          const parsed = this.parseRateItem(data[key], type);
          if (parsed) rates.push(parsed);
        }
      }
    }

    return rates.length > 0 ? rates : null;
  }

  /**
   * Parse individual rate item
   */
  private parseRateItem(item: any, forcedType?: '30-year-fixed' | '15-year-fixed' | '5-1-arm'): any | null {
    try {
      // Determine loan type
      const loanType = forcedType || this.normalizeLoanType(
        item.loanType || item.loan_type || item.productType || item.type || ''
      );

      if (!loanType) return null;

      // Extract rate values
      const rate = this.extractNumber(
        String(item.rate || item.interestRate || item.interest_rate || 0)
      );
      
      const apr = item.apr || item.APR
        ? this.extractNumber(String(item.apr || item.APR))
        : rate;

      const points = item.points || item.pts
        ? this.extractNumber(String(item.points || item.pts))
        : 0;

      // Validate
      if (rate <= 0 || rate >= 20) return null;

      return {
        loanType,
        rate,
        apr,
        points,
        lender: item.lender || item.lenderName || 'Bankrate Survey',
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse HTML data (fallback method)
   */
  private parseHtmlData(html: string): any[] {
    const $ = cheerio.load(html);
    const rates: any[] = [];

    // Strategy 1: Look for Bankrate's rate table
    $('table.rates-table, table.mortgage-rate-table, [data-testid="rates-table"]').each((_, table) => {
      $(table).find('tbody tr, tr.rate-row').each((_, row) => {
        const cells = $(row).find('td');
        
        if (cells.length >= 3) {
          const loanTypeText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          const aprText = $(cells[2]).text().trim();
          const pointsText = cells.length > 3 ? $(cells[3]).text().trim() : '0';

          const loanType = this.normalizeLoanType(loanTypeText);
          if (!loanType) return;

          try {
            const rate = this.extractNumber(rateText);
            const apr = this.extractNumber(aprText);
            const points = this.extractNumber(pointsText);

            if (rate > 0 && rate < 20) {
              rates.push({
                loanType,
                rate,
                apr,
                points,
                lender: 'Bankrate Survey',
              });
            }
          } catch (error) {
            // Skip invalid rows
          }
        }
      });
    });

    // Strategy 2: Look for rate cards
    $('.rate-card, .mortgage-rate, [class*="RateCard"]').each((_, card) => {
      const loanTypeText = $(card).find('.product-type, .loan-type, h3, h4').first().text().trim();
      const rateText = $(card).find('.rate-value, .interest-rate, [class*="rate"]').first().text().trim();
      const aprText = $(card).find('.apr-value, [class*="apr"]').first().text().trim();

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
            lender: 'Bankrate Survey',
          });
        }
      } catch (error) {
        // Skip invalid cards
      }
    });

    // Strategy 3: Look for specific rate display sections
    const selectors = [
      { sel: '[data-rate-type="30-year-fixed"], #thirty-year-fixed-rate', type: '30-year-fixed' as const },
      { sel: '[data-rate-type="15-year-fixed"], #fifteen-year-fixed-rate', type: '15-year-fixed' as const },
      { sel: '[data-rate-type="5-1-arm"], #five-one-arm-rate', type: '5-1-arm' as const },
    ];

    for (const { sel, type } of selectors) {
      const element = $(sel);
      if (element.length > 0) {
        const rateText = element.find('.rate, [class*="rate-value"]').first().text().trim();
        const aprText = element.find('.apr, [class*="apr-value"]').first().text().trim();

        if (rateText) {
          try {
            const rate = this.extractNumber(rateText);
            const apr = aprText ? this.extractNumber(aprText) : rate;

            if (rate > 0 && rate < 20) {
              rates.push({
                loanType: type,
                rate,
                apr,
                points: 0,
                lender: 'Bankrate Survey',
              });
            }
          } catch (error) {
            // Skip
          }
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

    // 30-year fixed
    if (
      normalized.includes('30year') ||
      normalized.includes('30yr') ||
      normalized.includes('thirtyyear')
    ) {
      return '30-year-fixed';
    }

    // 15-year fixed
    if (
      normalized.includes('15year') ||
      normalized.includes('15yr') ||
      normalized.includes('fifteenyear')
    ) {
      return '15-year-fixed';
    }

    // 5/1 ARM
    if (
      normalized.includes('51arm') ||
      normalized.includes('5/1arm') ||
      normalized.includes('fiveonearm') ||
      (normalized.includes('5') && normalized.includes('1') && normalized.includes('arm'))
    ) {
      return '5-1-arm';
    }

    return null;
  }
}
