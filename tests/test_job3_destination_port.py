#!/usr/bin/env python3
"""
NetSentinel — Unit Tests for MapReduce Job 3 (Destination Port Analytics)
"""

import unittest

PORT_NAMES = {80: "HTTP", 443: "HTTPS", 21: "FTP", 22: "SSH", 53: "DNS"}

class TestJob3PortAnalytics(unittest.TestCase):

    def test_port_naming(self):
        self.assertEqual(PORT_NAMES.get(80), "HTTP")
        self.assertEqual(PORT_NAMES.get(443), "HTTPS")
        self.assertEqual(PORT_NAMES.get(22), "SSH")
        self.assertEqual(PORT_NAMES.get(99999, "Unknown"), "Unknown")

if __name__ == "__main__":
    unittest.main()
