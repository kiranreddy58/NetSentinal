#!/usr/bin/env python3
"""
NetSentinel - MapReduce Job 9: Suspicious Behavior Detection Mapper
Analyzes flow characteristics against standard column indices:
col 0: Source IP dec
col 1: Source Port
col 2: Dest IP dec
col 3: Dest Port
col 4: Protocol
col 5: Timestamp
col 6: Flow Duration
col 7: Total Fwd Packets
col 8: Total Backward Packets
col 9: Total Length of Fwd Packets
col 10: Total Length of Bwd Packets
col 87: Label

Key emitted: heuristic_type
Value emitted: 1,fwd_pkts,bwd_pkts,tot_bytes,is_attack
"""
import sys
import csv

def main():
    reader = csv.reader(sys.stdin)
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
            duration = float(row[6].strip())
            fwd_pkts = int(float(row[7].strip()))
            bwd_pkts = int(float(row[8].strip()))
            fwd_bytes = int(float(row[9].strip()))
            bwd_bytes = int(float(row[10].strip()))
            label = row[87].strip()
            
            is_attack = 0 if label.upper() == "BENIGN" else 1
            tot_pkts = fwd_pkts + bwd_pkts
            tot_bytes = fwd_bytes + bwd_bytes
            
            # Evaluate heuristics:
            # Heuristic 1: Port Scan Candidate (<= 3 pkts total and duration < 100,000 microseconds)
            if tot_pkts <= 3 and duration < 100000:
                print(f"HEURISTIC_PORT_SCAN\t1,{fwd_pkts},{bwd_pkts},{tot_bytes},{is_attack}")
                
            # Heuristic 2: Volume Flood / DoS Candidate (tot_pkts > 500 or tot_bytes > 500,000)
            if tot_pkts > 500 or tot_bytes > 500000:
                print(f"HEURISTIC_VOLUME_FLOOD\t1,{fwd_pkts},{bwd_pkts},{tot_bytes},{is_attack}")
                
            # Heuristic 3: Slowloris / Low & Slow (duration > 10,000,000 microsec and tot_pkts <= 10)
            if duration > 10000000 and tot_pkts <= 10:
                print(f"HEURISTIC_SLOW_RATE\t1,{fwd_pkts},{bwd_pkts},{tot_bytes},{is_attack}")
                
            # Heuristic 4: Data Exfiltration / Heavy Outbound (fwd_bytes > 100,000 and fwd_bytes > 10 * max(1, bwd_bytes))
            if fwd_bytes > 100000 and fwd_bytes > 10 * max(1, bwd_bytes):
                print(f"HEURISTIC_DATA_EXFIL\t1,{fwd_pkts},{bwd_pkts},{tot_bytes},{is_attack}")
                
            # Baseline counter for comparison
            print(f"TOTAL_FLOWS_EVALUATED\t1,{fwd_pkts},{bwd_pkts},{tot_bytes},{is_attack}")

        except (ValueError, IndexError):
            malformed_records += 1
            continue

if __name__ == '__main__':
    main()
