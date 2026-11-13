import urllib.request
import os

WINUTILS_BASE = "https://raw.githubusercontent.com/cdarlint/winutils/master/hadoop-3.3.6/bin"
FILES = [
    "winutils.exe",
    "hadoop.dll",
    "hadoop.cmd",
    "hdfs.cmd",
    "mapred.cmd",
    "yarn.cmd",
    "yarn",
    "hdfs",
    "hadoop"
]

dest_dir = os.path.join("tools", "winutils-bin")
os.makedirs(dest_dir, exist_ok=True)

print(f"Downloading verified Windows native binaries from cdarlint/winutils (Hadoop 3.3.6)...")
for fname in FILES:
    target_path = os.path.join(dest_dir, fname)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        print(f"  [OK] {fname} already downloaded ({os.path.getsize(target_path)} bytes)")
        continue
    url = f"{WINUTILS_BASE}/{fname}"
    print(f"  Downloading {fname} from {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp, open(target_path, "wb") as f:
        f.write(resp.read())
    print(f"  [DONE] {fname} ({os.path.getsize(target_path)} bytes)")

print("\nAll winutils binaries successfully downloaded and staged.")
