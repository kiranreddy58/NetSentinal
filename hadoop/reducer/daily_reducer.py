#!/usr/bin/env python3
"""
NetSentinel - MapReduce Job 10: Daily Comparative Analytics Reducer
Aggregates traffic patterns across days of the week.
Outputs:
day_name,total_flows,total_fwd_packets,total_bwd_packets,total_packets,total_bytes,benign_flows,attack_flows,attack_percentage
"""
import sys

def main():
    current_day = None
    flows = 0
    fwd_pkts = 0
    bwd_pkts = 0
    tot_bytes = 0
    benign_count = 0
    attack_count = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            day, val = line.split('\t', 1)
            parts = val.split(',')
            c = int(parts[0])
            fp = int(parts[1])
            bp = int(parts[2])
            tb = int(parts[3])
            bn = int(parts[4])
            at = int(parts[5])
        except (ValueError, IndexError):
            continue
            
        if current_day == day:
            flows += c
            fwd_pkts += fp
            bwd_pkts += bp
            tot_bytes += tb
            benign_count += bn
            attack_count += at
        else:
            if current_day is not None:
                emit_record(current_day, flows, fwd_pkts, bwd_pkts, tot_bytes, benign_count, attack_count)
            current_day = day
            flows = c
            fwd_pkts = fp
            bwd_pkts = bp
            tot_bytes = tb
            benign_count = bn
            attack_count = at
            
    if current_day is not None:
        emit_record(current_day, flows, fwd_pkts, bwd_pkts, tot_bytes, benign_count, attack_count)

def emit_record(day, f_cnt, f_pkts, b_pkts, bytes_val, b_cnt, a_cnt):
    tot_p = f_pkts + b_pkts
    atk_pct = (a_cnt / f_cnt * 100.0) if f_cnt > 0 else 0.0
    print(f"{day}\t{f_cnt},{f_pkts},{b_pkts},{tot_p},{bytes_val},{b_cnt},{a_cnt},{atk_pct:.2f}")

if __name__ == '__main__':
    main()
