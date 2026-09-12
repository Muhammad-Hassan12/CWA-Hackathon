-- ============================================================================
-- Nigraan (نگران) — Curated Seed Data for Karachi (Phase 0)
-- Sources: SSWMB, KMC, KW&SB, K-Electric, NADRA, Sindh Gov Commissioner Office
-- ============================================================================

-- Clean existing seed data if re-running
truncate table authority_mandates, tariff_rules, procedures, required_documents, authorities, roadmap_steps cascade;

-- ============================================================================
-- 1. AUTHORITY MANDATES
-- ============================================================================

-- GARBAGE (SSWMB / Local Town Councils / Cantonment)
insert into authority_mandates (issue_type, area, authority_name, contact_info, complaint_template) values
('garbage', 'Korangi', 'Sindh Solid Waste Management Board (SSWMB) - District Korangi', 'Helpline: 1128 | WhatsApp: +92-300-0501128 | Email: complaints@sswmb.gos.pk', 'To The Managing Director, SSWMB Korangi Zone: Excessive unattended garbage and open dumping reported at {location} in Korangi. Overflowing waste is obstructing pedestrians and posing health hazards. Please dispatch municipal compaction and sanitation team for immediate clearance.'),
('garbage', 'Clifton', 'Cantonment Board Clifton (CBC) Sanitation Branch', 'Helpline: 1072 | UAN: +92-21-35847970 | Web: cbc.gov.pk', 'To The Chief Executive Officer, Cantonment Board Clifton: Solid municipal waste accumulation identified at {location}, Clifton. Regular collection cycle missed. Requesting sanitation inspector review and immediate dispatch of refuse collection vehicles.'),
('garbage', 'Saddar', 'Sindh Solid Waste Management Board (SSWMB) - District South', 'Helpline: 1128 | Phone: +92-21-99207567', 'To Executive Director (Sanitation), SSWMB South: Uncollected commercial and residential waste accumulation along {location}, Saddar zone. Urgent lifting and lime-washing required to avert public health hazards.'),
('garbage', 'Gulshan-e-Iqbal', 'Sindh Solid Waste Management Board (SSWMB) - District East', 'Helpline: 1128 | WhatsApp: +92-300-0501128', 'To Incharge Sanitation, SSWMB East Zone: Solid waste heap piled up at {location} in Gulshan-e-Iqbal. Requesting priority refuse removal and secondary collection bin placement.'),
('garbage', 'DHA', 'Defence Housing Authority (DHA) Karachi Public Health Engineering', 'Helpline: 1092 | Phone: +92-21-99266801', 'To Director Public Health & Sanitation, DHA Karachi: Litter and solid waste accumulation noted at {location}. Kindly direct the zone sanitary contractor for urgent clearance.'),
('garbage', 'North Nazimabad', 'Sindh Solid Waste Management Board (SSWMB) - District Central', 'Helpline: 1128 | Phone: +92-21-99333722', 'To District Officer (Central), SSWMB: Severe garbage spillover onto public thoroughfare at {location}, North Nazimabad. Urgent disposal requested.');

-- POTHOLE & ROAD CRATER (KMC / District Municipal Corporations / Cantonment)
insert into authority_mandates (issue_type, area, authority_name, contact_info, complaint_template) values
('pothole', 'Korangi', 'Karachi Metropolitan Corporation (KMC) Engineering & Road Works', 'Helpline: 1334 | Phone: +92-21-99215000', 'To Chief Engineer Road Maintenance, KMC: Severe road subsidence/potholes on primary artery at {location}, Korangi. Posing imminent accident risk to motorists and cargo logistics. Immediate asphalt patchwork requested.'),
('pothole', 'Clifton', 'Cantonment Board Clifton (CBC) Civil Engineering Dept', 'Helpline: 1072 | Phone: +92-21-35847970', 'To Executive Engineer (B&R), CBC: Surface degradation and deep road craters observed at {location}, Clifton. Immediate resurfacing and road safety leveling required.'),
('pothole', 'Saddar', 'KMC Department of Municipal Services - South Division', 'Helpline: 1334 | Email: municipal@kmc.gos.pk', 'To Superintending Engineer (Works), KMC: Critical road depression causing gridlock and vehicular damage at {location}, Saddar. Urgent asphalt leveling required.'),
('pothole', 'Gulshan-e-Iqbal', 'Town Municipal Corporation (TMC) Gulshan-e-Iqbal Infrastructure', 'Phone: +92-21-99244078', 'To Municipal Commissioner, TMC Gulshan: Deep asphalt erosion and exposed aggregate at {location}. Immediate patchwork and warning signage needed.'),
('pothole', 'DHA', 'DHA Karachi Maintenance & Works Directorate', 'Helpline: 1092 | Phone: +92-21-99266801', 'To Director Works, DHA: Dangerous road pothole requiring bitumen patching at {location}. Immediate repair required to prevent suspension damage and collisions.'),
('pothole', 'North Nazimabad', 'TMC North Nazimabad Civil Works Division', 'Helpline: 1334 | Phone: +92-21-99260105', 'To Director Works & Services, TMC North Nazimabad: Hazardous pothole on road strip at {location}. Urgent road repair requested.');

