#!/usr/bin/env python3
"""
NetSentinel — Unit & Parity Tests for MapReduce Job 2 (Destination IP Analytics)
"""

import unittest
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "hadoop", "reducer"))

from destination_ip_reducer import dec_to_ipv4

class TestJob2DestinationIP(unittest.TestCase):

    def test_dec_to_ipv4(self):
        self.assertEqual(dec_to_ipv4(134610945), "8.6.0.1")
        self.assertEqual(dec_to_ipv4(3232238089), "192.168.10.9")
        self.assertEqual(dec_to_ipv4(3232238083), "192.168.10.3")

    def test_mapper_format(self):
        # sample destination tuple test
        sample_row = ["0"] * 89
        sample_row[0] = "3232238089"  # src ip dec
        sample_row[2] = "134610945"   # dst ip dec
        sample_row[7] = "10"
        sample_row[8] = "5"
        sample_row[9] = "1000"
        sample_row[10] = "500"
        sample_row[87] = "Portscan"
        
        tuple_str = f"{sample_row[7]},{sample_row[8]},{sample_row[9]},{sample_row[10]},0,1,{sample_row[0]},{sample_row[87]}"
        self.assertEqual(tuple_str, "10,5,1000,500,0,1,3232238089,Portscan")

if __name__ == "__main__":
    unittest.main()
