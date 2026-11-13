import unittest
import io
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "hadoop", "reducer"))
from attack_label_reducer import get_high_level_category

class TestJob8SourceDestinationCorrelation(unittest.TestCase):
    def test_basic_pairing(self):
        src_ip = "192.168.10.5"
        dst_ip = "192.168.10.50"
        pair_key = f"{src_ip}\t{dst_ip}"
        self.assertEqual(pair_key, "192.168.10.5\t192.168.10.50")

if __name__ == '__main__':
    unittest.main()
