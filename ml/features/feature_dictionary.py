"""
NetSentinel ML Pipeline - Feature Dictionary & Schema Definitions
Defines all features, descriptions, types, and data leakage exclusions.
"""

# Identifiers and targets excluded from input features to prevent data leakage
LEAKAGE_EXCLUDED_COLUMNS = [
    "Src IP dec",          # Source IP address (identity leakage)
    "Dst IP dec",          # Destination IP address (identity leakage)
    "Timestamp",           # Timestamp (chronological memorization)
    "Label",               # Ground truth target
    "Attempted Category"   # Target indicator
]

# High-variance, informative network traffic features
SELECTED_NUMERIC_FEATURES = [
    "Flow Duration",
    "Total Fwd Packet",
    "Total Bwd packets",
    "Total Length of Fwd Packet",
    "Total Length of Bwd Packet",
    "Fwd Packet Length Max",
    "Fwd Packet Length Min",
    "Fwd Packet Length Mean",
    "Fwd Packet Length Std",
    "Bwd Packet Length Max",
    "Bwd Packet Length Min",
    "Bwd Packet Length Mean",
    "Bwd Packet Length Std",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Flow IAT Mean",
    "Flow IAT Std",
    "Flow IAT Max",
    "Flow IAT Min",
    "Fwd IAT Total",
    "Fwd IAT Mean",
    "Fwd IAT Std",
    "Fwd IAT Max",
    "Fwd IAT Min",
    "Bwd IAT Total",
    "Bwd IAT Mean",
    "Bwd IAT Std",
    "Bwd IAT Max",
    "Bwd IAT Min",
    "Fwd PSH Flags",
    "Bwd PSH Flags",
    "Fwd RST Flags",
    "Bwd RST Flags",
    "Fwd Header Length",
    "Bwd Header Length",
    "Fwd Packets/s",
    "Bwd Packets/s",
    "Packet Length Min",
    "Packet Length Max",
    "Packet Length Mean",
    "Packet Length Std",
    "Packet Length Variance",
    "FIN Flag Count",
    "SYN Flag Count",
    "RST Flag Count",
    "PSH Flag Count",
    "ACK Flag Count",
    "CWR Flag Count",
    "ECE Flag Count",
    "Down/Up Ratio",
    "Average Packet Size",
    "Fwd Segment Size Avg",
    "Bwd Segment Size Avg",
    "Subflow Fwd Packets",
    "Subflow Fwd Bytes",
    "Subflow Bwd Bytes",
    "FWD Init Win Bytes",
    "Bwd Init Win Bytes",
    "Fwd Act Data Pkts",
    "Fwd Seg Size Min",
    "Active Mean",
    "Active Std",
    "Active Max",
    "Active Min",
    "Idle Mean",
    "Idle Std",
    "Idle Max",
    "Idle Min",
    "Total TCP Flow Time"
]

CATEGORICAL_FEATURES = [
    "Protocol",
    "Dst Port"
]

FEATURE_DESCRIPTIONS = {
    "Flow Duration": "Duration of the bidirectional network flow in microseconds",
    "Total Fwd Packet": "Total number of packets transmitted in forward direction (source to dest)",
    "Total Bwd packets": "Total number of packets transmitted in backward direction (dest to source)",
    "Total Length of Fwd Packet": "Total payload bytes in forward direction",
    "Total Length of Bwd Packet": "Total payload bytes in backward direction",
    "Fwd Packet Length Mean": "Mean size of packets in forward direction",
    "Bwd Packet Length Mean": "Mean size of packets in backward direction",
    "Flow Bytes/s": "Data throughput rate in bytes per second",
    "Flow Packets/s": "Packet throughput rate in packets per second",
    "Flow IAT Mean": "Mean inter-arrival time between consecutive packets in microseconds",
    "Flow IAT Std": "Standard deviation of inter-arrival time between packets",
    "SYN Flag Count": "Number of packets with SYN flag set (connection establishment / SYN scan)",
    "RST Flag Count": "Number of packets with RST flag set (connection reset / scan probe)",
    "PSH Flag Count": "Number of packets with PSH flag set (push data buffer immediately)",
    "ACK Flag Count": "Number of packets with ACK flag set (acknowledgement)",
    "FWD Init Win Bytes": "Initial TCP window advertisement size in forward direction",
    "Bwd Init Win Bytes": "Initial TCP window advertisement size in backward direction",
    "Average Packet Size": "Overall average packet size in bytes across flow",
    "Active Mean": "Mean time flow was active before becoming idle",
    "Idle Mean": "Mean time flow was idle before becoming active",
    "Protocol": "Transport layer protocol (6=TCP, 17=UDP, 0=HOPOPT/ICMP)",
    "Dst Port": "Destination port representing target network service"
}

# Attack family mapping for multiclass grouping
ATTACK_FAMILY_MAP = {
    "BENIGN": "BENIGN",
    "Botnet": "Botnet",
    "Botnet - Attempted": "Botnet",
    "DDoS": "DDoS",
    "DoS GoldenEye": "DoS",
    "DoS GoldenEye - Attempted": "DoS",
    "DoS Hulk": "DoS",
    "DoS Hulk - Attempted": "DoS",
    "DoS Slowhttptest": "DoS",
    "DoS Slowhttptest - Attempted": "DoS",
    "DoS Slowloris": "DoS",
    "DoS Slowloris - Attempted": "DoS",
    "FTP-Patator": "BruteForce",
    "FTP-Patator - Attempted": "BruteForce",
    "SSH-Patator": "BruteForce",
    "SSH-Patator - Attempted": "BruteForce",
    "Heartbleed": "Heartbleed",
    "Infiltration": "Infiltration",
    "Infiltration - Attempted": "Infiltration",
    "Infiltration - Portscan": "Portscan",
    "Portscan": "Portscan",
    "Web Attack - Brute Force": "WebAttack",
    "Web Attack - Brute Force - Attempted": "WebAttack",
    "Web Attack - SQL Injection": "WebAttack",
    "Web Attack - SQL Injection - Attempted": "WebAttack",
    "Web Attack - XSS": "WebAttack",
    "Web Attack - XSS - Attempted": "WebAttack"
}
