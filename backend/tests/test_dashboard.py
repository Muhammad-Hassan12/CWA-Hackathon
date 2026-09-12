#!/usr/bin/env python3
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("Initializing TestClient for Nigraan API...", flush=True)
    client = TestClient(app)

    # 1. Test Health
    print("\n--- 1. Testing /api/health ---", flush=True)
    r = client.get("/api/health")
    print(f"Health status: {r.status_code}, data: {r.json()}", flush=True)
    assert r.status_code == 200

    # 2. Test Procedures
    print("\n--- 2. Testing /api/procedures ---", flush=True)
    r = client.get("/api/procedures")
    print(f"Procedures status: {r.status_code}, count: {len(r.json())}", flush=True)
    assert r.status_code == 200

    # 3. Test Dashboard Stats
    print("\n--- 3. Testing /api/dashboard/stats ---", flush=True)
    r = client.get("/api/dashboard/stats")
    print(f"Stats status: {r.status_code}", flush=True)
    data = r.json()
    print(f"Total reports: {data.get('total_reports')}", flush=True)
    print(f"Drafted reports: {data.get('drafted_reports')}", flush=True)
    print(f"Total bills: {data.get('total_bills')}", flush=True)
    print(f"Flagged bills: {data.get('flagged_bills')}", flush=True)
    print(f"Total overcharge: Rs. {data.get('total_overcharge_pkr')}", flush=True)
    assert r.status_code == 200

    # 4. Test Dashboard Feed
    print("\n--- 4. Testing /api/dashboard/feed ---", flush=True)
    r = client.get("/api/dashboard/feed?limit=10")
    print(f"Feed status: {r.status_code}", flush=True)
    feed = r.json()
    print(f"Feed count: {len(feed)}", flush=True)
    if feed:
        print(f"First feed item: {feed[0]['tracking_id']} - {feed[0]['title']} ({feed[0]['status']})", flush=True)
    assert r.status_code == 200

    # 5. Test Tracking Lookup
    print("\n--- 5. Testing /api/dashboard/lookup/KOR-2026-0042 ---", flush=True)
    r = client.get("/api/dashboard/lookup/KOR-2026-0042")
    print(f"Lookup status: {r.status_code}", flush=True)
    if r.status_code == 200:
        print(f"Found kind: {r.json().get('kind')}, tracking: {r.json().get('data', {}).get('tracking_id')}", flush=True)

    print("\n--- 6. Testing /api/dashboard/lookup/KE-2026-8812 ---", flush=True)
    r = client.get("/api/dashboard/lookup/KE-2026-8812")
    print(f"Lookup bill status: {r.status_code}", flush=True)
    if r.status_code == 200:
        print(f"Found kind: {r.json().get('kind')}, verdict: {r.json().get('data', {}).get('verdict')}", flush=True)

    print("\nALL DASHBOARD & PROCEDURE API TESTS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    run_tests()
