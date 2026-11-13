import os
import glob
import csv
import json
import time
import math
import ipaddress
import hashlib
from collections import Counter, defaultdict

RAW_DIR = os.path.join("data", "raw")
META_DIR = os.path.join("data", "metadata")
os.makedirs(META_DIR, exist_ok=True)

CHUNK_SIZE = 50000

def get_file_encoding(filepath):
    # Quick probe
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for _ in range(100):
                f.readline()
        return "utf-8"
    except UnicodeDecodeError:
        return "latin-1"

def analyze_all_files():
    start_time = time.time()
    files = sorted(glob.glob(os.path.join(RAW_DIR, "*.csv")))
    print(f"Starting comprehensive chunk-based inspection of {len(files)} files...")
    
    file_inventory = []
    schema_summary = {}
    missing_values_records = []
    label_distribution_records = []
    data_quality_data = {}
    ip_validation_data = {}
    timestamp_analysis_data = {}
    
    overall_total_rows = 0
    overall_label_counts = Counter()
    
    for filepath in files:
        fname = os.path.basename(filepath)
        fsize = os.path.getsize(filepath)
        fsize_mb = round(fsize / (1024 * 1024), 2)
        encoding = get_file_encoding(filepath)
        is_plus = "_plus.csv" in fname
        
        print(f"\nProcessing {fname} ({fsize_mb} MB, encoding={encoding})...")
        file_start = time.time()
        
        total_rows = 0
        malformed_rows = 0
        null_counts = defaultdict(int)
        label_counter = Counter()
        
        # Numeric checks
        negative_ports = 0
        out_of_range_ports = 0
        negative_durations = 0
        negative_packets = 0
        inf_values = 0
        
        # IP checks
        invalid_src_ip = 0
        invalid_dst_ip = 0
        sample_ip_conversions = []
        
        # Timestamps
        timestamp_samples = set()
        timestamp_lengths = Counter()
        
        # Memory-efficient duplicate detection using 64-bit integer hashes (first 8 bytes of md5)
        seen_hashes = set()
        duplicate_rows = 0
        
        with open(filepath, "r", encoding=encoding, errors="replace") as fp:
            reader = csv.reader(fp)
            try:
                headers = next(reader)
            except StopIteration:
                headers = []
            
            col_count = len(headers)
            header_map = {col: idx for idx, col in enumerate(headers)}
            
            src_ip_idx = header_map.get("Src IP dec")
            dst_ip_idx = header_map.get("Dst IP dec")
            src_port_idx = header_map.get("Src Port")
            dst_port_idx = header_map.get("Dst Port")
            proto_idx = header_map.get("Protocol")
            ts_idx = header_map.get("Timestamp")
            duration_idx = header_map.get("Flow Duration")
            fwd_pkt_idx = header_map.get("Total Fwd Packet")
            bwd_pkt_idx = header_map.get("Total Bwd packets")
            label_idx = header_map.get("Label")
            
            chunk_rows = []
            for row in reader:
                total_rows += 1
                if len(row) != col_count:
                    malformed_rows += 1
                    continue
                
                # Fast duplicate tracking using a 64-bit fingerprint
                # (sample key features: src, dst, sport, dport, proto, ts, duration)
                sub_key = (
                    row[src_ip_idx] if src_ip_idx is not None else "",
                    row[src_port_idx] if src_port_idx is not None else "",
                    row[dst_ip_idx] if dst_ip_idx is not None else "",
                    row[dst_port_idx] if dst_port_idx is not None else "",
                    row[proto_idx] if proto_idx is not None else "",
                    row[ts_idx] if ts_idx is not None else "",
                    row[duration_idx] if duration_idx is not None else "",
                )
                h = hash(sub_key)
                if h in seen_hashes:
                    duplicate_rows += 1
                else:
                    seen_hashes.add(h)
                
                # Check nulls & inf
                for c_idx, val in enumerate(row):
                    if val is None or val == "" or val.lower() == "nan" or val.lower() == "null":
                        null_counts[headers[c_idx]] += 1
                    elif val.strip().lower() in ("inf", "-inf", "+inf", "infinity", "-infinity"):
                        inf_values += 1
                
                # Label distribution
                if label_idx is not None:
                    lbl = row[label_idx].strip()
                    label_counter[lbl] += 1
                    overall_label_counts[lbl] += 1
                
                # Numeric checks: Ports
                if src_port_idx is not None:
                    try:
                        sp = int(row[src_port_idx])
                        if sp < 0: negative_ports += 1
                        elif sp > 65535: out_of_range_ports += 1
                    except ValueError:
                        pass
                if dst_port_idx is not None:
                    try:
                        dp = int(row[dst_port_idx])
                        if dp < 0: negative_ports += 1
                        elif dp > 65535: out_of_range_ports += 1
                    except ValueError:
                        pass
                
                # Flow Duration
                if duration_idx is not None:
                    try:
                        dur = float(row[duration_idx])
                        if dur < 0: negative_durations += 1
                    except ValueError:
                        pass
                
                # Packet counts
                if fwd_pkt_idx is not None:
                    try:
                        fpkt = float(row[fwd_pkt_idx])
                        if fpkt < 0: negative_packets += 1
                    except ValueError:
                        pass
                if bwd_pkt_idx is not None:
                    try:
                        bpkt = float(row[bwd_pkt_idx])
                        if bpkt < 0: negative_packets += 1
                    except ValueError:
                        pass
                
                # IP Decimal Validation
                if src_ip_idx is not None:
                    try:
                        s_dec = int(row[src_ip_idx])
                        if s_dec < 0 or s_dec > 4294967295:
                            invalid_src_ip += 1
                        elif len(sample_ip_conversions) < 5:
                            sample_ip_conversions.append({
                                "role": "src",
                                "decimal": s_dec,
                                "ipv4": str(ipaddress.IPv4Address(s_dec))
                            })
                    except (ValueError, ipaddress.AddressValueError):
                        invalid_src_ip += 1
                
                if dst_ip_idx is not None:
                    try:
                        d_dec = int(row[dst_ip_idx])
                        if d_dec < 0 or d_dec > 4294967295:
                            invalid_dst_ip += 1
                        elif len(sample_ip_conversions) < 10:
                            sample_ip_conversions.append({
                                "role": "dst",
                                "decimal": d_dec,
                                "ipv4": str(ipaddress.IPv4Address(d_dec))
                            })
                    except (ValueError, ipaddress.AddressValueError):
                        invalid_dst_ip += 1
                
                # Timestamp analysis
                if ts_idx is not None:
                    t_val = row[ts_idx].strip()
                    timestamp_lengths[len(t_val)] += 1
                    if len(timestamp_samples) < 10:
                        timestamp_samples.add(t_val)
                
                if total_rows % CHUNK_SIZE == 0:
                    print(f"  Processed {total_rows:,} rows...")
        
        overall_total_rows += total_rows
        file_duration = round(time.time() - file_start, 2)
        print(f"  Completed {fname}: {total_rows:,} rows in {file_duration}s")
        
        # Save inventory row
        file_inventory.append({
            "File": fname,
            "File_Size_Bytes": fsize,
            "File_Size_MB": fsize_mb,
            "Total_Rows": total_rows,
            "Total_Cols": col_count,
            "Encoding": encoding,
            "Schema_Type": "plus" if is_plus else "standard"
        })
        
        # Schema info
        schema_summary[fname] = {
            "columns": headers,
            "col_count": col_count,
            "schema_type": "plus" if is_plus else "standard"
        }
        
        # Missing values
        for col_name in headers:
            nc = null_counts[col_name]
            pct = round((nc / total_rows * 100), 4) if total_rows > 0 else 0
            if nc > 0:
                missing_values_records.append({
                    "File": fname,
                    "Column": col_name,
                    "Null_Count": nc,
                    "Null_Percentage": pct
                })
        
        # Label distribution
        for lbl, count in label_counter.items():
            pct = round((count / total_rows * 100), 4) if total_rows > 0 else 0
            label_distribution_records.append({
                "File": fname,
                "Label": lbl,
                "Count": count,
                "Percentage_Within_File": pct
            })
        
        # Data quality
        data_quality_data[fname] = {
            "total_rows": total_rows,
            "malformed_rows": malformed_rows,
            "duplicate_flow_fingerprints": duplicate_rows,
            "duplicate_percentage": round(duplicate_rows / total_rows * 100, 4) if total_rows > 0 else 0,
            "negative_ports": negative_ports,
            "out_of_range_ports": out_of_range_ports,
            "negative_flow_durations": negative_durations,
            "negative_packet_counts": negative_packets,
            "infinite_numeric_values": inf_values,
            "null_cells_total": sum(null_counts.values())
        }
        
        # IP Validation
        ip_validation_data[fname] = {
            "total_rows_inspected": total_rows,
            "invalid_src_ip_dec": invalid_src_ip,
            "invalid_dst_ip_dec": invalid_dst_ip,
            "valid_src_ip_rate_pct": round((total_rows - invalid_src_ip) / total_rows * 100, 4) if total_rows > 0 else 0,
            "valid_dst_ip_rate_pct": round((total_rows - invalid_dst_ip) / total_rows * 100, 4) if total_rows > 0 else 0,
            "sample_verified_conversions": sample_ip_conversions
        }
        
        # Timestamp analysis
        timestamp_analysis_data[fname] = {
            "total_timestamps": total_rows,
            "length_distribution": dict(timestamp_lengths),
            "sample_formats": list(timestamp_samples),
            "inferred_format": "MM:SS.s (Windowed session elapsed time)"
        }

    total_time = round(time.time() - start_time, 2)
    print(f"\nAll 10 files inspected in {total_time}s. Total records: {overall_total_rows:,}")
    
    # 1. Write file_inventory.csv
    with open(os.path.join(META_DIR, "file_inventory.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["File", "File_Size_Bytes", "File_Size_MB", "Total_Rows", "Total_Cols", "Encoding", "Schema_Type"])
        writer.writeheader()
        writer.writerows(file_inventory)
    print("Wrote file_inventory.csv")

    # 2. Write schema_summary.json
    # Also extract schema comparison
    std_cols = None
    plus_cols = None
    for fn, s in schema_summary.items():
        if s["schema_type"] == "standard" and std_cols is None:
            std_cols = s["columns"]
        elif s["schema_type"] == "plus" and plus_cols is None:
            plus_cols = s["columns"]
    
    schema_diff = {
        "standard_schema_column_count": len(std_cols) if std_cols else 0,
        "plus_schema_column_count": len(plus_cols) if plus_cols else 0,
        "common_columns_count": len(set(std_cols).intersection(set(plus_cols))) if std_cols and plus_cols else 0,
        "additional_columns_in_plus": list(set(plus_cols) - set(std_cols)) if std_cols and plus_cols else [],
        "missing_columns_in_plus": list(set(std_cols) - set(plus_cols)) if std_cols and plus_cols else [],
        "common_features_list": [c for c in std_cols if c in plus_cols] if std_cols and plus_cols else [],
        "files_detail": schema_summary
    }
    with open(os.path.join(META_DIR, "schema_summary.json"), "w", encoding="utf-8") as f:
        json.dump(schema_diff, f, indent=2)
    print("Wrote schema_summary.json")

    # 3. Write missing_values.csv
    with open(os.path.join(META_DIR, "missing_values.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["File", "Column", "Null_Count", "Null_Percentage"])
        writer.writeheader()
        if missing_values_records:
            writer.writerows(missing_values_records)
        else:
            # write a clean record
            writer.writerow({"File": "ALL_FILES", "Column": "NONE", "Null_Count": 0, "Null_Percentage": 0.0})
    print("Wrote missing_values.csv")

    # 4. Write label_distribution.csv
    with open(os.path.join(META_DIR, "label_distribution.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["File", "Label", "Count", "Percentage_Within_File"])
        writer.writeheader()
        writer.writerows(label_distribution_records)
    print("Wrote label_distribution.csv")

    # 5. Write data_quality_report.json
    with open(os.path.join(META_DIR, "data_quality_report.json"), "w", encoding="utf-8") as f:
        json.dump(data_quality_data, f, indent=2)
    print("Wrote data_quality_report.json")

    # 6. Write ip_validation.json
    with open(os.path.join(META_DIR, "ip_validation.json"), "w", encoding="utf-8") as f:
        json.dump(ip_validation_data, f, indent=2)
    print("Wrote ip_validation.json")

    # 7. Write timestamp_analysis.json
    with open(os.path.join(META_DIR, "timestamp_analysis.json"), "w", encoding="utf-8") as f:
        json.dump(timestamp_analysis_data, f, indent=2)
    print("Wrote timestamp_analysis.json")

    # 8. Write dataset_summary.json
    dataset_summary = {
        "dataset_name": "CICIDS-2017 Version 2 (Bert van Keulen)",
        "total_files": len(files),
        "total_records": overall_total_rows,
        "standard_files_records": sum(f["Total_Rows"] for f in file_inventory if f["Schema_Type"] == "standard"),
        "plus_files_records": sum(f["Total_Rows"] for f in file_inventory if f["Schema_Type"] == "plus"),
        "overall_label_counts": dict(overall_label_counts),
        "benign_records_count": overall_label_counts.get("BENIGN", 0),
        "attack_records_count": sum(c for l, c in overall_label_counts.items() if l != "BENIGN"),
        "attack_to_benign_ratio": round(sum(c for l, c in overall_label_counts.items() if l != "BENIGN") / max(1, overall_label_counts.get("BENIGN", 1)), 6),
        "total_size_mb": sum(f["File_Size_MB"] for f in file_inventory),
        "inspection_elapsed_seconds": total_time
    }
    with open(os.path.join(META_DIR, "dataset_summary.json"), "w", encoding="utf-8") as f:
        json.dump(dataset_summary, f, indent=2)
    print("Wrote dataset_summary.json")

    print("\nPhase 4 dataset inspection script successfully completed.")

if __name__ == "__main__":
    analyze_all_files()
