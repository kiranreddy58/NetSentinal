#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 7 Reducer: Attack Label Analytics
Aggregates network flow statistics per ground-truth attack label from sorted mapper output.
"""

import sys

TOTAL_DATASET_FLOWS = 2099971

def get_high_level_category(label):
    lbl = label.upper()
    if lbl == "BENIGN": return "BENIGN"
    elif "DDOS" in lbl: return "DISTRIBUTED_DOS"
    elif "DOS" in lbl: return "DENIAL_OF_SERVICE"
    elif "PORTSCAN" in lbl: return "RECONNAISSANCE"
    elif "PATATOR" in lbl: return "BRUTE_FORCE"
    elif "WEB ATTACK" in lbl: return "WEB_APPLICATION"
    elif "BOTNET" in lbl: return "BOTNET"
    elif "INFILTRATION" in lbl: return "INFILTRATION"
    elif "HEARTBLEED" in lbl: return "VULNERABILITY_EXPLOIT"
    else: return "OTHER_ATTACK"

def emit_label_group(label, flows, fwd_p, bwd_p, fwd_b, bwd_b, dur, srcs, dsts):
    category = get_high_level_category(label)
    tot_p = fwd_p + bwd_p
    tot_b = fwd_b + bwd_b
    avg_dur = round(dur / flows, 2) if flows > 0 else 0.0
    pct = round((flows / TOTAL_DATASET_FLOWS) * 100, 4)
    u_srcs = len(srcs)
    u_dsts = len(dsts)
    
    print(
        f"{label}\t{category}\t{flows}\t{u_srcs}\t{u_dsts}\t"
        f"{fwd_p}\t{bwd_p}\t{tot_p}\t{fwd_b}\t{bwd_b}\t{tot_b}\t"
        f"{avg_dur}\t{pct}"
    )

def main():
    current_label = None
    
    flows = 0
    fwd_p = 0
    bwd_p = 0
    fwd_b = 0
    bwd_b = 0
    tot_dur = 0.0
    srcs = set()
    dsts = set()
    
    unique_labels = 0
    total_records = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            continue
            
        try:
            lbl = parts[0]
            val_parts = parts[1].split(",")
            if len(val_parts) < 7:
                continue
                
            fp = int(val_parts[0])
            bp = int(val_parts[1])
            fb = int(val_parts[2])
            bb = int(val_parts[3])
            d = float(val_parts[4])
            s = int(val_parts[5])
            dst = int(val_parts[6])
            
        except ValueError:
            continue
            
        total_records += 1
        
        if current_label == lbl:
            flows += 1
            fwd_p += fp
            bwd_p += bp
            fwd_b += fb
            bwd_b += bb
            tot_dur += d
            srcs.add(s)
            dsts.add(dst)
        else:
            if current_label is not None:
                emit_label_group(current_label, flows, fwd_p, bwd_p, fwd_b, bwd_b, tot_dur, srcs, dsts)
                unique_labels += 1
                
            current_label = lbl
            flows = 1
            fwd_p = fp
            bwd_p = bp
            fwd_b = fb
            bwd_b = bb
            tot_dur = d
            srcs = {s}
            dsts = {dst}
            
    if current_label is not None:
        emit_label_group(current_label, flows, fwd_p, bwd_p, fwd_b, bwd_b, tot_dur, srcs, dsts)
        unique_labels += 1
        
    sys.stderr.write(
        f"Job 7 Reducer Summary: unique_labels={unique_labels}, total_flows_reduced={total_records}\n"
    )

if __name__ == "__main__":
    main()
