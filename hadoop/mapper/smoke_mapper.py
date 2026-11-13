#!/usr/bin/env python3
"""
NetSentinel — MapReduce Smoke Test Mapper (Phase 6)
Analyzes network flows and emits (protocol, 1) pairs for protocol aggregation.
"""

import sys
import csv

def main():
    # Use csv.reader to correctly parse CSV records with quotation/delimiters
    reader = csv.reader(sys.stdin)
    
    records_processed = 0
    headers_skipped = 0
    malformed_records = 0
    
    for row in reader:
        if not row:
            continue
            
        # Detect and skip header row
        if len(row) > 4 and (row[4].strip().lower() == "protocol" or row[0].strip().lower() in ("src ip dec", "src_ip_dec", "flow id")):
            headers_skipped += 1
            continue
            
        # Validate column count (Standard schema: 89 columns)
        if len(row) < 5:
            sys.stderr.write(f"WARNING: Malformed record with insufficient columns ({len(row)}): {row}\n")
            malformed_records += 1
            continue
            
        raw_proto = row[4].strip()
        try:
            proto_num = int(float(raw_proto))
            # Standard IANA protocol naming
            proto_map = {
                6: "TCP",
                17: "UDP",
                1: "ICMP",
                0: "HOPOPT"
            }
            proto_name = proto_map.get(proto_num, f"OTHER({proto_num})")
            
            # Emit key-value pair to stdout for Hadoop MapReduce shuffle/sort
            print(f"{proto_name}\t1")
            records_processed += 1
        except ValueError:
            sys.stderr.write(f"WARNING: Invalid protocol field '{raw_proto}': {row[:5]}\n")
            malformed_records += 1
            continue

    sys.stderr.write(
        f"Mapper Summary: processed={records_processed}, headers_skipped={headers_skipped}, malformed={malformed_records}\n"
    )

if __name__ == "__main__":
    main()
