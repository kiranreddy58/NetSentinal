#!/usr/bin/env python3
"""
NetSentinel — Unit Tests for MapReduce Job 7 (Attack Label Analytics)
"""

import unittest
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "hadoop", "reducer"))
from attack_label_reducer import get_high_level_category

class TestJob7Attack(unittest.TestCase):

    def test_category_mapping(self):
        self.assertEqual(get_high_level_category("BENIGN"), "BENIGN")
        self.assertEqual(get_high_level_category("DoS Hulk"), "DENIAL_OF_SERVICE")
        self.assertEqual(get_high_level_category("DDoS"), "DISTRIBUTED_DOS")
        self.assertEqual(get_high_level_category("Portscan"), "RECONNAISSANCE")
        self.assertEqual(get_high_level_category("FTP-Patator"), "BRUTE_FORCE")
        self.assertEqual(get_high_level_category("Heartbleed"), "VULNERABILITY_EXPLOIT")

if __name__ == "__main__":
    unittest.main()
