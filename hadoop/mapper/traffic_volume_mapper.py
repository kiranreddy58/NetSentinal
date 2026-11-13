#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 5 Mapper: Traffic Volume Analytics
Processes raw network flows from HDFS and emits volume-tier keyed records.
"""

import sys
import csv

def get_volume_tier(total_bytes):
    if total_bytes < 1024:
        return "1_MICRO_<1KB"
    elif total_bytes < 10240:
        return "2_SMALL_1-10KB"
    elif total_bytes < 102400:
        return "3_MEDIUM_10-100KB"
    elif total_bytes < 1048576:
        return "4_LARGE_100KB-1MB"
    else:
        return "5_JUMBO_>1MB"

def main():
    reader = csv.reader(sys.stdin)
    
    records_processed = 0
    headers_skipped = 0
    malformed_records = 0
    
    for row in reader:
        if not row:
            continue
            
        first_col = row[0].strip().lower()
        if first_col in ("src ip dec", "src_ip_dec", "flow id") or (len(row) > 4 and row[4].strip().lower() == "protocol"):
            headers_skipped += 1
            continue
            
        if len(row) < 88:
            malformed_records += 1
            continue
            
        try:
            fwd_pkts = int(float(row[7].strip()))
            bwd_pkts = int(float(row[8].strip()))
            fwd_bytes = int(float(row[9].strip()))
            bwd_bytes = int(float(row[10].strip()))
            
            if fwd_pkts < 0 or bwd_pkts < 0 or fwd_bytes < 0 or bwd_bytes < 0:
                malformed_records += 1
                continue
                
            total_bytes = fwd_bytes + bwd_bytes
            tier = get_volume_tier(total_bytes)
            
            # Emit per-tier and overall records
            print(f"{tier}\t{fwd_pkts},{bwd_pkts},{fwd_bytes},{bwd_bytes},{total_bytes}")
            records_processed += 1
            
        except (ValueError, IndexError):
            malformed_records += 1
            continue

    sys.stderr.write(
        f"Job 5 Mapper Summary: processed={records_processed}, headers_skipped={headers_skipped}, malformed={malformed_records}\n"
    )

if __name__ == "__main__":
    main()
