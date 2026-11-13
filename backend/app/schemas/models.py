"""
NetSentinel - Pydantic Data Schemas
"""
from pydantic import BaseModel
from typing import List, Optional, Any

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

class SystemOverview(BaseModel):
    total_flows: int
    benign_flows: int
    attack_flows: int
    attack_percentage: float
    total_packets: int
    total_bytes: int
    unique_source_ips: int
    unique_dest_ips: int
    unique_ports: int
    unique_protocols: int
    total_attack_categories: int
    hadoop_version: str
    execution_engine: str
    dataset_version: str
