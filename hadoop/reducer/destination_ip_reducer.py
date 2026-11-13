#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 2 Reducer: Destination IP Analytics
Aggregates network flow statistics per destination IP from sorted mapper output.
"""

import sys
from collections import Counter

def dec_to_ipv4(dec_val):
    return f"{(dec_val >> 24) & 255}.{(dec_val >> 16) & 255}.{(dec_val >> 8) & 255}.{dec_val & 255}"

def emit_group(dst_ip_dec, total_flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, benign_cnt, attack_cnt, src_ips, attack_counter):
    dst_ip = dec_to_ipv4(dst_ip_dec)
    total_pkts = fwd_pkts + bwd_pkts
    total_bytes = fwd_bytes + bwd_bytes
    unique_src_count = len(src_ips)
    
    if attack_counter:
        dominant_attack = attack_counter.most_common(1)[0][0]
    else:
        dominant_attack = "NONE"
        
    print(
        f"{dst_ip_dec}\t{dst_ip}\t{total_flows}\t{unique_src_count}\t{fwd_pkts}\t{bwd_pkts}\t{total_pkts}\t"
        f"{fwd_bytes}\t{bwd_bytes}\t{total_bytes}\t{benign_cnt}\t{attack_cnt}\t{dominant_attack}"
    )

def main():
    current_dst_ip = None
    
    total_flows = 0
    total_fwd_pkts = 0
    total_bwd_pkts = 0
    total_fwd_bytes = 0
    total_bwd_bytes = 0
    benign_cnt = 0
    attack_cnt = 0
    src_ips = set()
    attack_counter = Counter()
    
    unique_dst_ips = 0
    total_input_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            dst_ip_dec = int(parts[0])
            val_parts = parts[1].split(",")
            if len(val_parts) < 8:
                continue
                
            fwd_pkts = int(val_parts[0])
            bwd_pkts = int(val_parts[1])
            fwd_bytes = int(val_parts[2])
            bwd_bytes = int(val_parts[3])
            is_benign = int(val_parts[4])
            is_attack = int(val_parts[5])
            src_ip_dec = int(val_parts[6])
            label = val_parts[7]
            
        except ValueError:
            continue
            
        total_input_records += 1
        
        if current_dst_ip == dst_ip_dec:
            total_flows += 1
            total_fwd_pkts += fwd_pkts
            total_bwd_pkts += bwd_pkts
            total_fwd_bytes += fwd_bytes
            total_bwd_bytes += bwd_bytes
            benign_cnt += is_benign
            attack_cnt += is_attack
            src_ips.add(src_ip_dec)
            if is_attack == 1 and label.upper() != "BENIGN":
                attack_counter[label] += 1
        else:
            if current_dst_ip is not None:
                emit_group(
                    current_dst_ip, total_flows, total_fwd_pkts, total_bwd_pkts,
                    total_fwd_bytes, total_bwd_bytes, benign_cnt, attack_cnt,
                    src_ips, attack_counter
                )
                unique_dst_ips += 1
                
            current_dst_ip = dst_ip_dec
            total_flows = 1
            total_fwd_pkts = fwd_pkts
            total_bwd_pkts = bwd_pkts
            total_fwd_bytes = fwd_bytes
            total_bwd_bytes = bwd_bytes
            benign_cnt = is_benign
            attack_cnt = is_attack
            src_ips = {src_ip_dec}
            attack_counter = Counter()
            if is_attack == 1 and label.upper() != "BENIGN":
                attack_counter[label] = 1
                
    if current_dst_ip is not None:
        emit_group(
            current_dst_ip, total_flows, total_fwd_pkts, total_bwd_pkts,
            total_fwd_bytes, total_bwd_bytes, benign_cnt, attack_cnt,
            src_ips, attack_counter
        )
        unique_dst_ips += 1
        
    sys.stderr.write(
        f"Job 2 Reducer Summary: unique_dest_ips={unique_dst_ips}, total_flows_reduced={total_input_records}\n"
    )

if __name__ == "__main__":
    main()