-- WATER SUPPLY (KW&SB / Cantonment)
insert into authority_mandates (issue_type, area, authority_name, contact_info, complaint_template) values
('water', 'Korangi', 'Karachi Water & Sewerage Corporation (KWSC) - Korangi Division', 'Helpline: 1339 | WhatsApp: +92-317-0241339', 'To Executive Engineer (Water Supply), KWSC Korangi: Zero pipeline water pressure and complete supply outage for {duration} in {location}, Korangi. Citizens facing acute scarcity. Please restore scheduled bulk water delivery.'),
('water', 'Clifton', 'Cantonment Board Clifton (CBC) Water Branch / KWSC Bulk', 'Helpline: 1072 | KWSC: 1339', 'To Water Supply Officer, CBC: Unscheduled water disruption and dry lines in {location}, Clifton. Immediate line pressure check and tanker relief quota dispatch requested.'),
('water', 'Saddar', 'KWSC - District South Operations', 'Helpline: 1339 | Phone: +92-21-99201550', 'To Superintending Engineer (South), KWSC: Continued line breakdown and saline contamination in domestic supply line at {location}, Saddar. Urgent valve restoration needed.'),
('water', 'Gulshan-e-Iqbal', 'KWSC - District East Distribution', 'Helpline: 1339 | Phone: +92-21-99244090', 'To XEN Water, KWSC East: Prolonged failure of potable water line schedule at {location}, Gulshan-e-Iqbal. Water distribution valve check required.'),
('water', 'DHA', 'CBC / DHA Water Management Directorate', 'CBC: 1072 | DHA: 1092', 'To Water Director, CBC/DHA: Prolonged water line failure and non-arrival of scheduled distribution at {location}. Urgent valve check and pressure restoration required.'),
('water', 'North Nazimabad', 'KWSC - District Central Division', 'Helpline: 1339 | Phone: +92-21-99260100', 'To XEN Water Central, KWSC: Severe potable water shortage due to line stoppage at {location}, North Nazimabad. Urgent supply reinstatement requested.');

-- SEWAGE (KW&SB Drainage)
insert into authority_mandates (issue_type, area, authority_name, contact_info, complaint_template) values
('sewage', 'Korangi', 'KWSC Sewerage & Drainage Directorate - Korangi', 'Helpline: 1339 | Phone: +92-21-99215000', 'To Chief Engineer (Sewerage), KWSC Korangi: Manhole overflow and contaminated effluent flooding road at {location}, Korangi. Health emergency risk. Jetting / suction machine required immediately.'),
('sewage', 'Clifton', 'CBC Sewerage Maintenance Division', 'Helpline: 1072 | Phone: +92-21-35847970', 'To Executive Officer Sewerage, CBC: Overflowing sewage manholes and gutter blockage in lane at {location}, Clifton. Immediate suction tanker deployment required.'),
('sewage', 'Saddar', 'KWSC Sewerage Division South', 'Helpline: 1339 | Phone: +92-21-99201550', 'To Superintending Engineer (Sewerage), KWSC: Blackwater sewage backup surfacing into street at {location}, Saddar. Urgent unchoking and de-silting needed.'),
('sewage', 'Gulshan-e-Iqbal', 'KWSC Sewerage Division East', 'Helpline: 1339', 'To XEN Sewerage East, KWSC: Main sewer line choke causing gutter overflow at {location}, Gulshan-e-Iqbal. Urgent de-silting and suction required.'),
('sewage', 'DHA', 'DHA Maintenance Sewerage & Stormwater Branch', 'Helpline: 1092', 'To Directorate of Maintenance, DHA: Gutter blockage and contaminated standing water reported at {location}. Immediate mechanical suction requested.'),
('sewage', 'North Nazimabad', 'KWSC Sewerage Division Central', 'Helpline: 1339', 'To XEN Sewerage Central, KWSC: Overflowing sewage line threatening nearby residential houses at {location}, North Nazimabad. Please dispatch rodding machine.');

