"""
Integration Tests for FastAPI Backend Endpoints
"""
import unittest
from fastapi.testclient import TestClient
from backend.app.main import app

class TestBackendAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ONLINE")

    def test_overview_endpoint(self):
        res = self.client.get("/api/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_flows"], 2099971)

    def test_ml_comparison_endpoint(self):
        res = self.client.get("/api/ml/comparison")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(len(data), 3)

    def test_threat_summary_endpoint(self):
        res = self.client.get("/api/threats/summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("critical_threats", data)

    def test_batch_prediction_endpoint(self):
        payload = {
            "model_name": "Random Forest",
            "records": [
                {"Flow Duration": 5000, "Total Fwd Packet": 10, "Total Bwd packets": 5, "Dst Port": 80, "Protocol": 6}
            ]
        }
        res = self.client.post("/api/ml/predict-batch", json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "SUCCESS")

if __name__ == "__main__":
    unittest.main()
