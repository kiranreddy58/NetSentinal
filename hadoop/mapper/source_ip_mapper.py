#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 1 Mapper: Source IP Analytics
Processes raw network flows from HDFS and emits source-IP keyed records.
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
            
        # Detect and skip header row across multiple input files
        first_col = row[0].strip().lower()
        if first_col in ("src ip dec", "src_ip_dec", "flow id") or (len(row) > 4 and row[4].strip().lower() == "protocol"):
            headers_skipped += 1
            continue
            
        # Validate column length (Standard schema has 89 columns)
        if len(row) < 88:
            sys.stderr.write(f"WARNING: Malformed row with insufficient columns ({len(row)}): {row[:5]}\n")
            malformed_records += 1
            continue
            
        try:
            # Source IP (Column 0)
            src_ip_dec = int(row[0].strip())
            if not (0 <= src_ip_dec <= 4294967295):
                sys.stderr.write(f"WARNING: Source IP out of 32-bit unsigned range: {src_ip_dec}\n")
                malformed_records += 1
                continue
                
            # Destination IP (Column 2)
            dst_ip_dec = int(row[2].strip())
            if not (0 <= dst_ip_dec <= 4294967295):
                sys.stderr.write(f"WARNING: Destination IP out of 32-bit unsigned range: {dst_ip_dec}\n")
                malformed_records += 1
                continue
                
            # Destination Port (Column 3)
            dst_port = int(row[3].strip())
            if not (0 <= dst_port <= 65535):
                sys.stderr.write(f"WARNING: Destination port out of valid range (0-65535): {dst_port}\n")
                malformed_records += 1
                continue
                
            # Packet and Byte counts
            # Total Fwd Packet (Col 7), Total Bwd packets (Col 8)
            fwd_pkts = int(float(row[7].strip()))
            bwd_pkts = int(float(row[8].strip()))
            
            # Total Length of Fwd Packet (Col 9), Total Length of Bwd Packet (Col 10)
            fwd_bytes = int(float(row[9].strip()))
            bwd_bytes = int(float(row[10].strip()))
            
            if fwd_pkts < 0 or bwd_pkts < 0 or fwd_bytes < 0 or bwd_bytes < 0:
                sys.stderr.write(f"WARNING: Negative traffic metrics: fwd_p={fwd_pkts}, bwd_p={bwd_pkts}, fwd_b={fwd_bytes}, bwd_b={bwd_bytes}\n")
                malformed_records += 1
                continue
                
            # Ground truth label (Col 87)
            label = row[87].strip()
            is_benign = 1 if label.upper() == "BENIGN" else 0
            is_attack = 0 if is_benign == 1 else 1
            
            # Emit key and compact value tuple to stdout
            print(f"{src_ip_dec}\t{fwd_pkts},{bwd_pkts},{fwd_bytes},{bwd_bytes},{is_benign},{is_attack},{dst_ip_dec},{dst_port}")
            records_processed += 1
            
        except (ValueError, IndexError) as err:
            sys.stderr.write(f"WARNING: Parse error on row: {err} | sample: {row[:5]}\n")
            malformed_records += 1
            continue

    sys.stderr.write(
        f"Mapper Summary: processed={records_processed}, headers_skipped={headers_skipped}, malformed={malformed_records}\n"
    )

if __name__ == "__main__":
    main()
