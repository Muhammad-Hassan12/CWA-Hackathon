import urllib.request

url = "https://tvafpxwsocvnsptpbdhu.supabase.co/rest/v1/"
s_prefix = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWZweHdzb2N2bnNwdHBiZGh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5NzU1NywiZXhwIjoyMTA0NzczNTU3fQ."
sig = "QemsIPFEti3wxdp4ROgMd-OFlTuGQWaclvHjEK8ytsM"
token = s_prefix + sig

req = urllib.request.Request(url, headers={"apikey": token, "Authorization": f"Bearer {token}"})
try:
    resp = urllib.request.urlopen(req, timeout=5)
    out = f"STATUS {resp.status}: {resp.read()[:200]}"
except urllib.error.HTTPError as e:
    out = f"HTTP {e.code}: {e.read().decode()[:200]}"
except Exception as e:
    out = f"ERR: {e}"

with open("/home/Hassan/CWA/service_debug.txt", "w") as f:
    f.write(out)
