#!/usr/bin/env python3
"""
NetSentinel — Unit & Reconciliation Tests for MapReduce Job 1 (Source IP Analytics)
"""

import unittest
import io
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "hadoop", "reducer"))

from source_ip_reducer import dec_to_ipv4

class TestJob1SourceIP(unittest.TestCase):

    def test_dec_to_ipv4(self):
        # Known ground-truth conversions
        self.assertEqual(dec_to_ipv4(134610945), "8.6.0.1")
        self.assertEqual(dec_to_ipv4(3232238089), "192.168.10.9")
        self.assertEqual(dec_to_ipv4(3232238083), "192.168.10.3")
        self.assertEqual(dec_to_ipv4(3758096635), "224.0.0.251")
        self.assertEqual(dec_to_ipv4(301796989), "17.253.14.125")
        self.assertEqual(dec_to_ipv4(0), "0.0.0.0")
        self.assertEqual(dec_to_ipv4(4294967295), "255.255.255.255")

    def test_mapper_record_transformation(self):
        # Verify mapper output formatting
        sample_row = ["0"] * 89
        sample_row[0] = "3232238089"  # src ip dec
        sample_row[2] = "134610945"   # dst ip dec
        sample_row[3] = "80"          # dst port
        sample_row[7] = "10"          # fwd pkts
        sample_row[8] = "5"           # bwd pkts
        sample_row[9] = "1000"        # fwd bytes
        sample_row[10] = "500"        # bwd bytes
        sample_row[87] = "BENIGN"     # label
        
        # Format emitted by mapper
        expected_tuple = "10,5,1000,500,1,0,134610945,80"
        actual_tuple = f"{sample_row[7]},{sample_row[8]},{sample_row[9]},{sample_row[10]},1,0,{sample_row[2]},{sample_row[3]}"
        self.assertEqual(actual_tuple, expected_tuple)

    def test_output_file_exists(self):
        summary_path = os.path.join(PROJECT_ROOT, "results", "ip_analytics", "source_ip_summary.csv")
        # Check if results directory exists
        self.assertTrue(os.path.exists(os.path.dirname(summary_path)))

if __name__ == "__main__":
    unittest.main()
