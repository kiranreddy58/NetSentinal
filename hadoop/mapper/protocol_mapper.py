#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 4 Mapper: Protocol Analytics
Processes raw network flows from HDFS and emits protocol-keyed records.
"""

import sys
import csv

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
            proto = int(float(row[4].strip()))
            duration = float(row[6].strip())
            fwd_pkts = int(float(row[7].strip()))
            bwd_pkts = int(float(row[8].strip()))
            fwd_bytes = int(float(row[9].strip()))
            bwd_bytes = int(float(row[10].strip()))
            
            if fwd_pkts < 0 or bwd_pkts < 0 or fwd_bytes < 0 or bwd_bytes < 0:
                malformed_records += 1
                continue
                
            label = row[87].strip()
            is_benign = 1 if label.upper() == "BENIGN" else 0
            is_attack = 0 if is_benign == 1 else 1
            
            print(f"{proto}\t{fwd_pkts},{bwd_pkts},{fwd_bytes},{bwd_bytes},{duration},{is_benign},{is_attack}")
            records_processed += 1
            
        except (ValueError, IndexError):
            malformed_records += 1
            continue

    sys.stderr.write(
        f"Job 4 Mapper Summary: processed={records_processed}, headers_skipped={headers_skipped}, malformed={malformed_records}\n"
    )

if __name__ == "__main__":
    main()
