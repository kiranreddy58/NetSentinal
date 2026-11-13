#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 1 Reducer: Source IP Analytics
Aggregates network flow statistics per source IP from sorted mapper output.
"""

import sys

def dec_to_ipv4(dec_val):
    return f"{(dec_val >> 24) & 255}.{(dec_val >> 16) & 255}.{(dec_val >> 8) & 255}.{dec_val & 255}"

def emit_group(src_ip_dec, total_flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, benign_cnt, attack_cnt, dst_ips, dst_ports):
    src_ip = dec_to_ipv4(src_ip_dec)
    total_pkts = fwd_pkts + bwd_pkts
    total_bytes = fwd_bytes + bwd_bytes
    distinct_dst_ips = len(dst_ips)
    distinct_dst_ports = len(dst_ports)
    
    print(
        f"{src_ip_dec}\t{src_ip}\t{total_flows}\t{fwd_pkts}\t{bwd_pkts}\t{total_pkts}\t"
        f"{fwd_bytes}\t{bwd_bytes}\t{total_bytes}\t{benign_cnt}\t{attack_cnt}\t"
        f"{distinct_dst_ips}\t{distinct_dst_ports}"
    )

def main():
    current_src_ip = None
    
    total_flows = 0
    total_fwd_pkts = 0
    total_bwd_pkts = 0
    total_fwd_bytes = 0
    total_bwd_bytes = 0
    benign_cnt = 0
    attack_cnt = 0
    dst_ips = set()
    dst_ports = set()
    
    unique_src_ips = 0
    total_input_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            sys.stderr.write(f"WARNING: Malformed reducer input line: {line}\n")
            continue
            
        try:
            src_ip_dec = int(parts[0])
            val_parts = parts[1].split(",")
            if len(val_parts) != 8:
                sys.stderr.write(f"WARNING: Invalid value tuple length ({len(val_parts)}): {parts[1]}\n")
                continue
                
            fwd_pkts = int(val_parts[0])
            bwd_pkts = int(val_parts[1])
            fwd_bytes = int(val_parts[2])
            bwd_bytes = int(val_parts[3])
            is_benign = int(val_parts[4])
            is_attack = int(val_parts[5])
            dst_ip_dec = int(val_parts[6])
            dst_port = int(val_parts[7])
            
        except ValueError as err:
            sys.stderr.write(f"WARNING: Reducer parse error: {err} on line: {line}\n")
            continue
            
        total_input_records += 1
        
        if current_src_ip == src_ip_dec:
            total_flows += 1
            total_fwd_pkts += fwd_pkts
            total_bwd_pkts += bwd_pkts
            total_fwd_bytes += fwd_bytes
            total_bwd_bytes += bwd_bytes
            benign_cnt += is_benign
            attack_cnt += is_attack
            dst_ips.add(dst_ip_dec)
            dst_ports.add(dst_port)
        else:
            if current_src_ip is not None:
                emit_group(
                    current_src_ip, total_flows, total_fwd_pkts, total_bwd_pkts,
                    total_fwd_bytes, total_bwd_bytes, benign_cnt, attack_cnt,
                    dst_ips, dst_ports
                )
                unique_src_ips += 1
                
            current_src_ip = src_ip_dec
            total_flows = 1
            total_fwd_pkts = fwd_pkts
            total_bwd_pkts = bwd_pkts
            total_fwd_bytes = fwd_bytes
            total_bwd_bytes = bwd_bytes
            benign_cnt = is_benign
            attack_cnt = is_attack
            dst_ips = {dst_ip_dec}
            dst_ports = {dst_port}
            
    # Emit final group
    if current_src_ip is not None:
        emit_group(
            current_src_ip, total_flows, total_fwd_pkts, total_bwd_pkts,
            total_fwd_bytes, total_bwd_bytes, benign_cnt, attack_cnt,
            dst_ips, dst_ports
        )
        unique_src_ips += 1
        
    sys.stderr.write(
        f"Reducer Summary: unique_source_ips={unique_src_ips}, total_flows_reduced={total_input_records}\n"
    )

if __name__ == "__main__":
    main()
