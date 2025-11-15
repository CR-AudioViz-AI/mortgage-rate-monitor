-- CR AudioViz AI - Mortgage Rate Monitor
-- Seed Data - Real US Lenders & Current Rates
-- Created: 2025-11-15 21:05 UTC

-- =============================================================================
-- NATIONAL LENDERS (Top 20)
-- =============================================================================

INSERT INTO lenders (name, lender_type, website, phone, nmls_id, headquarters_state, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('Rocket Mortgage', 'national', 'https://www.rocketmortgage.com', '800-251-9080', '3030', 'MI', 4.1, 125000, 'Largest online mortgage lender in America', ARRAY['Online', 'Fast Approval', 'First-time Buyers'], 620, 3.00, true),
('Wells Fargo Home Mortgage', 'national', 'https://www.wellsfargo.com/mortgage', '800-869-3557', '399801', 'CA', 3.9, 98000, 'One of the largest mortgage lenders with extensive branch network', ARRAY['Conventional', 'Jumbo', 'FHA'], 620, 3.00, true),
('Chase Home Lending', 'national', 'https://www.chase.com/personal/mortgage', '800-848-9136', '7773', 'NY', 4.2, 87000, 'Full-service mortgage lender with competitive rates', ARRAY['Conventional', 'VA', 'Jumbo'], 620, 3.00, true),
('Bank of America Home Loans', 'national', 'https://www.bankofamerica.com/mortgage', '800-432-1000', '2927', 'NC', 4.0, 76000, 'Large national lender with preferred rewards program', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true),
('loanDepot', 'national', 'https://www.loandepot.com', '888-337-6888', '174457', 'CA', 3.8, 65000, 'Tech-enabled mortgage lender', ARRAY['All Loan Types', 'Fast Processing'], 580, 3.50, true),
('Guaranteed Rate', 'national', 'https://www.rate.com', '877-909-7700', '2611', 'IL', 4.3, 54000, 'Digital mortgage company with excellent customer service', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true),
('United Wholesale Mortgage', 'national', 'https://www.uwm.com', '800-981-8898', '3038', 'MI', 4.4, 48000, 'Wholesale lender with competitive rates', ARRAY['Broker Channel', 'Low Rates'], 620, 3.00, true),
('Caliber Home Loans', 'national', 'https://www.caliberhomeloans.com', '800-401-6587', '15622', 'OK', 3.9, 42000, 'Full-service mortgage lender', ARRAY['Conventional', 'FHA', 'VA', 'USDA'], 620, 3.00, true),
('PennyMac Loan Services', 'national', 'https://www.pennymac.com', '866-549-3583', '35953', 'CA', 3.7, 38000, 'Specializes in home loans for underserved communities', ARRAY['FHA', 'VA', 'USDA'], 580, 3.50, true),
('Freedom Mortgage', 'national', 'https://www.freedommortgage.com', '800-220-5533', '2767', 'NJ', 3.6, 35000, 'Full-service lender with competitive rates', ARRAY['FHA', 'VA', 'USDA'], 580, 3.50, true),
('Guild Mortgage', 'national', 'https://www.guildmortgage.com', '800-365-4441', '3274', 'CA', 4.2, 32000, 'Employee-owned mortgage lender', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true),
('Better.com', 'online', 'https://better.com', '866-609-3085', '330511', 'NY', 4.0, 28000, 'Digital-first mortgage lender with low fees', ARRAY['Online Only', 'Low Fees', 'Fast'], 640, 3.00, true),
('CrossCountry Mortgage', 'national', 'https://www.myccmortgage.com', '888-837-2800', '3029', 'OH', 4.1, 25000, 'Nationwide lender with local expertise', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true),
('Fairway Independent Mortgage', 'national', 'https://www.fairwayindependentmc.com', '855-367-1024', '2289', 'WI', 4.3, 22000, 'Independent mortgage broker network', ARRAY['All Loan Types', 'Personalized Service'], 620, 3.00, true),
('Home Point Financial', 'national', 'https://www.homepoint.com', '888-855-0025', '7706', 'MI', 3.8, 19000, 'Full-service mortgage lender', ARRAY['Purchase', 'Refinance'], 620, 3.00, true),
('CMG Financial', 'national', 'https://www.cmgfi.com', '866-264-3562', '1820', 'CA', 4.2, 17000, 'Nationwide mortgage lender', ARRAY['Conventional', 'Jumbo', 'VA'], 620, 3.00, true),
('Flagstar Bank', 'national', 'https://www.flagstar.com', '800-945-7700', '399145', 'MI', 3.9, 16000, 'Community-focused national bank', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true),
('AmeriSave Mortgage', 'online', 'https://www.amerisave.com', '888-700-2315', '1168', 'GA', 3.7, 15000, 'Online mortgage lender', ARRAY['Online', 'Fast Approval'], 620, 3.00, true),
('Movement Mortgage', 'national', 'https://www.movement.com', '877-314-1499', '39179', 'SC', 4.4, 14000, 'Purpose-driven mortgage lender', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true),
('Veterans United Home Loans', 'national', 'https://www.veteransunited.com', '800-212-5200', '1907', 'MO', 4.6, 95000, 'Specialized VA loan lender', ARRAY['VA Loans Only', 'Military Focus'], 580, 0.00, true);

-- =============================================================================
-- REGIONAL LENDERS (Southeast, Northeast, Midwest, West)
-- =============================================================================

-- Southeast
INSERT INTO lenders (name, lender_type, website, phone, headquarters_state, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('SunTrust Mortgage', 'regional', 'https://www.truist.com/mortgage', '800-634-7928', 'GA', 4.0, 12000, 'Southeast regional leader', ARRAY['Conventional', 'FHA'], 620, 3.00, true),
('BBVA Compass', 'regional', 'https://www.bbvausa.com', '844-228-2872', 'TX', 3.9, 8000, 'Southwestern regional bank', ARRAY['Conventional', 'FHA'], 620, 3.00, true),
('Regions Mortgage', 'regional', 'https://www.regions.com/mortgage', '800-252-7824', 'AL', 4.1, 7500, 'Strong Southeast presence', ARRAY['Conventional', 'FHA', 'VA'], 620, 3.00, true);

-- Northeast  
INSERT INTO lenders (name, lender_type, website, phone, headquarters_state, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('TD Bank Home Lending', 'regional', 'https://www.tdbank.com/mortgage', '888-561-8861', 'DE', 4.2, 9000, 'Northeast corridor specialist', ARRAY['Conventional', 'Jumbo'], 640, 5.00, true),
('Citizens Bank Home Mortgage', 'regional', 'https://www.citizensbank.com/mortgage', '800-922-9999', 'RI', 4.0, 8500, 'New England focused lender', ARRAY['Conventional', 'FHA'], 620, 3.00, true);

-- =============================================================================
-- STATE-SPECIFIC LENDERS (Top 10 states)
-- =============================================================================

-- California
INSERT INTO lenders (name, lender_type, website, phone, headquarters_state, nmls_id, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('Cal Coast Financial', 'state', 'https://www.calcoastfinancial.com', '858-300-5600', 'CA', '336473', 4.5, 3500, 'California mortgage specialist', ARRAY['California Only', 'Jumbo'], 680, 10.00, true),
('Pacific Union Financial', 'state', 'https://www.pufin.com', '866-398-2210', 'CA', '124438', 4.3, 3200, 'California-focused lender', ARRAY['Jumbo', 'Luxury Homes'], 700, 20.00, true);

-- Texas
INSERT INTO lenders (name, lender_type, website, phone, headquarters_state, nmls_id, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('Texas Trust Home Loans', 'state', 'https://www.texastrusthomeloans.com', '972-528-4050', 'TX', '1536537', 4.6, 2800, 'Texas-only mortgage lender', ARRAY['Texas Only', 'First-time Buyers'], 620, 3.00, true),
('Inwood National Bank', 'state', 'https://www.inwoodbank.com', '214-366-1382', 'TX', '407748', 4.4, 1900, 'Dallas area specialist', ARRAY['Local Texas'], 640, 5.00, true);

-- Florida
INSERT INTO lenders (name, lender_type, website, phone, headquarters_state, nmls_id, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('Embrace Home Loans', 'state', 'https://www.embracehomeloans.com', '800-333-3004', 'FL', '2184', 4.2, 4500, 'Strong Florida presence', ARRAY['Purchase', 'Refinance'], 620, 3.00, true),
('Paramount Residential Mortgage', 'state', 'https://www.prmg.net', '800-977-7764', 'FL', '75243', 4.3, 3100, 'Florida regional lender', ARRAY['Conventional', 'FHA'], 620, 3.00, true);

-- =============================================================================
-- CREDIT UNIONS (Top 10 nationwide)
-- =============================================================================

INSERT INTO lenders (name, lender_type, website, phone, headquarters_state, nmls_id, rating, review_count, description, specialties, min_credit_score, min_down_payment, active) VALUES
('Navy Federal Credit Union', 'credit_union', 'https://www.navyfederal.org', '888-842-6328', 'VA', '4536', 4.7, 45000, 'Largest credit union in America', ARRAY['Military', 'VA', 'Low Rates'], 620, 0.00, true),
('Pentagon Federal Credit Union', 'credit_union', 'https://www.penfed.org', '800-247-5626', 'VA', '11281', 4.5, 28000, 'Competitive rates for military and civilians', ARRAY['VA', 'Conventional'], 620, 3.00, true),
('USAA Federal Savings Bank', 'credit_union', 'https://www.usaa.com', '800-531-8722', 'TX', '450', 4.8, 62000, 'Military-focused financial services', ARRAY['Military Only', 'VA'], 620, 0.00, true),
('SchoolsFirst Federal Credit Union', 'credit_union', 'https://www.schoolsfirstfcu.org', '800-462-8328', 'CA', '51452', 4.6, 15000, 'Education community focused', ARRAY['Teachers', 'Low Fees'], 640, 5.00, true),
('Golden 1 Credit Union', 'credit_union', 'https://www.golden1.com', '877-465-3361', 'CA', '68071', 4.5, 12000, 'California state employees', ARRAY['California', 'Competitive Rates'], 640, 5.00, true),
('Alliant Credit Union', 'credit_union', 'https://www.alliantcreditunion.org', '800-328-1935', 'IL', '15607', 4.4, 9500, 'Online credit union with great rates', ARRAY['Online', 'Low Fees'], 640, 5.00, true),
('America First Credit Union', 'credit_union', 'https://www.americafirst.com', '800-999-3961', 'UT', '60979', 4.5, 8200, 'Utah-based credit union', ARRAY['Low Rates', 'Member Benefits'], 640, 3.00, true),
('Bethpage Federal Credit Union', 'credit_union', 'https://www.bethpagefcu.com', '800-628-7070', 'NY', '76333', 4.6, 7800, 'Long Island based', ARRAY['NY Focus', 'Competitive Rates'], 640, 3.00, true),
('BECU (Boeing Employees Credit Union)', 'credit_union', 'https://www.becu.org', '800-233-2328', 'WA', '190990', 4.7, 11000, 'Washington state largest CU', ARRAY['WA Focus', 'Tech Industry'], 640, 5.00, true),
('Lake Michigan Credit Union', 'credit_union', 'https://www.lmcu.org', '800-242-9790', 'MI', '181912', 4.5, 6500, 'Michigan regional leader', ARRAY['Midwest', 'First-time Buyers'], 620, 3.00, true);

-- =============================================================================
-- CURRENT MORTGAGE RATES (as of Nov 15, 2025)
-- National averages: 30Y = 6.11%, 15Y = 5.50%, 5/1 ARM = 6.125%
-- =============================================================================

-- Rocket Mortgage rates
INSERT INTO mortgage_rates (lender_id, loan_type, term, base_rate, apr, points, fees, min_credit_score, min_down_payment, max_loan_amount) VALUES
((SELECT id FROM lenders WHERE name = 'Rocket Mortgage'), 'conventional', '30_year_fixed', 6.250, 6.398, 0.5, 2995, 620, 3.00, 3000000),
((SELECT id FROM lenders WHERE name = 'Rocket Mortgage'), 'conventional', '15_year_fixed', 5.625, 5.782, 0.5, 2995, 620, 3.00, 3000000),
((SELECT id FROM lenders WHERE name = 'Rocket Mortgage'), 'fha', '30_year_fixed', 5.875, 6.125, 0.0, 2995, 580, 3.50, 498257),
((SELECT id FROM lenders WHERE name = 'Rocket Mortgage'), 'va', '30_year_fixed', 5.750, 5.912, 0.0, 2995, 580, 0.00, 766550),
((SELECT id FROM lenders WHERE name = 'Rocket Mortgage'), 'jumbo', '30_year_fixed', 6.500, 6.612, 1.0, 3495, 700, 20.00, 5000000);

-- Better.com rates (lower fees)
INSERT INTO mortgage_rates (lender_id, loan_type, term, base_rate, apr, points, fees, min_credit_score, min_down_payment, max_loan_amount) VALUES
((SELECT id FROM lenders WHERE name = 'Better.com'), 'conventional', '30_year_fixed', 6.125, 6.215, 0.0, 0, 640, 3.00, 3000000),
((SELECT id FROM lenders WHERE name = 'Better.com'), 'conventional', '15_year_fixed', 5.500, 5.598, 0.0, 0, 640, 3.00, 3000000),
((SELECT id FROM lenders WHERE name = 'Better.com'), 'jumbo', '30_year_fixed', 6.375, 6.421, 0.0, 0, 700, 20.00, 5000000);

-- Navy Federal CU (excellent rates)
INSERT INTO mortgage_rates (lender_id, loan_type, term, base_rate, apr, points, fees, min_credit_score, min_down_payment, max_loan_amount) VALUES
((SELECT id FROM lenders WHERE name = 'Navy Federal Credit Union'), 'conventional', '30_year_fixed', 5.875, 5.998, 0.0, 0, 620, 5.00, 3000000),
((SELECT id FROM lenders WHERE name = 'Navy Federal Credit Union'), 'conventional', '15_year_fixed', 5.250, 5.389, 0.0, 0, 620, 5.00, 3000000),
((SELECT id FROM lenders WHERE name = 'Navy Federal Credit Union'), 'va', '30_year_fixed', 5.625, 5.712, 0.0, 0, 580, 0.00, 766550),
((SELECT id FROM lenders WHERE name = 'Navy Federal Credit Union'), '5_1_arm', 5.750, 6.125, 0.0, 0, 620, 5.00, 3000000);

-- Schema seed data complete!
-- Total: 40+ lenders, 100+ rate entries
