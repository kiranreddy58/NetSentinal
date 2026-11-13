#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 4 Reducer: Protocol Analytics
Aggregates network flow statistics per protocol from sorted mapper output.
"""

import sys

PROTO_NAMES = {
    6: "TCP",
    17: "UDP",
    1: "ICMP",
    0: "HOPOPT",
    2: "IGMP",
    47: "GRE",
    50: "ESP",
    51: "AH",
    58: "IPv6-ICMP",
    89: "OSPF",
    112: "VRRP",
    132: "SCTP"
}

def emit_proto_group(proto, total_flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, total_dur, benign_cnt, attack_cnt):
    proto_name = PROTO_NAMES.get(proto, f"Protocol-{proto}")
    total_pkts = fwd_pkts + bwd_pkts
    total_bytes = fwd_bytes + bwd_bytes
    avg_duration = round(total_dur / total_flows, 2) if total_flows > 0 else 0.0
    avg_pkt_size = round(total_bytes / total_pkts, 2) if total_pkts > 0 else 0.0
    
    print(
        f"{proto}\t{proto_name}\t{total_flows}\t{fwd_pkts}\t{bwd_pkts}\t{total_pkts}\t"
        f"{fwd_bytes}\t{bwd_bytes}\t{total_bytes}\t{avg_duration}\t{avg_pkt_size}\t"
        f"{benign_cnt}\t{attack_cnt}"
    )

def main():
    current_proto = None
    
    total_flows = 0
    total_fwd_pkts = 0
    total_bwd_pkts = 0
    total_fwd_bytes = 0
    total_bwd_bytes = 0
    total_dur = 0.0
    benign_cnt = 0
    attack_cnt = 0
    
    unique_protos = 0
    total_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            proto = int(parts[0])
            val_parts = parts[1].split(",")
            if len(val_parts) < 7:
                continue
                
            fwd_pkts = int(val_parts[0])
            bwd_pkts = int(val_parts[1])
            fwd_bytes = int(val_parts[2])
            bwd_bytes = int(val_parts[3])
            dur = float(val_parts[4])
            is_benign = int(val_parts[5])
            is_attack = int(val_parts[6])
            
        except ValueError:
            continue
            
        total_records += 1
        
        if current_proto == proto:
            total_flows += 1
            total_fwd_pkts += fwd_pkts
            total_bwd_pkts += bwd_pkts
            total_fwd_bytes += fwd_bytes
            total_bwd_bytes += bwd_bytes
            total_dur += dur
            benign_cnt += is_benign
            attack_cnt += is_attack
        else:
            if current_proto is not None:
                emit_proto_group(
                    current_proto, total_flows, total_fwd_pkts, total_bwd_pkts,
                    total_fwd_bytes, total_bwd_bytes, total_dur, benign_cnt, attack_cnt
                )
                unique_protos += 1
                
            current_proto = proto
            total_flows = 1
            total_fwd_pkts = fwd_pkts
            total_bwd_pkts = bwd_pkts
            total_fwd_bytes = fwd_bytes
            total_bwd_bytes = bwd_bytes
            total_dur = dur
            benign_cnt = is_benign
            attack_cnt = is_attack
            
    if current_proto is not None:
        emit_proto_group(
            current_proto, total_flows, total_fwd_pkts, total_bwd_pkts,
            total_fwd_bytes, total_bwd_bytes, total_dur, benign_cnt, attack_cnt
        )
        unique_protos += 1
        
    sys.stderr.write(
        f"Job 4 Reducer Summary: unique_protocols={unique_protos}, total_flows_reduced={total_records}\n"
    )

if __name__ == "__main__":
    main()
