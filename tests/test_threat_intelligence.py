"""
Unit Tests for Threat Intelligence, Risk Scoring & MapReduce Job 11
"""
import unittest
import json
from pathlib import Path
from ml.threat_intelligence.threat_engine import calculate_risk_score

BASE_DIR = Path(__file__).resolve().parent.parent
THREAT_DIR = BASE_DIR / "results" / "threat_analytics"

class TestThreatIntelligence(unittest.TestCase):
    def test_risk_scoring_bounds(self):
        """Verify risk score is strictly between 0 and 100."""
        score_high, sev_high, exp_high = calculate_risk_score(1.0, 1.0, 80.0, is_scanner=True, is_volume_burst=True)
        self.assertLessEqual(score_high, 100.0)
        self.assertEqual(sev_high, "CRITICAL")
        self.assertIn("High ML classifier confidence", exp_high)

        score_low, sev_low, exp_low = calculate_risk_score(0.0, 0.0, 5.0, is_scanner=False, is_volume_burst=False)
        self.assertGreaterEqual(score_low, 0.0)
        self.assertEqual(sev_low, "LOW")
        self.assertEqual(exp_low, "Baseline nominal network activity")

    def test_job11_output(self):
        """Verify MapReduce Job 11 output exists and has valid header and records."""
        job11_path = THREAT_DIR / "hadoop_job11_threat_summary.csv"
        self.assertTrue(job11_path.exists())
        with open(job11_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        self.assertGreater(len(lines), 1)
        self.assertIn("source_ip", lines[0])

if __name__ == "__main__":
    unittest.main()
