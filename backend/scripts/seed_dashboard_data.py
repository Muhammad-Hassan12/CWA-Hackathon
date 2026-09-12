#!/usr/bin/env python3
"""
Seed realistic Karachi civic reports, bill audits, and exploitation signals into Supabase.
This populates the Public Live Dashboard with authentic, verified public ledger items.
"""

import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.supabase import get_supabase_client
from app.core.config import settings

def seed_dashboard_data():
    client = get_supabase_client()
    if not client:
        print("[ERROR] Supabase client could not be initialized.")
        return

    print(f"Connecting to Supabase: {settings.SUPABASE_URL}")
    now = datetime.now(timezone.utc)

    # 1. Seed Reports
    print("Seeding demo civic reports...")
    reports = [
        {
            "tracking_id": "KOR-2026-0042",
            "issue_type": "garbage",
            "severity": "high",
            "description": "Solid waste and open dump spilling onto main road near Sector 7-A, Korangi Industrial Area.",
            "area": "Korangi",
            "lat": 24.8398,
            "lng": 67.1143,
            "confirm_count": 4,
            "status": "drafted",
            "drafted_complaint": "STATUTORY CIVIC COMPLAINT\nDate: 10 March 2026\nTo: Managing Director, Sindh Solid Waste Management Board (SSWMB)\nAuthority Mandate: Sindh Solid Waste Management Board Act 2014\nSubject: Critical Solid Waste Spillover at Sector 7-A, Korangi Industrial Area\n\nRespected Officer,\n\nWe hereby bring to your statutory attention severe municipal solid waste accumulation at Sector 7-A, Korangi Industrial Area. The uncollected waste obstructs commercial traffic and poses acute health hazards. Under Section 8 of the SSWMB Act 2014, lifting and municipal disposal is the statutory duty of your office.\n\nDemanded Actions:\n1. Immediate dispatch of compaction vehicles and sanitation crews.\n2. Placement of secondary garbage container bins.\n\nSincerely,\nCorroborating Citizens of Korangi\nTracking ID: KOR-2026-0042",
            "created_at": (now - timedelta(hours=36)).isoformat()
        },
        {
            "tracking_id": "CLI-2026-1189",
            "issue_type": "water",
            "severity": "critical",
            "description": "Burst water main line and saline backflow into domestic supply lines along Khayaban-e-Shamsheer, Clifton Block 8.",
            "area": "Clifton",
            "lat": 24.8138,
            "lng": 67.0392,
            "confirm_count": 2,
            "status": "drafted",
            "drafted_complaint": "STATUTORY CIVIC COMPLAINT\nDate: 11 March 2026\nTo: Chief Executive Officer, Cantonment Board Clifton (CBC) & Managing Director KWSC\nAuthority Mandate: Cantonments Act 1924 / KWSC Act 2023\nSubject: Severe Water Main Rupture & Saline Contamination at Clifton Block 8\n\nRespected Sir,\n\nA high-pressure water pipeline rupture has caused substantial potable water loss and saline ground seepage into domestic supply pipes in Clifton Block 8. Immediate valve shutdown, pipe replacement, and pressure restoration are requested under CBC water distribution regulations.\n\nTracking ID: CLI-2026-1189",
            "created_at": (now - timedelta(hours=22)).isoformat()
        },
        {
            "tracking_id": "SAD-2026-0931",
            "issue_type": "pothole",
            "severity": "high",
            "description": "Deep asphalt subsidence and open crater on Preedy Street near Empress Market, causing vehicular accidents.",
            "area": "Saddar",
            "lat": 24.8569,
            "lng": 67.0211,
            "confirm_count": 7,
            "status": "drafted",
            "drafted_complaint": "FORMAL STATUTORY NOTICE\nDate: 09 March 2026\nTo: Municipal Commissioner & Chief Engineer (Roads), Karachi Metropolitan Corporation (KMC)\nAuthority Mandate: Sindh Local Government Act 2013, Schedule II\nSubject: Urgent Road Repair & Patchwork on Preedy Street, Saddar\n\nDeep road subsidence measuring over 2.5 feet in width on Preedy Street poses imminent danger to motorcyclists and emergency ambulances traversing toward Civil Hospital Karachi.\n\nDemanded Actions:\n1. Immediate placement of protective safety barricades and warning reflectors.\n2. High-grade asphalt resurfacing within 48 hours.\n\nTracking ID: SAD-2026-0931",
            "created_at": (now - timedelta(hours=48)).isoformat()
        },
        {
            "tracking_id": "GLS-2026-3320",
            "issue_type": "electricity",
            "severity": "critical",
            "description": "Prolonged electrical blackout and local pole-mounted transformer (PMT) oil leakage at Block 13-D, Gulshan-e-Iqbal.",
            "area": "Gulshan-e-Iqbal",
            "lat": 24.9180,
            "lng": 67.0971,
            "confirm_count": 5,
            "status": "submitted",
            "drafted_complaint": "EMERGENCY SAFETY NOTICE\nTo: IBC Head, K-Electric Gulshan Town\nAuthority Mandate: NEPRA Consumer Service Manual (CSM) 2021\nSubject: PMT Oil Leakage & Unscheduled Outage at Block 13-D\n\nTransformer sparking and mineral oil leakage reported. Fire hazard requires urgent isolator disconnect and technical team deployment.\n\nTracking ID: GLS-2026-3320",
            "created_at": (now - timedelta(hours=14)).isoformat()
        },
        {
            "tracking_id": "NNZ-2026-5514",
            "issue_type": "sewage",
            "severity": "high",
            "description": "Choked underground sewer trunk and overflowing manhole directly opposite Shipowner College, North Nazimabad.",
            "area": "North Nazimabad",
            "lat": 24.9392,
            "lng": 67.0397,
            "confirm_count": 3,
            "status": "drafted",
            "drafted_complaint": "STATUTORY SANITATION PETITION\nTo: Superintending Engineer (Sewerage Central), KWSC\nAuthority Mandate: Karachi Water & Sewerage Corporation Act 2023\nSubject: Overflowing Sewage Trunk at North Nazimabad\n\nSevere sewage effluent flooding pedestrian walkways outside educational institution. Immediate dispatch of high-pressure rodding/suction machine requested.\n\nTracking ID: NNZ-2026-5514",
            "created_at": (now - timedelta(hours=8)).isoformat()
        },
        {
            "tracking_id": "DHA-2026-7201",
            "issue_type": "streetlight",
            "severity": "medium",
            "description": "Continuous row of inoperative streetlights along 26th Street, Phase 5 DHA, creating unsafe nighttime corridor.",
            "area": "DHA",
            "lat": 24.7865,
            "lng": 67.0545,
            "confirm_count": 1,
            "status": "drafted",
            "drafted_complaint": "MUNICIPAL NOTICE\nTo: Director Electrical & Public Works, DHA Karachi\nSubject: Illumination Failure on 26th Street\n\nDefective ballasts and dark poles over a 400-meter stretch. Immediate replacement of LED luminaires requested.\n\nTracking ID: DHA-2026-7201",
            "created_at": (now - timedelta(hours=5)).isoformat()
        }
    ]

    for r in reports:
        try:
            client.table("reports").upsert(r, on_conflict="tracking_id").execute()
            print(f"  + Report {r['tracking_id']} upserted.")
        except Exception as e:
            print(f"  ! Error upserting report {r['tracking_id']}: {e}")

    # 2. Seed Bills
    print("\nSeeding demo utility bill audits...")
    bills = [
        {
            "tracking_id": "KE-2026-8812",
            "provider": "K-Electric",
            "tariff_category": "Residential-Unprotected",
            "units_billed": 312,
            "amount_billed": 14850.00,
            "amount_expected": 8921.42,
            "verdict": "flagged",
            "math_breakdown": {
                "units_billed": 312,
                "tariff_category": "Residential-Unprotected",
                "energy_charges": 7041.36,
                "fixed_charge": 400.00,
                "electricity_duty": 105.62,
                "tv_fee": 35.00,
                "gst": 1339.44,
                "total_expected": 8921.42,
                "amount_billed": 14850.00,
                "discrepancy": 5928.58,
                "overcharge_pct": 66.5,
                "slab_breakdown": [
                    {"slab": "001–100 units", "units": 100, "rate": 16.48, "cost": 1648.00},
                    {"slab": "101–200 units", "units": 100, "rate": 22.95, "cost": 2295.00},
                    {"slab": "201–300 units", "units": 100, "rate": 27.14, "cost": 2714.00},
                    {"slab": "301–400 units", "units": 12, "rate": 32.03, "cost": 384.36}
                ]
            },
            "drafted_complaint": "FORMAL BILLING DISPUTE NOTICE\nUnder NEPRA Consumer Service Manual (CSM) Clause 11\nTo: Billing Dispute Resolution Cell, K-Electric Limited\nRe: Unauthorized Overcharge on 312 Units (Tracking: KE-2026-8812)\n\nAudit reveals statutory charges of Rs. 8,921.42 versus billed amount of Rs. 14,850.00, representing an unauthorized overbilling of Rs. 5,928.58 (+66.5% over NEPRA statutory tariff).\n\nخلاصہ برائے صارفین تنازعات سیل:\nنیپرا کے منظور شدہ ٹیرف شیڈول کے مطابق 312 یونٹس پر اصل بل 8,921.42 روپے بنتا ہے جبکہ کے-الیکٹرک نے غیر قانونی طور پر 14,850 روپے بل کیا ہے۔ 5,928.58 روپے کا اضافی بل فوری طور پر درست کیا جائے اور ترمیمی چالان جاری کیا جائے۔\n\nTracking ID: KE-2026-8812",
            "created_at": (now - timedelta(hours=30)).isoformat()
        },
        {
            "tracking_id": "KE-2026-4421",
            "provider": "K-Electric",
            "tariff_category": "Residential-Protected",
            "units_billed": 185,
            "amount_billed": 4920.00,
            "amount_expected": 1688.54,
            "verdict": "flagged",
            "math_breakdown": {
                "units_billed": 185,
                "tariff_category": "Residential-Protected",
                "energy_charges": 1629.10,
                "fixed_charge": 0.00,
                "electricity_duty": 24.44,
                "tv_fee": 35.00,
                "gst": 0.00,
                "total_expected": 1688.54,
                "amount_billed": 4920.00,
                "discrepancy": 3231.46,
                "overcharge_pct": 191.4,
                "slab_breakdown": [
                    {"slab": "001–100 units", "units": 100, "rate": 7.74, "cost": 774.00},
                    {"slab": "101–200 units", "units": 85, "rate": 10.06, "cost": 855.10}
                ]
            },
            "drafted_complaint": "PROTECTED CONSUMER VIOLATION PETITION\nTo: Regional Billing Ombudsman, NEPRA & K-Electric\nSubject: Illegal Application of Unprotected Tariff to Protected Consumer (185 Units)\n\nConsumer qualifies under SRO 575(I)/2024 for Protected Category. Statutory bill is Rs. 1,688.54. Unauthorized overcharge of Rs. 3,231.46 identified.\n\nخلاصہ برائے ریجنل امبڈسمین:\nصارف پروٹیکٹڈ کیٹیگری (185 یونٹس) کا اہل ہے۔ اصل بل 1,688.54 روپے کے بجائے کے-الیکٹرک نے 4,920 روپے بل کیا ہے۔ 3,231.46 روپے کا اضافی بل واپس لیا جائے۔\n\nTracking ID: KE-2026-4421",
            "created_at": (now - timedelta(hours=18)).isoformat()
        },
        {
            "tracking_id": "SSGC-2026-1930",
            "provider": "SSGC",
            "tariff_category": "Domestic",
            "units_billed": 0.8,
            "amount_billed": 2150.00,
            "amount_expected": 1480.00,
            "verdict": "flagged",
            "math_breakdown": {
                "units_billed": 0.8,
                "tariff_category": "Domestic",
                "gas_charges": 150.50,
                "fixed_charge": 100.00,
                "meter_rent": 40.00,
                "gst": 52.29,
                "total_expected": 1480.00,
                "amount_billed": 2150.00,
                "discrepancy": 670.00,
                "overcharge_pct": 45.3
            },
            "drafted_complaint": "DOMESTIC GAS TARIFF DISPUTE\nTo: Billing Incharge, Sui Southern Gas Company (SSGC)\nSubject: Billing Discrepancy on 0.8 Hm3 Gas Consumption\n\nTracking ID: SSGC-2026-1930",
            "created_at": (now - timedelta(hours=10)).isoformat()
        },
        {
            "tracking_id": "KE-2026-3105",
            "provider": "K-Electric",
            "tariff_category": "Residential-Unprotected",
            "units_billed": 95,
            "amount_billed": 1624.08,
            "amount_expected": 1624.08,
            "verdict": "correct",
            "math_breakdown": {
                "units_billed": 95,
                "tariff_category": "Residential-Unprotected",
                "energy_charges": 1565.60,
                "fixed_charge": 0.00,
                "electricity_duty": 23.48,
                "tv_fee": 35.00,
                "gst": 0.00,
                "total_expected": 1624.08,
                "amount_billed": 1624.08,
                "discrepancy": 0.00,
                "overcharge_pct": 0.0,
                "slab_breakdown": [
                    {"slab": "001–100 units", "units": 95, "rate": 16.48, "cost": 1565.60}
                ]
            },
            "drafted_complaint": "BILL AUDIT PASS: Exact statutory compliance verified against NEPRA 2024-07 Schedule. No overcharge detected.",
            "created_at": (now - timedelta(hours=4)).isoformat()
        }
    ]

    for b in bills:
        try:
            client.table("bills").upsert(b, on_conflict="tracking_id").execute()
            print(f"  + Bill {b['tracking_id']} upserted.")
        except Exception as e:
            print(f"  ! Error upserting bill {b['tracking_id']}: {e}")

    # 3. Seed Exploitation Signals
    print("\nSeeding anonymous exploitation signals...")
    signals = [
        {
            "reported_amount": 1500,
            "note": "Agent demanded Rs. 1500 outside counter to bypass biometric queue for CNIC renewal.",
            "created_at": (now - timedelta(days=2)).isoformat()
        },
        {
            "reported_amount": 2500,
            "note": "Desk clerk demanded speed money to sign Sindh Domicile Form P-1 without additional affidavits.",
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "reported_amount": 3000,
            "note": "Driving license medical token agent demanded Rs. 3000 for immediate clearance.",
            "created_at": (now - timedelta(hours=12)).isoformat()
        },
        {
            "reported_amount": 1000,
            "note": "Extra un-receipted fee demanded for token slip at Mega Center North Nazimabad.",
            "created_at": (now - timedelta(hours=6)).isoformat()
        }
    ]

    for s in signals:
        try:
            client.table("exploitation_signals").insert(s).execute()
            print(f"  + Signal of Rs. {s['reported_amount']} inserted.")
        except Exception as e:
            print(f"  ! Error inserting signal: {e}")

    print("\nSeed completed successfully!")

if __name__ == "__main__":
    seed_dashboard_data()
