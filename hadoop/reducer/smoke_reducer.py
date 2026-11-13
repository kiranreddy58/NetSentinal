#!/usr/bin/env python3
"""
NetSentinel — MapReduce Smoke Test Reducer (Phase 6)
Aggregates flow counts per protocol from sorted mapper output.
"""

import sys

def main():
    current_key = None
    current_count = 0
    total_records_reduced = 0
    unique_keys_count = 0
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split("\t")
        if len(parts) != 2:
            sys.stderr.write(f"WARNING: Malformed reducer input line: {line}\n")
            continue
            
        key, val_str = parts
        try:
            val = int(val_str)
        except ValueError:
            sys.stderr.write(f"WARNING: Non-integer reducer count: {val_str}\n")
            continue
            
        if current_key == key:
            current_count += val
        else:
            if current_key is not None:
                # Emit aggregated result
                print(f"{current_key}\t{current_count}")
                unique_keys_count += 1
            current_key = key
            current_count = val
            
        total_records_reduced += val
        
    # Emit final key
    if current_key is not None:
        print(f"{current_key}\t{current_count}")
        unique_keys_count += 1
        
    sys.stderr.write(
        f"Reducer Summary: unique_keys={unique_keys_count}, total_flows_reduced={total_records_reduced}\n"
    )

if __name__ == "__main__":
    main()
