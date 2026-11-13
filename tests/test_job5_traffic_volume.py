#!/usr/bin/env python3
"""
NetSentinel — Unit Tests for MapReduce Job 5 (Traffic Volume Analytics)
"""

import unittest
import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "hadoop", "mapper"))
from traffic_volume_mapper import get_volume_tier

class TestJob5TrafficVolume(unittest.TestCase):

    def test_volume_tiers(self):
        self.assertEqual(get_volume_tier(500), "1_MICRO_<1KB")
        self.assertEqual(get_volume_tier(2048), "2_SMALL_1-10KB")
        self.assertEqual(get_volume_tier(50000), "3_MEDIUM_10-100KB")
        self.assertEqual(get_volume_tier(500000), "4_LARGE_100KB-1MB")
        self.assertEqual(get_volume_tier(2000000), "5_JUMBO_>1MB")

if __name__ == "__main__":
    unittest.main()
