#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 3 Reducer: Destination Port Analytics
Aggregates network flow statistics per destination port from sorted mapper output.
"""

import sys

PORT_NAMES = {
    80: "HTTP", 443: "HTTPS", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
    53: "DNS", 67: "DHCP", 68: "DHCP", 69: "TFTP", 110: "POP3", 123: "NTP",
    137: "NetBIOS", 138: "NetBIOS", 139: "NetBIOS", 143: "IMAP", 161: "SNMP",
    389: "LDAP", 445: "SMB", 636: "LDAPS", 993: "IMAPS", 995: "POP3S",
    1433: "MSSQL", 1521: "Oracle", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
    8080: "HTTP-Proxy", 8443: "HTTPS-Alt", 0: "Reserved/Wildcard"
}

def emit_port_group(dst_port, total_flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, benign_cnt, attack_cnt, src_ips, dst_ips, tcp_cnt, udp_cnt, other_cnt):
    port_name = PORT_NAMES.get(dst_port, f"Port-{dst_port}")
    total_pkts = fwd_pkts + bwd_pkts
    total_bytes = fwd_bytes + bwd_bytes
    unique_srcs = len(src_ips)
    unique_dsts = len(dst_ips)
    
    # Explainable scan indicator:
    # High source diversity with low flow-to-source ratio indicates horizontal port probe
    # High attack ratio on non-standard ports indicates exploit targeting
    if attack_cnt > 0 and (attack_cnt / total_flows) > 0.5 and dst_port not in (80, 443):
        scan_indicator = "HIGH_MALICIOUS_PROBING"
    elif unique_srcs > 50 and (total_flows / unique_srcs) < 2.0:
        scan_indicator = "DISTRIBUTED_SCAN_TARGET"
    elif total_flows > 1000 and attack_cnt > 500:
        scan_indicator = "ATTACK_HOTSPOT"
    elif total_flows > 5000:
        scan_indicator = "HIGH_VOLUME_SERVICE"
    else:
        scan_indicator = "NORMAL"
        
    print(
        f"{dst_port}\t{port_name}\t{total_flows}\t{unique_srcs}\t{unique_dsts}\t"
        f"{fwd_pkts}\t{bwd_pkts}\t{total_pkts}\t{fwd_bytes}\t{bwd_bytes}\t{total_bytes}\t"
        f"{benign_cnt}\t{attack_cnt}\t{tcp_cnt}\t{udp_cnt}\t{other_cnt}\t{scan_indicator}"
    )

def main():
    current_port = None
    
    total_flows = 0
    total_fwd_pkts = 0
    total_bwd_pkts = 0
    total_fwd_bytes = 0
    total_bwd_bytes = 0
    benign_cnt = 0
    attack_cnt = 0
    tcp_cnt = 0
    udp_cnt = 0
    other_cnt = 0
    src_ips = set()
    dst_ips = set()
    
    unique_ports = 0
    total_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            dst_port = int(parts[0])
            val_parts = parts[1].split(",")
            if len(val_parts) < 9:
                continue
                
            fwd_pkts = int(val_parts[0])
            bwd_pkts = int(val_parts[1])
            fwd_bytes = int(val_parts[2])
            bwd_bytes = int(val_parts[3])
            is_benign = int(val_parts[4])
            is_attack = int(val_parts[5])
            src_ip = int(val_parts[6])
            dst_ip = int(val_parts[7])
            proto = int(val_parts[8])
            
        except ValueError:
            continue
            
        total_records += 1
        
        if current_port == dst_port:
            total_flows += 1
            total_fwd_pkts += fwd_pkts
            total_bwd_pkts += bwd_pkts
            total_fwd_bytes += fwd_bytes
            total_bwd_bytes += bwd_bytes
            benign_cnt += is_benign
            attack_cnt += is_attack
            src_ips.add(src_ip)
            dst_ips.add(dst_ip)
            if proto == 6: tcp_cnt += 1
            elif proto == 17: udp_cnt += 1
            else: other_cnt += 1
        else:
            if current_port is not None:
                emit_port_group(
                    current_port, total_flows, total_fwd_pkts, total_bwd_pkts,
                    total_fwd_bytes, total_bwd_bytes, benign_cnt, attack_cnt,
                    src_ips, dst_ips, tcp_cnt, udp_cnt, other_cnt
                )
                unique_ports += 1
                
            current_port = dst_port
            total_flows = 1
            total_fwd_pkts = fwd_pkts
            total_bwd_pkts = bwd_pkts
            total_fwd_bytes = fwd_bytes
            total_bwd_bytes = bwd_bytes
            benign_cnt = is_benign
            attack_cnt = is_attack
            src_ips = {src_ip}
            dst_ips = {dst_ip}
            tcp_cnt = 1 if proto == 6 else 0
            udp_cnt = 1 if proto == 17 else 0
            other_cnt = 1 if proto not in (6, 17) else 0
            
    if current_port is not None:
        emit_port_group(
            current_port, total_flows, total_fwd_pkts, total_bwd_pkts,
            total_fwd_bytes, total_bwd_bytes, benign_cnt, attack_cnt,
            src_ips, dst_ips, tcp_cnt, udp_cnt, other_cnt
        )
        unique_ports += 1
        
    sys.stderr.write(
        f"Job 3 Reducer Summary: unique_ports={unique_ports}, total_flows_reduced={total_records}\n"
    )

if __name__ == "__main__":
    main()