-- ELECTRICITY (K-Electric)
insert into authority_mandates (issue_type, area, authority_name, contact_info, complaint_template) values
('electricity', 'Korangi', 'K-Electric Integrated Customer Experience Center - Korangi', 'Helpline: 118 | WhatsApp: +92-348-0000118 | SMS: 8119', 'To Regional Head, K-Electric Korangi IBC: Unscheduled prolonged electrical blackout / transformer fault reported at {location}, Korangi. Live electrical hazards suspected. Dispatch field technician for prompt rectification.'),
('electricity', 'Clifton', 'K-Electric IBC - Clifton & Defence', 'Helpline: 118 | WhatsApp: +92-348-0000118', 'To IBC Manager, K-Electric Clifton: Power outage / local PMT trip observed at {location}, Clifton. Please inspect local sub-station feeder and reinstate supply.'),
('electricity', 'Saddar', 'K-Electric IBC - Saddar Town', 'Helpline: 118 | Phone: +92-21-99071000', 'To IBC Head, K-Electric Saddar: Low voltage fluctuation and transformer spark at {location}, Saddar. Threatening household appliances and posing fire hazards.'),
('electricity', 'Gulshan-e-Iqbal', 'K-Electric IBC - Gulshan', 'Helpline: 118 | WhatsApp: +92-348-0000118', 'To IBC Manager, K-Electric Gulshan: Feeder tripping and prolonged outage without prior load-shedding notice at {location}, Gulshan-e-Iqbal. Urgent restoration requested.'),
('electricity', 'DHA', 'K-Electric IBC - Defence', 'Helpline: 118 | WhatsApp: +92-348-0000118', 'To Resident Engineer, K-Electric Defence: Electrical line fault / cable blast reported at {location}, DHA. Immediate technical intervention requested.'),
('electricity', 'North Nazimabad', 'K-Electric IBC - North Nazimabad', 'Helpline: 118 | SMS: 8119', 'To IBC Incharge, K-Electric North Nazimabad: Local transformer malfunction causing full blackout at {location}, North Nazimabad. Rapid response team requested.');

-- STREETLIGHT (KMC / Town Municipal Corporations / CBC)
insert into authority_mandates (issue_type, area, authority_name, contact_info, complaint_template) values
('streetlight', 'Korangi', 'TMC Korangi Street Lighting Department', 'Helpline: 1334', 'To Incharge Electrical, TMC Korangi: Multiple streetlights non-operational along {location}, Korangi. Street engulfed in darkness causing pedestrian safety concerns and street crimes. Urgent bulb/line replacement requested.'),
('streetlight', 'Clifton', 'CBC Electrical & Streetlighting Section', 'Helpline: 1072 | Phone: +92-21-35847970', 'To Head of Electrical Branch, CBC: Inoperative public streetlamps on avenue at {location}, Clifton. Immediate pole ballast and LED bulb replacement required.'),
('streetlight', 'Saddar', 'KMC Electrical Engineering Department', 'Helpline: 1334', 'To Superintending Engineer (Electrical), KMC: Streetlight failure along dense thoroughfare {location}, Saddar. Posing severe visibility danger. Urgent bulb/cable servicing requested.'),
('streetlight', 'Gulshan-e-Iqbal', 'TMC Gulshan-e-Iqbal Street Lighting Cell', 'Helpline: 1334', 'To Municipal Officer (Services), TMC Gulshan: Row of streetlights dead on sector road {location}, Gulshan-e-Iqbal. Urgent repair requested.'),
('streetlight', 'DHA', 'DHA Electrical & Illumination Branch', 'Helpline: 1092', 'To Electrical Branch Incharge, DHA: Streetlights out of order at {location}. Immediate maintenance crew requested.'),
('streetlight', 'North Nazimabad', 'TMC North Nazimabad Electrical Branch', 'Helpline: 1334', 'To Incharge Streetlights, TMC North Nazimabad: Non-functional road illumination poles at {location}, North Nazimabad. Urgent maintenance needed.');


