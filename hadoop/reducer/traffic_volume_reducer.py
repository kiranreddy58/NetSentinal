#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 5 Reducer: Traffic Volume Analytics
Aggregates network flow statistics per volume tier from sorted mapper output.
"""

import sys

def emit_tier_group(tier, flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, total_bytes, min_b, max_b):
    total_pkts = fwd_pkts + bwd_pkts
    avg_flow_bytes = round(total_bytes / flows, 2) if flows > 0 else 0.0
    
    print(
        f"{tier}\t{flows}\t{fwd_pkts}\t{bwd_pkts}\t{total_pkts}\t"
        f"{fwd_bytes}\t{bwd_bytes}\t{total_bytes}\t{avg_flow_bytes}\t"
        f"{min_b}\t{max_b}"
    )

def main():
    current_tier = None
    
    flows = 0
    fwd_pkts = 0
    bwd_pkts = 0
    fwd_bytes = 0
    bwd_bytes = 0
    total_bytes = 0
    min_b = float("inf")
    max_b = 0
    
    total_records = 0
    unique_tiers = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            tier = parts[0]
            val_parts = parts[1].split(",")
            if len(val_parts) < 5:
                continue
                
            fp = int(val_parts[0])
            bp = int(val_parts[1])
            fb = int(val_parts[2])
            bb = int(val_parts[3])
            tb = int(val_parts[4])
            
        except ValueError:
            continue
            
        total_records += 1
        
        if current_tier == tier:
            flows += 1
            fwd_pkts += fp
            bwd_pkts += bp
            fwd_bytes += fb
            bwd_bytes += bb
            total_bytes += tb
            if tb < min_b: min_b = tb
            if tb > max_b: max_b = tb
        else:
            if current_tier is not None:
                emit_tier_group(current_tier, flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, total_bytes, min_b, max_b)
                unique_tiers += 1
                
            current_tier = tier
            flows = 1
            fwd_pkts = fp
            bwd_pkts = bp
            fwd_bytes = fb
            bwd_bytes = bb
            total_bytes = tb
            min_b = tb
            max_b = tb
            
    if current_tier is not None:
        emit_tier_group(current_tier, flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, total_bytes, min_b, max_b)
        unique_tiers += 1
        
    sys.stderr.write(
        f"Job 5 Reducer Summary: unique_tiers={unique_tiers}, total_flows_reduced={total_records}\n"
    )

if __name__ == "__main__":
    main()
