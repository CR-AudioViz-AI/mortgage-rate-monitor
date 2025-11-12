/**
 * Location Configuration
 * 
 * Defines all 92 supported locations for mortgage rate monitoring:
 * - 50 US States
 * - 35 Major Metro Areas
 * - 6 Regional Groups
 * - 1 National Average
 * 
 * @timestamp 2025-11-12T14:47:00Z
 */

export interface Location {
  name: string;
  code: string;
  type: 'state' | 'metro' | 'regional' | 'national';
}

export const LOCATIONS: Location[] = [
  // NATIONAL
  { name: 'United States', code: 'US', type: 'national' },

  // REGIONAL
  { name: 'Northeast', code: 'NORTHEAST', type: 'regional' },
  { name: 'Southeast', code: 'SOUTHEAST', type: 'regional' },
  { name: 'Midwest', code: 'MIDWEST', type: 'regional' },
  { name: 'Southwest', code: 'SOUTHWEST', type: 'regional' },
  { name: 'West', code: 'WEST', type: 'regional' },
  { name: 'Southwest Florida', code: 'SWFL', type: 'regional' },

  // 50 US STATES
  { name: 'Alabama', code: 'AL', type: 'state' },
  { name: 'Alaska', code: 'AK', type: 'state' },
  { name: 'Arizona', code: 'AZ', type: 'state' },
  { name: 'Arkansas', code: 'AR', type: 'state' },
  { name: 'California', code: 'CA', type: 'state' },
  { name: 'Colorado', code: 'CO', type: 'state' },
  { name: 'Connecticut', code: 'CT', type: 'state' },
  { name: 'Delaware', code: 'DE', type: 'state' },
  { name: 'Florida', code: 'FL', type: 'state' },
  { name: 'Georgia', code: 'GA', type: 'state' },
  { name: 'Hawaii', code: 'HI', type: 'state' },
  { name: 'Idaho', code: 'ID', type: 'state' },
  { name: 'Illinois', code: 'IL', type: 'state' },
  { name: 'Indiana', code: 'IN', type: 'state' },
  { name: 'Iowa', code: 'IA', type: 'state' },
  { name: 'Kansas', code: 'KS', type: 'state' },
  { name: 'Kentucky', code: 'KY', type: 'state' },
  { name: 'Louisiana', code: 'LA', type: 'state' },
  { name: 'Maine', code: 'ME', type: 'state' },
  { name: 'Maryland', code: 'MD', type: 'state' },
  { name: 'Massachusetts', code: 'MA', type: 'state' },
  { name: 'Michigan', code: 'MI', type: 'state' },
  { name: 'Minnesota', code: 'MN', type: 'state' },
  { name: 'Mississippi', code: 'MS', type: 'state' },
  { name: 'Missouri', code: 'MO', type: 'state' },
  { name: 'Montana', code: 'MT', type: 'state' },
  { name: 'Nebraska', code: 'NE', type: 'state' },
  { name: 'Nevada', code: 'NV', type: 'state' },
  { name: 'New Hampshire', code: 'NH', type: 'state' },
  { name: 'New Jersey', code: 'NJ', type: 'state' },
  { name: 'New Mexico', code: 'NM', type: 'state' },
  { name: 'New York', code: 'NY', type: 'state' },
  { name: 'North Carolina', code: 'NC', type: 'state' },
  { name: 'North Dakota', code: 'ND', type: 'state' },
  { name: 'Ohio', code: 'OH', type: 'state' },
  { name: 'Oklahoma', code: 'OK', type: 'state' },
  { name: 'Oregon', code: 'OR', type: 'state' },
  { name: 'Pennsylvania', code: 'PA', type: 'state' },
  { name: 'Rhode Island', code: 'RI', type: 'state' },
  { name: 'South Carolina', code: 'SC', type: 'state' },
  { name: 'South Dakota', code: 'SD', type: 'state' },
  { name: 'Tennessee', code: 'TN', type: 'state' },
  { name: 'Texas', code: 'TX', type: 'state' },
  { name: 'Utah', code: 'UT', type: 'state' },
  { name: 'Vermont', code: 'VT', type: 'state' },
  { name: 'Virginia', code: 'VA', type: 'state' },
  { name: 'Washington', code: 'WA', type: 'state' },
  { name: 'West Virginia', code: 'WV', type: 'state' },
  { name: 'Wisconsin', code: 'WI', type: 'state' },
  { name: 'Wyoming', code: 'WY', type: 'state' },

  // 35 MAJOR METRO AREAS
  { name: 'New York, NY', code: 'new-york-ny', type: 'metro' },
  { name: 'Los Angeles, CA', code: 'los-angeles-ca', type: 'metro' },
  { name: 'Chicago, IL', code: 'chicago-il', type: 'metro' },
  { name: 'Houston, TX', code: 'houston-tx', type: 'metro' },
  { name: 'Phoenix, AZ', code: 'phoenix-az', type: 'metro' },
  { name: 'Philadelphia, PA', code: 'philadelphia-pa', type: 'metro' },
  { name: 'San Antonio, TX', code: 'san-antonio-tx', type: 'metro' },
  { name: 'San Diego, CA', code: 'san-diego-ca', type: 'metro' },
  { name: 'Dallas, TX', code: 'dallas-tx', type: 'metro' },
  { name: 'Austin, TX', code: 'austin-tx', type: 'metro' },
  { name: 'Jacksonville, FL', code: 'jacksonville-fl', type: 'metro' },
  { name: 'Fort Worth, TX', code: 'fort-worth-tx', type: 'metro' },
  { name: 'Columbus, OH', code: 'columbus-oh', type: 'metro' },
  { name: 'San Francisco, CA', code: 'san-francisco-ca', type: 'metro' },
  { name: 'Charlotte, NC', code: 'charlotte-nc', type: 'metro' },
  { name: 'Indianapolis, IN', code: 'indianapolis-in', type: 'metro' },
  { name: 'Seattle, WA', code: 'seattle-wa', type: 'metro' },
  { name: 'Denver, CO', code: 'denver-co', type: 'metro' },
  { name: 'Boston, MA', code: 'boston-ma', type: 'metro' },
  { name: 'Nashville, TN', code: 'nashville-tn', type: 'metro' },
  { name: 'Detroit, MI', code: 'detroit-mi', type: 'metro' },
  { name: 'Portland, OR', code: 'portland-or', type: 'metro' },
  { name: 'Las Vegas, NV', code: 'las-vegas-nv', type: 'metro' },
  { name: 'Memphis, TN', code: 'memphis-tn', type: 'metro' },
  { name: 'Louisville, KY', code: 'louisville-ky', type: 'metro' },
  { name: 'Milwaukee, WI', code: 'milwaukee-wi', type: 'metro' },
  { name: 'Atlanta, GA', code: 'atlanta-ga', type: 'metro' },
  { name: 'Miami, FL', code: 'miami-fl', type: 'metro' },
  { name: 'Tampa, FL', code: 'tampa-fl', type: 'metro' },
  { name: 'Orlando, FL', code: 'orlando-fl', type: 'metro' },
  { name: 'Naples, FL', code: 'naples-fl', type: 'metro' },
  { name: 'Fort Myers, FL', code: 'fort-myers-fl', type: 'metro' },
  { name: 'Cape Coral, FL', code: 'cape-coral-fl', type: 'metro' },
  { name: 'Sarasota, FL', code: 'sarasota-fl', type: 'metro' },
  { name: 'Bradenton, FL', code: 'bradenton-fl', type: 'metro' },
];
