/**
 * Base Scraper Class
 * 
 * Abstract class providing common functionality for all mortgage rate scrapers:
 * - Retry logic with exponential backoff
 * - Rate limiting and request throttling
 * - Error handling and logging
 * - User-agent rotation
 * - Response validation
 * 
 * @timestamp 2025-11-12T14:32:00Z
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  rateLimit: number; // requests per minute
}

export interface RateData {
  location: string;
  locationCode: string;
  rateType: '30-year-fixed' | '15-year-fixed' | '5-1-arm';
  rate: number;
  apr: number;
  points?: number;
  source: string;
  scrapedAt: Date;
  rawData?: any;
}

export interface ScraperResult {
  success: boolean;
  data?: RateData[];
  error?: string;
  duration: number;
  retries: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected lastRequestTime: number = 0;
  protected requestCount: number = 0;
  protected userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Abstract method - must be implemented by each scraper
   */
  abstract scrapeRates(location: string, locationCode: string): Promise<RateData[]>;

  /**
   * Main scrape method with retry logic and error handling
   */
  async scrape(location: string, locationCode: string): Promise<ScraperResult> {
    const startTime = Date.now();
    let retries = 0;
    let lastError: string | undefined;

    // Log scraping start
    await this.logScrapingAttempt(locationCode, 'started');

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // Rate limiting
        await this.enforceRateLimit();

        // Attempt scraping
        const data = await this.scrapeRates(location, locationCode);

        // Validate results
        if (!data || data.length === 0) {
          throw new Error('No rate data returned');
        }

        // Validate each rate
        for (const rate of data) {
          this.validateRateData(rate);
        }

        const duration = Date.now() - startTime;

        // Log success
        await this.logScrapingAttempt(locationCode, 'success', data.length, duration);

        return {
          success: true,
          data,
          duration,
          retries,
        };
      } catch (error: any) {
        retries++;
        lastError = error.message || 'Unknown error';

        console.error(
          `[${this.config.name}] Attempt ${attempt + 1}/${this.config.maxRetries + 1} failed for ${location}:`,
          lastError
        );

        // Don't retry on validation errors
        if (lastError.includes('Invalid rate data')) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.log(`[${this.config.name}] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    const duration = Date.now() - startTime;

    // Log failure
    await this.logScrapingAttempt(locationCode, 'failed', 0, duration, lastError);

    return {
      success: false,
      error: lastError,
      duration,
      retries,
    };
  }

  /**
   * Enforce rate limiting between requests
   */
  protected async enforceRateLimit(): Promise<void> {
    const minInterval = (60 * 1000) / this.config.rateLimit; // ms between requests
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Make HTTP request with timeout and user-agent rotation
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeout);

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Validate rate data structure and values
   */
  protected validateRateData(rate: RateData): void {
    if (!rate.location || !rate.locationCode) {
      throw new Error('Invalid rate data: missing location information');
    }

    if (!rate.rateType) {
      throw new Error('Invalid rate data: missing rate type');
    }

    if (typeof rate.rate !== 'number' || rate.rate <= 0 || rate.rate > 20) {
      throw new Error(`Invalid rate data: rate out of bounds (${rate.rate}%)`);
    }

    if (typeof rate.apr !== 'number' || rate.apr <= 0 || rate.apr > 20) {
      throw new Error(`Invalid rate data: APR out of bounds (${rate.apr}%)`);
    }

    if (rate.apr < rate.rate) {
      throw new Error('Invalid rate data: APR cannot be less than rate');
    }

    if (!rate.source) {
      throw new Error('Invalid rate data: missing source');
    }
  }

  /**
   * Log scraping attempt to database
   */
  protected async logScrapingAttempt(
    locationCode: string,
    status: 'started' | 'success' | 'failed',
    ratesFound: number = 0,
    duration?: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase.from('scraping_logs').insert({
        source: this.config.name,
        location_code: locationCode,
        status,
        rates_found: ratesFound,
        duration_ms: duration,
        error_message: errorMessage,
        scraped_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[${this.config.name}] Failed to log scraping attempt:`, error);
      // Don't throw - logging failures shouldn't break scraping
    }
  }

  /**
   * Get random user agent for request rotation
   */
  protected getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Sleep helper for delays
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Extract numeric value from string (handles "$1,234.56" -> 1234.56)
   */
  protected extractNumber(value: string): number {
    const cleaned = value.replace(/[$,\s%]/g, '');
    const number = parseFloat(cleaned);
    
    if (isNaN(number)) {
      throw new Error(`Cannot extract number from: ${value}`);
    }
    
    return number;
  }

  /**
   * Get scraper statistics
   */
  getStats(): {
    name: string;
    requestCount: number;
    lastRequestTime: number;
  } {
    return {
      name: this.config.name,
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    };
  }
}
