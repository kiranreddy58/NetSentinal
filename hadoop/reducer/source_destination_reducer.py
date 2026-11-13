#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 8 Reducer: Source-Destination Correlation
Aggregates network flow statistics per (SrcIP, DstIP) communication pair from sorted mapper output.
"""

import sys
from collections import Counter

def dec_to_ipv4(dec_val):
    return f"{(dec_val >> 24) & 255}.{(dec_val >> 16) & 255}.{(dec_val >> 8) & 255}.{dec_val & 255}"

def emit_pair_group(pair_key, flows, fwd_p, bwd_p, fwd_b, bwd_b, benign, attack, ports, proto_counts):
    parts = pair_key.split("_")
    s_dec = int(parts[0])
    d_dec = int(parts[1])
    s_ip = dec_to_ipv4(s_dec)
    d_ip = dec_to_ipv4(d_dec)
    
    tot_p = fwd_p + bwd_p
    tot_b = fwd_b + bwd_b
    u_ports = len(ports)
    primary_proto = proto_counts.most_common(1)[0][0] if proto_counts else 6
    p_name = "TCP" if primary_proto == 6 else ("UDP" if primary_proto == 17 else f"Proto-{primary_proto}")
    
    print(
        f"{s_dec}\t{s_ip}\t{d_dec}\t{d_ip}\t{flows}\t{tot_p}\t{tot_b}\t"
        f"{benign}\t{attack}\t{u_ports}\t{p_name}"
    )

def main():
    current_pair = None
    
    flows = 0
    fwd_p = 0
    bwd_p = 0
    fwd_b = 0
    bwd_b = 0
    benign = 0
    attack = 0
    ports = set()
    proto_counts = Counter()
    
    unique_pairs = 0
    total_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            pair_key = parts[0]
            val_parts = parts[1].split(",")
            if len(val_parts) < 8:
                continue
                
            fp = int(val_parts[0])
            bp = int(val_parts[1])
            fb = int(val_parts[2])
            bb = int(val_parts[3])
            is_b = int(val_parts[4])
            is_a = int(val_parts[5])
            dport = int(val_parts[6])
            proto = int(val_parts[7])
            
        except ValueError:
            continue
            
        total_records += 1
        
        if current_pair == pair_key:
            flows += 1
            fwd_p += fp
            bwd_p += bp
            fwd_b += fb
            bwd_b += bb
            benign += is_b
            attack += is_a
            ports.add(dport)
            proto_counts[proto] += 1
        else:
            if current_pair is not None:
                emit_pair_group(current_pair, flows, fwd_p, bwd_p, fwd_b, bwd_b, benign, attack, ports, proto_counts)
                unique_pairs += 1
                
            current_pair = pair_key
            flows = 1
            fwd_p = fp
            bwd_p = bp
            fwd_b = fb
            bwd_b = bb
            benign = is_b
            attack = is_a
            ports = {dport}
            proto_counts = Counter({proto: 1})
            
    if current_pair is not None:
        emit_pair_group(current_pair, flows, fwd_p, bwd_p, fwd_b, bwd_b, benign, attack, ports, proto_counts)
        unique_pairs += 1
        
    sys.stderr.write(
        f"Job 8 Reducer Summary: unique_pairs={unique_pairs}, total_flows_reduced={total_records}\n"
    )

if __name__ == "__main__":
    main()
