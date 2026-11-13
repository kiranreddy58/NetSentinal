"""
NetSentinel - Backend Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RESULTS_DIR = BASE_DIR / "results"
METADATA_DIR = BASE_DIR / "data" / "metadata"

SOURCE_IP_CSV = RESULTS_DIR / "ip_analytics" / "source_ip_summary.csv"
DEST_IP_CSV = RESULTS_DIR / "ip_analytics" / "destination_ip_summary.csv"
SOURCE_DEST_CSV = RESULTS_DIR / "ip_analytics" / "source_destination_correlation.csv"
PORT_CSV = RESULTS_DIR / "port_analytics" / "destination_port_summary.csv"
PROTOCOL_CSV = RESULTS_DIR / "protocol_analytics" / "protocol_summary.csv"
TRAFFIC_VOLUME_CSV = RESULTS_DIR / "traffic_analytics" / "traffic_volume_summary.csv"
TEMPORAL_CSV = RESULTS_DIR / "temporal_analytics" / "temporal_traffic_summary.csv"
DAILY_CSV = RESULTS_DIR / "traffic_analytics" / "daily_comparative_summary.csv"
ATTACK_CSV = RESULTS_DIR / "attack_analytics" / "attack_label_summary.csv"
SUSPICIOUS_CSV = RESULTS_DIR / "attack_analytics" / "suspicious_behavior_summary.csv"
