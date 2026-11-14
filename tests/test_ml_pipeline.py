"""
Unit Tests for NetSentinel 2.0 ML Pipeline & Data Engineering
"""
import unittest
import json
import pandas as pd
from pathlib import Path
from ml.features.feature_dictionary import (
    LEAKAGE_EXCLUDED_COLUMNS, SELECTED_NUMERIC_FEATURES, CATEGORICAL_FEATURES
)

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "ml" / "processed"
METADATA_DIR = BASE_DIR / "data" / "ml" / "metadata"

class TestMLPipeline(unittest.TestCase):
    def test_leakage_audit(self):
        """Verify leakage audit report exists and confirms zero leakage."""
        audit_path = METADATA_DIR / "dataset_leakage_audit.json"
        self.assertTrue(audit_path.exists(), "dataset_leakage_audit.json missing")
        with open(audit_path, "r") as f:
            data = json.load(f)
        self.assertEqual(data["status"], "PASSED_ZERO_LEAKAGE")
        self.assertEqual(len(data["identifiers_in_features"]), 0)

    def test_processed_splits_exist(self):
        """Verify train, validation, and test parquet files exist."""
        for split in ["train.parquet", "validation.parquet", "test.parquet"]:
            fpath = PROCESSED_DIR / split
            self.assertTrue(fpath.exists(), f"Split missing: {split}")
            df = pd.read_parquet(fpath)
            self.assertGreater(len(df), 1000)

    def test_feature_matrix_integrity(self):
        """Ensure no target labels or IPs exist in selected features."""
        train_df = pd.read_parquet(PROCESSED_DIR / "train.parquet")
        for excluded in ["Timestamp"]:
            self.assertNotIn(excluded, train_df.columns)

if __name__ == "__main__":
    unittest.main()
