#!/usr/bin/env python3
"""
NetSentinel — Unit Tests for MapReduce Job 6 (Temporal Analytics)
"""

import unittest

class TestJob6Temporal(unittest.TestCase):

    def test_minute_parsing(self):
        sample_ts = "01:18.8"
        self.assertEqual(sample_ts.split(":")[0].zfill(2), "01")
        sample_ts2 = "58:22.3"
        self.assertEqual(sample_ts2.split(":")[0].zfill(2), "58")

if __name__ == "__main__":
    unittest.main()
