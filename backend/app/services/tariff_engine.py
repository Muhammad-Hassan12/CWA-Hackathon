from typing import Dict, Any, List, Optional
import math

KE_PROTECTED_SLABS = [
    (1, 100, 7.74),
    (101, 200, 10.06),
]

KE_UNPROTECTED_SLABS = [
    (1, 100, 16.48),
    (101, 200, 22.95),
    (201, 300, 27.14),
    (301, 400, 32.03),
    (401, 500, 35.24),
    (501, 600, 36.66),
    (601, 700, 37.80),
    (701, 999999, 42.72),
]

SSGC_DOMESTIC_SLABS = [
    (0.0, 0.5, 121.0),
    (0.5, 1.0, 300.0),
    (1.0, 2.0, 800.0),
    (2.0, 3.0, 1650.0),
]


def compute_k_electric_bill(units: float, tariff_category: str = "Residential-Unprotected", amount_billed: Optional[float] = None) -> Dict[str, Any]:
    """
    Deterministic Python calculation of official NEPRA approved K-Electric residential bill.
    Never uses LLM arithmetic.
    """
    is_protected = "protected" in tariff_category.lower() and "unprotected" not in tariff_category.lower()
    slabs_config = KE_PROTECTED_SLABS if is_protected else KE_UNPROTECTED_SLABS

    units_remaining = max(0.0, float(units))
    slab_breakdown: List[Dict[str, Any]] = []
    total_energy_charges = 0.0

    for slab_from, slab_to, rate in slabs_config:
        slab_capacity = (slab_to - slab_from + 1)
        if units_remaining <= 0:
            break

        units_in_slab = min(units_remaining, slab_capacity)
        slab_cost = round(units_in_slab * rate, 2)
        total_energy_charges += slab_cost

        slab_label = f"{slab_from:03d}–{slab_to:03d} units" if slab_to < 999999 else f">{slab_from:03d} units"
        slab_breakdown.append({
            "slab": slab_label,
            "units": units_in_slab,
            "rate": rate,
            "cost": slab_cost,
        })
        units_remaining -= units_in_slab

    # Fixed Regulatory Charges (NEPRA Schedule)
    fixed_charge = 0.0
    if not is_protected:
        if units <= 200:
            fixed_charge = 0.0
        elif units <= 300:
            fixed_charge = 200.0
        elif units <= 400:
            fixed_charge = 400.0
        elif units <= 500:
            fixed_charge = 600.0
        elif units <= 600:
            fixed_charge = 800.0
        else:
            fixed_charge = 1000.0

    # Statutory Taxes & Levies
    # 1. Electricity Duty (ED) = 1.5% of total energy charges
    electricity_duty = round(total_energy_charges * 0.015, 2)

    # 2. PTV License Fee = Rs. 35.0 flat
    tv_fee = 35.0

    # 3. General Sales Tax (GST) = 18% if units >= 201 or unprotected consumption exceeding threshold
    subtotal_for_tax = total_energy_charges + fixed_charge
    gst = 0.0
    if not is_protected and units > 200:
        gst = round(subtotal_for_tax * 0.18, 2)

    total_expected = round(total_energy_charges + fixed_charge + electricity_duty + tv_fee + gst, 2)

    discrepancy = 0.0
    overcharge_pct = 0.0
    verdict = "correct"

    if amount_billed is not None and amount_billed > 0:
        discrepancy = round(float(amount_billed) - total_expected, 2)
        # Tolerance of Rs. 50 accounts for minor rounding or billing cycle days
        if discrepancy > 50.0:
            verdict = "flagged"
            overcharge_pct = round((discrepancy / total_expected) * 100, 1) if total_expected > 0 else 0.0
        else:
            verdict = "correct"

    return {
        "provider": "K-Electric",
        "tariff_category": "Residential-Protected" if is_protected else "Residential-Unprotected",
        "units_billed": units,
        "amount_billed": amount_billed,
        "amount_expected": total_expected,
        "discrepancy": discrepancy,
        "overcharge_pct": overcharge_pct,
        "verdict": verdict,
        "math_breakdown": {
            "slab_breakdown": slab_breakdown,
            "energy_charges": total_energy_charges,
            "fixed_charge": fixed_charge,
            "electricity_duty": electricity_duty,
            "tv_fee": tv_fee,
            "gst": gst,
            "total_expected": total_expected,
            "discrepancy": discrepancy,
            "overcharge_pct": overcharge_pct,
        }
    }


def compute_ssgc_bill(units_hm3: float, tariff_category: str = "Domestic", amount_billed: Optional[float] = None) -> Dict[str, Any]:
    """
    Deterministic calculation of Sui Southern Gas Company (SSGC) domestic gas bill.
    """
    units_remaining = max(0.0, float(units_hm3))
    slab_breakdown = []
    total_gas_charges = 0.0

    for slab_from, slab_to, rate in SSGC_DOMESTIC_SLABS:
        if units_remaining <= 0:
            break
        capacity = slab_to - slab_from
        units_in_slab = min(units_remaining, capacity)
        cost = round(units_in_slab * rate, 2)
        total_gas_charges += cost
        slab_breakdown.append({
            "slab": f"{slab_from} - {slab_to} Hm3",
            "units": units_in_slab,
            "rate": rate,
            "cost": cost,
        })
        units_remaining -= units_in_slab

    meter_rent = 40.0
    gst = round((total_gas_charges + meter_rent) * 0.18, 2)
    total_expected = round(total_gas_charges + meter_rent + gst, 2)

    discrepancy = 0.0
    overcharge_pct = 0.0
    verdict = "correct"

    if amount_billed is not None and amount_billed > 0:
        discrepancy = round(float(amount_billed) - total_expected, 2)
        if discrepancy > 50.0:
            verdict = "flagged"
            overcharge_pct = round((discrepancy / total_expected) * 100, 1) if total_expected > 0 else 0.0

    return {
        "provider": "SSGC",
        "tariff_category": "Domestic",
        "units_billed": units_hm3,
        "amount_billed": amount_billed,
        "amount_expected": total_expected,
        "discrepancy": discrepancy,
        "overcharge_pct": overcharge_pct,
        "verdict": verdict,
        "math_breakdown": {
            "slab_breakdown": slab_breakdown,
            "gas_charges": total_gas_charges,
            "meter_rent": meter_rent,
            "gst": gst,
            "total_expected": total_expected,
            "discrepancy": discrepancy,
            "overcharge_pct": overcharge_pct,
        }
    }
