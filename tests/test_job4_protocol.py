#!/usr/bin/env python3
"""
NetSentinel — Unit Tests for MapReduce Job 4 (Protocol Analytics)
"""

import unittest

PROTO_NAMES = {6: "TCP", 17: "UDP", 1: "ICMP", 0: "HOPOPT"}

class TestJob4Protocol(unittest.TestCase):

    def test_proto_mapping(self):
        self.assertEqual(PROTO_NAMES.get(6), "TCP")
        self.assertEqual(PROTO_NAMES.get(17), "UDP")
        self.assertEqual(PROTO_NAMES.get(1), "ICMP")
        self.assertEqual(PROTO_NAMES.get(0), "HOPOPT")

if __name__ == "__main__":
    unittest.main()
