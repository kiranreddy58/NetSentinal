#!/usr/bin/env python3
"""
NetSentinel - MapReduce Job 9: Suspicious Behavior Detection Reducer
Aggregates heuristic detections and computes:
- Flagged flow count
- Attack ground truth count (True Positives against label)
- Benign ground truth count (False Positives against label)
- Total packets and total bytes
- Detection precision / attack correlation percentage
"""
import sys

def main():
    current_key = None
    flow_count = 0
    fwd_pkts = 0
    bwd_pkts = 0
    tot_bytes = 0
    attack_count = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            key, val = line.split('\t', 1)
            parts = val.split(',')
            cnt = int(parts[0])
            fpkt = int(parts[1])
            bpkt = int(parts[2])
            tbytes = int(parts[3])
            is_atk = int(parts[4])
        except (ValueError, IndexError):
            continue
            
        if current_key == key:
            flow_count += cnt
            fwd_pkts += fpkt
            bwd_pkts += bpkt
            tot_bytes += tbytes
            attack_count += is_atk
        else:
            if current_key is not None:
                emit_record(current_key, flow_count, fwd_pkts, bwd_pkts, tot_bytes, attack_count)
            current_key = key
            flow_count = cnt
            fwd_pkts = fpkt
            bwd_pkts = bpkt
            tot_bytes = tbytes
            attack_count = is_atk
            
    if current_key is not None:
        emit_record(current_key, flow_count, fwd_pkts, bwd_pkts, tot_bytes, attack_count)

def emit_record(key, flows, fwd_p, bwd_p, bytes_val, attacks):
    benign = flows - attacks
    precision = (attacks / flows * 100.0) if flows > 0 else 0.0
    print(f"{key}\t{flows},{fwd_p},{bwd_p},{fwd_p + bwd_p},{bytes_val},{benign},{attacks},{precision:.2f}")

if __name__ == '__main__':
    main()
