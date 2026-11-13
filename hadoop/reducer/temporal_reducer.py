#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 6 Reducer: Temporal Traffic Analytics
Aggregates network flow statistics per minute window from sorted mapper output.
"""

import sys

def emit_temporal_group(minute, flows, fwd_p, bwd_p, fwd_b, bwd_b, benign, attack, tcp, udp, other):
    tot_p = fwd_p + bwd_p
    tot_b = fwd_b + bwd_b
    print(
        f"{minute}\t{flows}\t{fwd_p}\t{bwd_p}\t{tot_p}\t"
        f"{fwd_b}\t{bwd_b}\t{tot_b}\t{benign}\t{attack}\t"
        f"{tcp}\t{udp}\t{other}"
    )

def main():
    current_min = None
    
    flows = 0
    fwd_p = 0
    bwd_p = 0
    fwd_b = 0
    bwd_b = 0
    benign = 0
    attack = 0
    tcp = 0
    udp = 0
    other = 0
    
    unique_mins = 0
    total_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            m = parts[0]
            val_parts = parts[1].split(",")
            if len(val_parts) < 7:
                continue
                
            fp = int(val_parts[0])
            bp = int(val_parts[1])
            fb = int(val_parts[2])
            bb = int(val_parts[3])
            is_b = int(val_parts[4])
            is_a = int(val_parts[5])
            pr = int(val_parts[6])
            
        except ValueError:
            continue
            
        total_records += 1
        
        if current_min == m:
            flows += 1
            fwd_p += fp
            bwd_p += bp
            fwd_b += fb
            bwd_b += bb
            benign += is_b
            attack += is_a
            if pr == 6: tcp += 1
            elif pr == 17: udp += 1
            else: other += 1
        else:
            if current_min is not None:
                emit_temporal_group(current_min, flows, fwd_p, bwd_p, fwd_b, bwd_b, benign, attack, tcp, udp, other)
                unique_mins += 1
                
            current_min = m
            flows = 1
            fwd_p = fp
            bwd_p = bp
            fwd_b = fb
            bwd_b = bb
            benign = is_b
            attack = is_a
            tcp = 1 if pr == 6 else 0
            udp = 1 if pr == 17 else 0
            other = 1 if pr not in (6, 17) else 0
            
    if current_min is not None:
        emit_temporal_group(current_min, flows, fwd_p, bwd_p, fwd_b, bwd_b, benign, attack, tcp, udp, other)
        unique_mins += 1
        
    sys.stderr.write(
        f"Job 6 Reducer Summary: unique_minutes={unique_mins}, total_flows_reduced={total_records}\n"
    )

if __name__ == "__main__":
    main()