-- ============================================================================
-- 2. TARIFF RULES (K-Electric Residential A-1 Tariff & SSGC Domestic)
-- Sourced from NEPRA Approved Tariff Schedule & published K-Electric rates
-- ============================================================================

-- K-Electric Residential (Protected category: <= 200 units, consecutive 6 months)
insert into tariff_rules (provider, tariff_category, slab_from, slab_to, rate_per_unit, fixed_charge, tax_formula, effective_date) values
('K-Electric', 'Residential-Protected', 1, 100, 7.74, 0.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 0%', '2024-07-01'),
('K-Electric', 'Residential-Protected', 101, 200, 10.06, 0.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 0%', '2024-07-01');

-- K-Electric Residential (Unprotected category: standard domestic consumption)
insert into tariff_rules (provider, tariff_category, slab_from, slab_to, rate_per_unit, fixed_charge, tax_formula, effective_date) values
('K-Electric', 'Residential-Unprotected', 1, 100, 16.48, 0.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 0%', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 101, 200, 22.95, 0.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 0%', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 201, 300, 27.14, 200.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 18% on amount exceeding exemption threshold', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 301, 400, 32.03, 400.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 18%', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 401, 500, 35.24, 600.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 18%', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 501, 600, 36.66, 800.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 18%', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 601, 700, 37.80, 1000.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 18%', '2024-07-01'),
('K-Electric', 'Residential-Unprotected', 701, 999999, 42.72, 1000.0, 'ED: 1.5% | TV Fee: Rs 35 | GST: 18%', '2024-07-01');

-- SSGC Domestic Gas (Sui Southern Gas Company)
insert into tariff_rules (provider, tariff_category, slab_from, slab_to, rate_per_unit, fixed_charge, tax_formula, effective_date) values
('SSGC', 'Domestic-Protected', 0.0, 0.5, 121.0, 100.0, 'Meter Rent: Rs 40 | GST: 18%', '2024-02-01'),
('SSGC', 'Domestic-Protected', 0.5, 1.0, 300.0, 100.0, 'Meter Rent: Rs 40 | GST: 18%', '2024-02-01'),
('SSGC', 'Domestic-Unprotected', 0.0, 0.5, 200.0, 1000.0, 'Meter Rent: Rs 40 | GST: 18%', '2024-02-01'),
('SSGC', 'Domestic-Unprotected', 0.5, 1.0, 400.0, 1000.0, 'Meter Rent: Rs 40 | GST: 18%', '2024-02-01'),
('SSGC', 'Domestic-Unprotected', 1.0, 2.0, 800.0, 1000.0, 'Meter Rent: Rs 40 | GST: 18%', '2024-02-01'),
('SSGC', 'Domestic-Unprotected', 2.0, 3.0, 1650.0, 1000.0, 'Meter Rent: Rs 40 | GST: 18%', '2024-02-01');


-- ============================================================================
-- 3. PROCEDURES, DOCUMENTS, AUTHORITIES & ROADMAP STEPS
-- Sourced with real URLs & verified dates
-- ============================================================================

-- Procedure 1: CNIC Renewal (NADRA)
with proc1 as (
  insert into procedures (name, category, description, last_verified_at, source_url) values
  ('CNIC Renewal', 'Identity & Civil Status', 'Official standard and urgent renewal of Computerized National Identity Cards (CNIC) / Smart National Identity Cards (SNIC) for Pakistani citizens residing in Karachi.', '2026-01-15', 'https://www.nadra.gov.pk/identity/identity-cnic/')
  returning id
)
, docs1 as (
  insert into required_documents (procedure_id, document_name, notes, is_mandatory)
  select id, 'Original Expired CNIC / SNIC', 'Must be handed over for punching/cancellation upon collection of new card', true from proc1
  union all
  select id, 'Photocopy of Parent or Spouse CNIC', 'Used for computerized biometric cross-verification with NADRA database', true from proc1
  union all
  select id, 'Proof of Address Update (Utility bill or Registered Tenancy / Lease Agreement)', 'Only mandatory if your permanent or current residential address is being updated', false from proc1
  union all
  select id, 'Marriage Certificate / Nikkahnama (for married females updating status)', 'Mandatory if updating marital status from single to married', false from proc1
)
, auth1 as (
  insert into authorities (procedure_id, office_name, address, hours_text, contact_info, lat, lng)
  select id, 'NADRA Mega Center DHA Phase 4', 'Main Korangi Road, Phase 4, Defence Housing Authority, Karachi', 'Open 24 Hours / 7 Days a week', 'Helpline: 1777 (mobile) | +92-51-111-786-100', 24.8387, 67.0673 from proc1
  union all
  select id, 'NADRA Mega Center North Nazimabad', 'Block L, Near Sakhi Hassan Chowrangi, North Nazimabad, Karachi', 'Open 24 Hours / 7 Days a week', 'Helpline: 1777', 24.9452, 67.0544 from proc1
  union all
  select id, 'NADRA Mega Center Siemens Chowrangi', 'B-2, SITE Industrial Area, Near Siemens Chowrangi, Karachi', 'Open 24 Hours / 7 Days a week', 'Helpline: 1777', 24.8988, 66.9972 from proc1
)
insert into roadmap_steps (procedure_id, step_order, description, requires_witness, estimated_duration)
select id, 1, 'Token Issuance: Present original expired CNIC at reception desk and obtain an electronic queue token according to selected priority tier (Normal: Rs 750, Urgent: Rs 1500, Executive: Rs 2500).', false, '10-15 mins' from proc1
union all
select id, 2, 'Biometric Acquisition: Proceed to biometric counter for live digital photograph capture, 10-fingerprint scanning, and dual iris scan.', false, '10 mins' from proc1
union all
select id, 3, 'Data Verification & Review: Move to Registration Officer counter. Confirm all personal particulars (name, parental info, address). Any corrections must be submitted here.', false, '15 mins' from proc1
union all
select id, 4, 'Draft Form Review: Receive printed identity draft summary. Scrutinize spellings and address details, affix signature or thumb impression.', false, '5 mins' from proc1
union all
select id, 5, 'Tracking Voucher Issuance: Receive stamped payment and tracking receipt containing your unique 11-digit NADRA tracking code and estimated collection date.', false, '2 mins' from proc1;


-- Procedure 2: Sindh Domicile & PRC (Form P-1)
with proc2 as (
  insert into procedures (name, category, description, last_verified_at, source_url) values
  ('Sindh Domicile & PRC Certificate', 'Citizenship & Residence', 'Statutory issuance of Permanent Resident Certificate (PRC Form P-1) and Domicile Certificate by the Government of Sindh District Administration for admissions, exams, and government employment.', '2026-02-01', 'https://commissionerkarachi.gos.pk/domicile-services')
  returning id
)
, docs2 as (
  insert into required_documents (procedure_id, document_name, notes, is_mandatory)
  select id, 'Original CNIC / Form-B of Applicant + 2 Attested Copies', 'Attested by Grade 17+ Government Gazette Officer', true from proc2
  union all
  select id, 'Father / Guardian CNIC + Sindh Domicile & PRC Copy', 'Mandatory to substantiate domicile by descent', true from proc2
  union all
  select id, 'Five (5) Passport Size Photographs with White Background', 'Two attested on front, two on reverse', true from proc2
  union all
  select id, 'Educational Certificates (Matriculation Certificate / Marks Sheet)', 'Showing school attended in Karachi to establish uninterrupted physical residence', true from proc2
  union all
  select id, 'Recent Electricity or Sui Gas Utility Bill of Karachi Residence', 'Bill from last 3 months bearing the residential address claimed in application', true from proc2
  union all
  select id, 'Attested Stamp Paper Affidavit (Rs. 100/50)', 'Declaring applicant does not possess domicile of any other district/province, signed before Oath Commissioner', true from proc2
)
, auth2 as (
  insert into authorities (procedure_id, office_name, address, hours_text, contact_info, lat, lng)
  select id, 'Deputy Commissioner (DC) Office South', '4th Floor, Sindh Secretariat Building No. 2, Kamal Ataturk Road, Karachi', 'Monday - Friday, 09:00 AM - 04:00 PM', 'Phone: +92-21-99208000 | Email: dc.south@sindh.gov.pk', 24.8569, 67.0182 from proc2
  union all
  select id, 'Deputy Commissioner (DC) Office Korangi', 'Sector 31-D, Near Bilal Chowrangi, Korangi Industrial Area, Karachi', 'Monday - Friday, 09:00 AM - 04:00 PM', 'Phone: +92-21-99333900 | Email: dc.korangi@sindh.gov.pk', 24.8415, 67.1350 from proc2
  union all
  select id, 'Deputy Commissioner (DC) Office East', 'Block 14, Gulshan-e-Iqbal, Near Civic Center, Karachi', 'Monday - Friday, 09:00 AM - 04:00 PM', 'Phone: +92-21-99230555', 24.9080, 67.0750 from proc2
)
insert into roadmap_steps (procedure_id, step_order, description, requires_witness, estimated_duration)
select id, 1, 'Affidavit Attestation & File Preparation: Purchase official Domicile file docket and print statutory affidavit on Rs. 100 legal stamp paper. Sign in presence of Oath Commissioner.', false, '30-45 mins' from proc2
union all
select id, 2, 'Assistant Commissioner (AC) Endorsement: Visit the Assistant Commissioner sub-division office corresponding to your residence for preliminary document verification and signature on Form P-1.', false, '1-2 business days' from proc2
union all
select id, 3, 'DC Citizen Facilitation Counter Submission: Submit verified file with fee payment challan (National Bank of Pakistan official fee Rs 200) at Deputy Commissioner Citizen Service Window. Biometric and webcam snapshot registered.', false, '30 mins' from proc2
union all
select id, 4, 'Police Verification & Approval: Administrative background check and DC final seal signature.', false, '3-5 business days' from proc2
union all
select id, 5, 'Collection: Collect original sealed green Domicile Certificate and PRC Form P-1 upon presenting stamped submission voucher.', false, '5 mins' from proc2;


-- Procedure 3: Driving License Renewal (Motorcar / Motorcycle)
with proc3 as (
  insert into procedures (name, category, description, last_verified_at, source_url) values
  ('Driving License Renewal (Sindh Police)', 'Transport & Licensing', 'Official statutory renewal process for non-commercial (Motorcycle / Motorcar M/Car) computerized driving licenses issued by the Sindh Police Driving License Branch.', '2026-02-10', 'https://dls.gos.pk/services/renewal')
  returning id
)
, docs3 as (
  insert into required_documents (procedure_id, document_name, notes, is_mandatory)
  select id, 'Original Expired Driving License', 'Must be surrendered or physically inspected by licensing authority', true from proc3
  union all
  select id, 'Valid Original CNIC + 2 Attested Photocopies', 'Must show Karachi residential address or Sindh address', true from proc3
  union all
  select id, 'Medical Fitness Certificate (Form B)', 'Mandatory for drivers aged 50+ or commercial endorsement; issued by on-site Sindh Police medical doctor', true from proc3
  union all
  select id, 'Three (3) Passport Size Photographs', 'Passport size with light blue or white background', true from proc3
)
, auth3 as (
  insert into authorities (procedure_id, office_name, address, hours_text, contact_info, lat, lng)
  select id, 'Driving License Branch Clifton', 'Khayaban-e-Roomi, Block 8, Clifton, Near Teen Talwar, Karachi', 'Monday - Saturday: 08:30 AM - 05:00 PM (Night shift until 11:00 PM)', 'Helpline: +92-21-99250522 | Web: dls.gos.pk', 24.8290, 67.0345 from proc3
  union all
  select id, 'Driving License Branch Nazimabad', 'Near Nazimabad Petrol Pump, Block 7, Nazimabad, Karachi', 'Monday - Saturday: 08:30 AM - 04:30 PM', 'Phone: +92-21-99260555', 24.9125, 67.0310 from proc3
  union all
  select id, 'Driving License Branch Korangi', 'Sector 15, Near Brookes Chowrangi, Korangi Industrial Area, Karachi', 'Monday - Saturday: 09:00 AM - 04:00 PM', 'Phone: +92-21-35050511', 24.8320, 67.1215 from proc3
)
insert into roadmap_steps (procedure_id, step_order, description, requires_witness, estimated_duration)
select id, 1, 'Entry & Medical Inspection: Check in at reception, present expired license and CNIC. Undergo quick on-site visual acuity eye-test with medical officer.', false, '15 mins' from proc3
union all
select id, 2, 'Fee Deposit: Deposit official government renewal fee at on-site National Bank of Pakistan (NBP) counter (3-year or 5-year renewal fee schedule).', false, '10 mins' from proc3
union all
select id, 3, 'Data Verification & Biometrics: Counter officer verifies CNIC credentials, captures live digital photo and electronic thumbprint.', false, '10 mins' from proc3
union all
select id, 4, 'Temporary Permit & Dispatch: Receive printed provisional stamped renewal permit valid for 30 days while your physical smart card is printed and dispatched via Pakistan Post EMS.', false, '5 mins' from proc3;
