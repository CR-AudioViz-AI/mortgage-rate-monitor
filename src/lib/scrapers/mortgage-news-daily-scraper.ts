/**
 * MortgageNewsDaily Mortgage Rate Scraper
 * 
 * Tertiary source for mortgage rate data. MND provides daily updates on
 * mortgage rates with focus on national averages and market trends.
 * 
 * Features:
 * - Daily rate updates from market data
 * - National average rates (primary focus)
 * - Some regional data available
 * - Supports 30-year fixed, 15-year fixed, and 5/1 ARM rates
 * - Market analysis and rate trend data
 * 
 * @timestamp 2025-11-12T14:41:00Z
 */

import { BaseScraper, ScraperConfig, RateData } from './base-scraper';
import * as cheerio from 'cheerio';

export class MortgageNewsDailyScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'MortgageNewsDaily',
      baseUrl: 'https://www.mortgagenewsdaily.com/mortgage-rates',
      timeout: 15000, // 15 seconds
      maxRetries: 3,
      retryDelay: 2000, // 2 seconds
      rateLimit: 15, // 15 requests per minute (more conservative)
    };
    super(config);
  }

  /**
   * Main scraping method - extracts rates for a specific location
   */
  async scrapeRates(location: string, locationCode: string): Promise<RateData[]> {
    const url = this.buildUrl(locationCode);
    console.log(`[MortgageNewsDaily] Fetching rates for ${location} from: ${url}`);

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
      source: 'MortgageNewsDaily',
      scrapedAt: new Date(),
      rawData: rate,
    }));

    console.log(`[MortgageNewsDaily] Successfully scraped ${rates.length} rates for ${location}`);
    return rates;
  }

  /**
   * Build location-specific URL
   * Note: MND primarily provides national data, regional data is limited
   */
  private buildUrl(locationCode: string): string {
    // MND primarily has national rates
    if (locationCode === 'US') {
      return `${this.config.baseUrl}/`;
    }

    // For states and regions, we'll use national rates as proxy
    // MND doesn't have comprehensive location-specific data
    // In a production system, you might want to add state pages if they exist
    
    // Check if state-specific page exists (some states have them)
    const stateUrls: Record<string, string> = {
      'CA': '/california-mortgage-rates',
      'FL': '/florida-mortgage-rates',
      'TX': '/texas-mortgage-rates',
      'NY': '/new-york-mortgage-rates',
    };

    const stateCode = this.extractStateCode(locationCode);
    if (stateUrls[stateCode]) {
      return `${this.config.baseUrl}${stateUrls[stateCode]}`;
    }

    // Default to national rates
    return `${this.config.baseUrl}/`;
  }

  /**
   * Extract state code from location code
   */
  private extractStateCode(locationCode: string): string {
    // Already a state code
    if (locationCode.length === 2) {
      return locationCode.toUpperCase();
    }

    // Metro code (e.g., tampa-fl)
    if (locationCode.includes('-')) {
      const parts = locationCode.split('-');
      return parts[parts.length - 1].toUpperCase();
    }

    // Regional codes
    const regionalMap: Record<string, string> = {
      NORTHEAST: 'NY',
      SOUTHEAST: 'FL',
      MIDWEST: 'IL',
      SOUTHWEST: 'TX',
      WEST: 'CA',
      SWFL: 'FL',
    };

    return regionalMap[locationCode] || 'US';
  }

  /**
   * Extract rate data from embedded JSON
   */
  private extractJsonData(html: string): any[] | null {
    try {
      // Strategy 1: Look for rate data object
      const rateDataMatch = html.match(
        /var\s+rateData\s*=\s*({[\s\S]*?});/
      );
      
      if (rateDataMatch) {
        const rateData = JSON.parse(rateDataMatch[1]);
        const rates = this.parseJsonRates(rateData);
        if (rates && rates.length > 0) return rates;
      }

      // Strategy 2: Look for chart/graph data
      const chartDataMatch = html.match(
        /chartData\s*[=:]\s*(\[[\s\S]*?\])/
      );
      
      if (chartDataMatch) {
        const chartData = JSON.parse(chartDataMatch[1]);
        const rates = this.parseChartData(chartData);
        if (rates && rates.length > 0) return rates;
      }

      // Strategy 3: Look for structured data
      const jsonLdMatches = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/gs
      );
      
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/g, '');
          try {
            const jsonData = JSON.parse(jsonContent);
            
            if (jsonData.rates || jsonData['@graph']) {
              const rates = this.parseJsonRates(jsonData);
              if (rates && rates.length > 0) return rates;
            }
          } catch (e) {
            continue;
          }
        }
      }

      // Strategy 4: Look for API data endpoint
      const apiDataMatch = html.match(
        /apiData\s*[=:]\s*({[\s\S]*?})/
      );
      
      if (apiDataMatch) {
        const apiData = JSON.parse(apiDataMatch[1]);
        if (apiData.rates) {
          return this.parseJsonRates(apiData.rates);
        }
      }

      return null;
    } catch (error) {
      console.warn('[MortgageNewsDaily] Failed to extract JSON data:', error);
      return null;
    }
  }

  /**
   * Parse JSON rate data
   */
  private parseJsonRates(data: any): any[] {
    const rates: any[] = [];

    // Handle array format
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

      // Check for current rates object
      if (data.current || data.currentRates) {
        const current = data.current || data.currentRates;
        
        const rateTypes = [
          { key: 'rate30Year', type: '30-year-fixed' as const },
          { key: 'rate15Year', type: '15-year-fixed' as const },
          { key: 'rate51ARM', type: '5-1-arm' as const },
          { key: 'thirtyYear', type: '30-year-fixed' as const },
          { key: 'fifteenYear', type: '15-year-fixed' as const },
          { key: 'fiveOneArm', type: '5-1-arm' as const },
        ];

        for (const { key, type } of rateTypes) {
          if (current[key]) {
            const parsed = this.parseRateItem(current[key], type);
            if (parsed) rates.push(parsed);
          }
        }
      }
    }

    return rates.length > 0 ? rates : null;
  }

  /**
   * Parse chart data format
   */
  private parseChartData(chartData: any[]): any[] {
    const rates: any[] = [];

    // Get most recent data point
    if (chartData.length > 0) {
      const latest = chartData[chartData.length - 1];

      // Try to extract different rate types
      const rateFields = [
        { field: 'rate30', type: '30-year-fixed' as const },
        { field: 'rate15', type: '15-year-fixed' as const },
        { field: 'rate51', type: '5-1-arm' as const },
        { field: 'thirtyYear', type: '30-year-fixed' as const },
        { field: 'fifteenYear', type: '15-year-fixed' as const },
        { field: 'arm51', type: '5-1-arm' as const },
      ];

      for (const { field, type } of rateFields) {
        if (latest[field]) {
          try {
            const rate = typeof latest[field] === 'number' 
              ? latest[field] 
              : this.extractNumber(String(latest[field]));

            if (rate > 0 && rate < 20) {
              rates.push({
                loanType: type,
                rate,
                apr: rate, // Chart data typically doesn't include APR
                points: 0,
                lender: 'Market Average',
              });
            }
          } catch (error) {
            // Skip invalid data
          }
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
        item.loanType || item.loan_type || item.product || item.type || ''
      );

      if (!loanType) return null;

      // Extract rate values
      const rateValue = item.rate || item.interestRate || item.value || 0;
      const rate = typeof rateValue === 'number' 
        ? rateValue 
        : this.extractNumber(String(rateValue));

      const aprValue = item.apr || item.APR;
      const apr = aprValue 
        ? (typeof aprValue === 'number' ? aprValue : this.extractNumber(String(aprValue)))
        : rate;

      const pointsValue = item.points || item.pts || 0;
      const points = typeof pointsValue === 'number'
        ? pointsValue
        : this.extractNumber(String(pointsValue));

      // Validate
      if (rate <= 0 || rate >= 20) return null;

      return {
        loanType,
        rate,
        apr,
        points,
        lender: item.lender || 'Market Average',
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

    // Strategy 1: Look for rate display table
    $('table.rate-table, .rates-table, [class*="rateTable"]').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');
        
        if (cells.length >= 2) {
          const loanTypeText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();

          const loanType = this.normalizeLoanType(loanTypeText);
          if (!loanType) return;

          try {
            const rate = this.extractNumber(rateText);

            if (rate > 0 && rate < 20) {
              rates.push({
                loanType,
                rate,
                apr: rate,
                points: 0,
                lender: 'Market Average',
              });
            }
          } catch (error) {
            // Skip invalid rows
          }
        }
      });
    });

    // Strategy 2: Look for rate display sections
    $('.rate-display, .current-rate, [class*="rateDisplay"]').each((_, section) => {
      const loanTypeText = $(section).find('.rate-type, .loan-type').text().trim();
      const rateText = $(section).find('.rate-value, .rate').text().trim();

      const loanType = this.normalizeLoanType(loanTypeText);
      if (!loanType) return;

      try {
        const rate = this.extractNumber(rateText);

        if (rate > 0 && rate < 20) {
          rates.push({
            loanType,
            rate,
            apr: rate,
            points: 0,
            lender: 'Market Average',
          });
        }
      } catch (error) {
        // Skip
      }
    });

    // Strategy 3: Look for specific rate displays
    const selectors = [
      { sel: '#rate-30-year, [data-rate="30-year"]', type: '30-year-fixed' as const },
      { sel: '#rate-15-year, [data-rate="15-year"]', type: '15-year-fixed' as const },
      { sel: '#rate-5-1-arm, [data-rate="5-1-arm"]', type: '5-1-arm' as const },
    ];

    for (const { sel, type } of selectors) {
      const element = $(sel);
      if (element.length > 0) {
        const rateText = element.text().trim() || element.attr('data-value') || '';

        if (rateText) {
          try {
            const rate = this.extractNumber(rateText);

            if (rate > 0 && rate < 20) {
              rates.push({
                loanType: type,
                rate,
                apr: rate,
                points: 0,
                lender: 'Market Average',
              });
            }
          } catch (error) {
            // Skip
          }
        }
      }
    }

    // Strategy 4: Look for main content rate mentions
    $('.article-content, .main-content, main').each((_, content) => {
      const text = $(content).text();
      
      // Look for patterns like "30-year fixed: 6.5%" or "30-year: 6.5%"
      const patterns = [
        { regex: /30[- ]year[^:]*:\s*([\d.]+)%/i, type: '30-year-fixed' as const },
        { regex: /15[- ]year[^:]*:\s*([\d.]+)%/i, type: '15-year-fixed' as const },
        { regex: /5[\/\-]1\s*ARM[^:]*:\s*([\d.]+)%/i, type: '5-1-arm' as const },
      ];

      for (const { regex, type } of patterns) {
        const match = text.match(regex);
        if (match) {
          try {
            const rate = parseFloat(match[1]);
            if (rate > 0 && rate < 20 && !rates.find(r => r.loanType === type)) {
              rates.push({
                loanType: type,
                rate,
                apr: rate,
                points: 0,
                lender: 'Market Average',
              });
            }
          } catch (error) {
            // Skip
          }
        }
      }
    });

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
