import urllib.request
import json
import sys

url = "https://tvafpxwsocvnsptpbdhu.supabase.co/rest/v1/"

# Test anon key candidates from screenshot
# Text: F638Dcu4SHUwn_psirpZUWl6PWrIXnB1c3iUWZQnACQ
# Note: l vs 1 vs I:
# ZUW[l/1/I]6PWr[I/l/1]XnB1c3iUWZQnACQ
anon_chars_1 = ['l', 'I', '1']
anon_chars_2 = ['I', 'l', '1']

prefix = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWZweHdzb2N2bnNwdHBiZGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTc1NTcsImV4cCI6MjEwNDc3MzU1N30."

found_anon = None
for c1 in anon_chars_1:
    for c2 in anon_chars_2:
        sig = f"F638Dcu4SHUwn_psirpZUW{c1}6PWr{c2}XnB1c3iUWZQnACQ"
        token = prefix + sig
        req = urllib.request.Request(url, headers={"apikey": token, "Authorization": f"Bearer {token}"})
        try:
            resp = urllib.request.urlopen(req, timeout=5)
            found_anon = token
            break
        except urllib.error.HTTPError as e:
            if e.code in [200, 404]: # Supabase OpenAPI root returns 200
                found_anon = token
                break
        except Exception:
            pass
    if found_anon:
        break

# Test service_role key candidates
# Text: QemsIPFEti3wxdp4ROgMd-OFlTuGQWaclvHjEK8ytsM
# Note: I vs l vs 1 in Qems[I/l/1]PFEti3wxdp4ROgMd-OF[l/1/I]TuGQWac[l/1/I]vHjEK8ytsM
s_prefix = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWZweHdzb2N2bnNwdHBiZGh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5NzU1NywiZXhwIjoyMTA0NzczNTU3fQ."

found_service = None
for c1 in ['I', 'l', '1']:
    for c2 in ['l', '1', 'I']:
        for c3 in ['l', '1', 'I']:
            sig = f"Qems{c1}PFEti3wxdp4ROgMd-OF{c2}TuGQWac{c3}vHjEK8ytsM"
            token = s_prefix + sig
            req = urllib.request.Request(url, headers={"apikey": token, "Authorization": f"Bearer {token}"})
            try:
                resp = urllib.request.urlopen(req, timeout=5)
                found_service = token
                break
            except urllib.error.HTTPError as e:
                if e.code in [200, 404]:
                    found_service = token
                    break
            except Exception:
                pass
        if found_service:
            break
    if found_service:
        break

with open("/home/Hassan/CWA/keys_verified.json", "w") as f:
    json.dump({
        "SUPABASE_URL": "https://tvafpxwsocvnsptpbdhu.supabase.co",
        "SUPABASE_KEY": found_anon,
        "SUPABASE_SERVICE_ROLE_KEY": found_service,
        "SB_PUBLISHABLE": "sb_publishable_mS_PQ_pbTuvbQ92P_wS1ZA_GA41K9n9"
    }, f, indent=2)
