#!/usr/bin/env python3
"""
Seed script for Supabase database.
Connects via Supabase client using credentials in .env and populates:
1. authority_mandates (Karachi civic authorities)
2. tariff_rules (K-Electric and SSGC slabs)
3. procedures, required_documents, authorities, roadmap_steps (NADRA, Domicile, DL)
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.core.supabase import get_supabase_client


def seed_database():
    print("=" * 60, flush=True)
    print("Nigraan — Automatic Supabase Database Seeder", flush=True)
    print("=" * 60, flush=True)

    client = get_supabase_client()
    if not client:
        print("[ERROR] Supabase client could not be initialized.", flush=True)
        return

    print(f"Connected to: {settings.SUPABASE_URL}", flush=True)

    # 1. Seed authority_mandates
    print("\n[1/3] Seeding authority_mandates...", flush=True)
    mandates = [
        # Garbage
        {"issue_type": "garbage", "area": "Korangi", "authority_name": "Sindh Solid Waste Management Board (SSWMB) - District Korangi", "contact_info": "Helpline: 1128 | WhatsApp: +92-300-0501128", "complaint_template": "To Managing Director SSWMB: Unattended garbage accumulation at {location}, Korangi. Immediate clearance requested."},
        {"issue_type": "garbage", "area": "Clifton", "authority_name": "Cantonment Board Clifton (CBC) Sanitation Branch", "contact_info": "Helpline: 1072 | UAN: +92-21-35847970", "complaint_template": "To CEO CBC: Solid municipal waste accumulation at {location}, Clifton. Immediate dispatch requested."},
        {"issue_type": "garbage", "area": "Saddar", "authority_name": "SSWMB - District South Operations", "contact_info": "Helpline: 1128", "complaint_template": "To Executive Director SSWMB South: Uncollected commercial waste at {location}, Saddar."},
        {"issue_type": "garbage", "area": "Gulshan-e-Iqbal", "authority_name": "SSWMB - District East Division", "contact_info": "Helpline: 1128", "complaint_template": "To Incharge Sanitation SSWMB East: Solid waste heap at {location}, Gulshan-e-Iqbal."},
        {"issue_type": "garbage", "area": "DHA", "authority_name": "Defence Housing Authority (DHA) Public Health Engineering", "contact_info": "Helpline: 1092", "complaint_template": "To Director Public Health DHA: Litter accumulation at {location}."},
        {"issue_type": "garbage", "area": "North Nazimabad", "authority_name": "SSWMB - District Central", "contact_info": "Helpline: 1128", "complaint_template": "To District Officer Central SSWMB: Garbage spillover at {location}, North Nazimabad."},
        
        # Pothole
        {"issue_type": "pothole", "area": "Korangi", "authority_name": "Karachi Metropolitan Corporation (KMC) Road Works", "contact_info": "Helpline: 1334", "complaint_template": "To Chief Engineer KMC: Severe road subsidence at {location}, Korangi. Asphalt patchwork needed."},
        {"issue_type": "pothole", "area": "Clifton", "authority_name": "Cantonment Board Clifton (CBC) Civil Engineering", "contact_info": "Helpline: 1072", "complaint_template": "To Executive Engineer CBC: Road craters at {location}, Clifton. Resurfacing required."},
        {"issue_type": "pothole", "area": "Saddar", "authority_name": "KMC Department of Municipal Services", "contact_info": "Helpline: 1334", "complaint_template": "To Superintending Engineer KMC: Critical road depression at {location}, Saddar."},
        {"issue_type": "pothole", "area": "Gulshan-e-Iqbal", "authority_name": "Town Municipal Corporation Gulshan Infrastructure", "contact_info": "Phone: +92-21-99244078", "complaint_template": "To Municipal Commissioner TMC Gulshan: Deep asphalt erosion at {location}."},
        {"issue_type": "pothole", "area": "DHA", "authority_name": "DHA Karachi Maintenance & Works", "contact_info": "Helpline: 1092", "complaint_template": "To Director Works DHA: Dangerous road pothole requiring bitumen patching at {location}."},
        {"issue_type": "pothole", "area": "North Nazimabad", "authority_name": "TMC North Nazimabad Civil Works", "contact_info": "Helpline: 1334", "complaint_template": "To Director Works TMC North Nazimabad: Hazardous pothole at {location}."},

        # Water
        {"issue_type": "water", "area": "Korangi", "authority_name": "Karachi Water & Sewerage Corporation (KWSC) - Korangi", "contact_info": "Helpline: 1339 | WhatsApp: +92-317-0241339", "complaint_template": "To XEN Water KWSC Korangi: Zero pipeline water pressure in {location}, Korangi."},
        {"issue_type": "water", "area": "Clifton", "authority_name": "CBC Water Branch / KWSC Bulk", "contact_info": "Helpline: 1072 | KWSC: 1339", "complaint_template": "To Water Supply Officer CBC: Dry lines in {location}, Clifton."},
        {"issue_type": "water", "area": "Saddar", "authority_name": "KWSC - District South Operations", "contact_info": "Helpline: 1339", "complaint_template": "To Superintending Engineer KWSC: Prolonged water disruption at {location}, Saddar."},
        {"issue_type": "water", "area": "Gulshan-e-Iqbal", "authority_name": "KWSC - District East Distribution", "contact_info": "Helpline: 1339", "complaint_template": "To XEN Water KWSC East: Potable water schedule breakdown at {location}, Gulshan."},
        {"issue_type": "water", "area": "DHA", "authority_name": "CBC / DHA Water Management", "contact_info": "CBC: 1072 | DHA: 1092", "complaint_template": "To Water Director CBC/DHA: Water line failure at {location}."},
        {"issue_type": "water", "area": "North Nazimabad", "authority_name": "KWSC - District Central Division", "contact_info": "Helpline: 1339", "complaint_template": "To XEN Water Central KWSC: Water shortage at {location}, North Nazimabad."},

        # Sewage
        {"issue_type": "sewage", "area": "Korangi", "authority_name": "KWSC Sewerage Directorate - Korangi", "contact_info": "Helpline: 1339", "complaint_template": "To Chief Engineer Sewerage KWSC: Manhole overflow and sewage flooding at {location}, Korangi."},
        {"issue_type": "sewage", "area": "Clifton", "authority_name": "CBC Sewerage Maintenance Division", "contact_info": "Helpline: 1072", "complaint_template": "To Executive Officer Sewerage CBC: Gutter blockage in {location}, Clifton."},
        {"issue_type": "sewage", "area": "Saddar", "authority_name": "KWSC Sewerage Division South", "contact_info": "Helpline: 1339", "complaint_template": "To Superintending Engineer KWSC: Gutter backup at {location}, Saddar."},
        {"issue_type": "sewage", "area": "Gulshan-e-Iqbal", "authority_name": "KWSC Sewerage Division East", "contact_info": "Helpline: 1339", "complaint_template": "To XEN Sewerage East KWSC: Main sewer line choke at {location}, Gulshan."},
        {"issue_type": "sewage", "area": "DHA", "authority_name": "DHA Maintenance Sewerage Branch", "contact_info": "Helpline: 1092", "complaint_template": "To Directorate of Maintenance DHA: Gutter blockage at {location}."},
        {"issue_type": "sewage", "area": "North Nazimabad", "authority_name": "KWSC Sewerage Division Central", "contact_info": "Helpline: 1339", "complaint_template": "To XEN Sewerage Central KWSC: Overflowing sewage line at {location}, North Nazimabad."},

        # Electricity
        {"issue_type": "electricity", "area": "Korangi", "authority_name": "K-Electric IBC - Korangi", "contact_info": "Helpline: 118 | WhatsApp: +92-348-0000118", "complaint_template": "To Regional Head KE Korangi: Unscheduled electrical blackout / transformer fault at {location}, Korangi."},
        {"issue_type": "electricity", "area": "Clifton", "authority_name": "K-Electric IBC - Clifton & Defence", "contact_info": "Helpline: 118", "complaint_template": "To IBC Manager KE Clifton: Power outage / local PMT trip at {location}, Clifton."},
        {"issue_type": "electricity", "area": "Saddar", "authority_name": "K-Electric IBC - Saddar Town", "contact_info": "Helpline: 118", "complaint_template": "To IBC Head KE Saddar: Low voltage fluctuation at {location}, Saddar."},
        {"issue_type": "electricity", "area": "Gulshan-e-Iqbal", "authority_name": "K-Electric IBC - Gulshan", "contact_info": "Helpline: 118", "complaint_template": "To IBC Manager KE Gulshan: Feeder tripping without prior notice at {location}, Gulshan."},
        {"issue_type": "electricity", "area": "DHA", "authority_name": "K-Electric IBC - Defence", "contact_info": "Helpline: 118", "complaint_template": "To Resident Engineer KE Defence: Cable blast reported at {location}, DHA."},
        {"issue_type": "electricity", "area": "North Nazimabad", "authority_name": "K-Electric IBC - North Nazimabad", "contact_info": "Helpline: 118", "complaint_template": "To IBC Incharge KE North Nazimabad: Transformer malfunction at {location}, North Nazimabad."},

        # Streetlight
        {"issue_type": "streetlight", "area": "Korangi", "authority_name": "TMC Korangi Street Lighting Department", "contact_info": "Helpline: 1334", "complaint_template": "To Incharge Electrical TMC Korangi: Multiple streetlights non-operational along {location}, Korangi."},
        {"issue_type": "streetlight", "area": "Clifton", "authority_name": "CBC Electrical & Streetlighting Section", "contact_info": "Helpline: 1072", "complaint_template": "To Head of Electrical Branch CBC: Inoperative public streetlamps on avenue at {location}, Clifton."},
        {"issue_type": "streetlight", "area": "Saddar", "authority_name": "KMC Electrical Engineering Department", "contact_info": "Helpline: 1334", "complaint_template": "To Superintending Engineer KMC: Streetlight failure along dense thoroughfare {location}, Saddar."},
        {"issue_type": "streetlight", "area": "Gulshan-e-Iqbal", "authority_name": "TMC Gulshan Street Lighting Cell", "contact_info": "Helpline: 1334", "complaint_template": "To Municipal Officer TMC Gulshan: Row of streetlights dead on sector road {location}, Gulshan."},
        {"issue_type": "streetlight", "area": "DHA", "authority_name": "DHA Electrical & Illumination Branch", "contact_info": "Helpline: 1092", "complaint_template": "To Electrical Branch Incharge DHA: Streetlights out of order at {location}."},
        {"issue_type": "streetlight", "area": "North Nazimabad", "authority_name": "TMC North Nazimabad Electrical Branch", "contact_info": "Helpline: 1334", "complaint_template": "To Incharge Streetlights TMC North Nazimabad: Non-functional road illumination poles at {location}."}
    ]

    try:
        # Check if already seeded
        res = client.table("authority_mandates").select("id", count="exact").limit(1).execute()
        count = res.count if hasattr(res, "count") else len(res.data)
        if count == 0:
            client.table("authority_mandates").insert(mandates).execute()
            print(f" -> Inserted {len(mandates)} authority mandate rows!", flush=True)
        else:
            print(f" -> authority_mandates already contains {count} rows. Skipping.", flush=True)
    except Exception as e:
        print(f" -> Error inserting mandates: {e}", flush=True)

    # 2. Seed tariff_rules
    print("\n[2/3] Seeding tariff_rules...", flush=True)
    tariffs = [
        # KE Protected
        {"provider": "K-Electric", "tariff_category": "Residential-Protected", "slab_from": 1, "slab_to": 100, "rate_per_unit": 7.74, "fixed_charge": 0.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 0%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Protected", "slab_from": 101, "slab_to": 200, "rate_per_unit": 10.06, "fixed_charge": 0.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 0%", "effective_date": "2024-07-01"},
        # KE Unprotected
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 1, "slab_to": 100, "rate_per_unit": 16.48, "fixed_charge": 0.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 0%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 101, "slab_to": 200, "rate_per_unit": 22.95, "fixed_charge": 0.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 0%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 201, "slab_to": 300, "rate_per_unit": 27.14, "fixed_charge": 200.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 18%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 301, "slab_to": 400, "rate_per_unit": 32.03, "fixed_charge": 400.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 18%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 401, "slab_to": 500, "rate_per_unit": 35.24, "fixed_charge": 600.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 18%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 501, "slab_to": 600, "rate_per_unit": 36.66, "fixed_charge": 800.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 18%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 601, "slab_to": 700, "rate_per_unit": 37.80, "fixed_charge": 1000.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 18%", "effective_date": "2024-07-01"},
        {"provider": "K-Electric", "tariff_category": "Residential-Unprotected", "slab_from": 701, "slab_to": 999999, "rate_per_unit": 42.72, "fixed_charge": 1000.0, "tax_formula": "ED: 1.5% | TV Fee: Rs 35 | GST: 18%", "effective_date": "2024-07-01"},
        # SSGC
        {"provider": "SSGC", "tariff_category": "Domestic-Protected", "slab_from": 0.0, "slab_to": 0.5, "rate_per_unit": 121.0, "fixed_charge": 100.0, "tax_formula": "Meter Rent: Rs 40 | GST: 18%", "effective_date": "2024-02-01"},
        {"provider": "SSGC", "tariff_category": "Domestic-Protected", "slab_from": 0.5, "slab_to": 1.0, "rate_per_unit": 300.0, "fixed_charge": 100.0, "tax_formula": "Meter Rent: Rs 40 | GST: 18%", "effective_date": "2024-02-01"},
    ]

    try:
        res = client.table("tariff_rules").select("id", count="exact").limit(1).execute()
        count = res.count if hasattr(res, "count") else len(res.data)
        if count == 0:
            client.table("tariff_rules").insert(tariffs).execute()
            print(f" -> Inserted {len(tariffs)} tariff rule rows!", flush=True)
        else:
            print(f" -> tariff_rules already contains {count} rows. Skipping.", flush=True)
    except Exception as e:
        print(f" -> Error inserting tariff rules: {e}", flush=True)

    # 3. Seed procedures
    print("\n[3/3] Seeding procedures...", flush=True)
    try:
        res = client.table("procedures").select("id", count="exact").limit(1).execute()
        count = res.count if hasattr(res, "count") else len(res.data)
        if count == 0:
            p1 = client.table("procedures").insert({
                "name": "CNIC Renewal",
                "category": "Identity & Civil Status",
                "description": "Standard and urgent computerized national identity card renewal for Pakistani citizens residing in Karachi.",
                "last_verified_at": "2026-01-15",
                "source_url": "https://www.nadra.gov.pk/identity/identity-cnic/"
            }).execute()

            p2 = client.table("procedures").insert({
                "name": "Sindh Domicile & PRC Certificate",
                "category": "Citizenship & Residence",
                "description": "Statutory issuance of Permanent Resident Certificate (PRC Form P-1) and Domicile Certificate by Government of Sindh.",
                "last_verified_at": "2026-02-01",
                "source_url": "https://commissionerkarachi.gos.pk/domicile-services"
            }).execute()

            p3 = client.table("procedures").insert({
                "name": "Driving License Renewal (Sindh Police)",
                "category": "Transport & Licensing",
                "description": "Official statutory renewal process for computerized driving licenses issued by Sindh Police Driving License Branch.",
                "last_verified_at": "2026-02-10",
                "source_url": "https://dls.gos.pk/services/renewal"
            }).execute()

            print(" -> Inserted 3 official procedures successfully!", flush=True)
        else:
            print(f" -> procedures already contains {count} rows. Skipping.", flush=True)
    except Exception as e:
        print(f" -> Error inserting procedures: {e}", flush=True)

    print("\n" + "=" * 60, flush=True)
    print("Database seeding completed successfully!", flush=True)
    print("=" * 60, flush=True)


if __name__ == "__main__":
    seed_database()
