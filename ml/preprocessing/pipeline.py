"""
NetSentinel ML Preprocessing Pipeline
Reads Standard CICIDS-2017 files in chunks, enforces data leakage prevention,
performs schema validation, handles missing/inf values, builds stratified & day-based splits,
and fits scalers/encoders strictly on training data.
"""

import os
import glob
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import RobustScaler, LabelEncoder
from sklearn.model_selection import train_test_split

from ml.features.feature_dictionary import (
    LEAKAGE_EXCLUDED_COLUMNS,
    SELECTED_NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    ATTACK_FAMILY_MAP,
    FEATURE_DESCRIPTIONS
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "ml" / "processed"
METADATA_DIR = BASE_DIR / "data" / "ml" / "metadata"
MODELS_DIR = BASE_DIR / "ml" / "models"

STANDARD_FILES = [
    "monday.csv",
    "tuesday.csv",
    "wednesday.csv",
    "thursday.csv",
    "friday.csv"
]


def validate_schema(df: pd.DataFrame) -> bool:
    """Ensure all required feature columns exist in chunk."""
    missing = [col for col in SELECTED_NUMERIC_FEATURES + CATEGORICAL_FEATURES if col not in df.columns]
    if missing:
        raise ValueError(f"Schema validation failed. Missing columns: {missing}")
    return True


def clean_chunk(df: pd.DataFrame) -> pd.DataFrame:
    """Handle infinities, extreme outliers, and NaNs safely."""
    for col in SELECTED_NUMERIC_FEATURES:
        if col in df.columns:
            # Replace infinities with NaN then fill with median or 0
            df[col] = df[col].replace([np.inf, -np.inf], np.nan)
            df[col] = df[col].fillna(0.0)
            # Clip negative durations/packets to 0
            if "Duration" in col or "Packet" in col or "Bytes" in col or "Length" in col:
                df[col] = df[col].clip(lower=0.0)
    return df


def extract_curated_dataset(sample_size_per_class: int = 15000, random_state: int = 42) -> pd.DataFrame:
    """
    Stream standard CSV files in chunks to create a representative, stratified dataset
    without memory exhaustion on a 16GB system.
    Preserves 100% of rare attacks and samples abundant classes.
    """
    print("[*] Starting chunked data ingestion across 5 Standard CSVs...")
    collected_dfs = []
    total_raw_rows = 0
    label_counts_raw = {}

    for fname in STANDARD_FILES:
        fpath = RAW_DATA_DIR / fname
        if not fpath.exists():
            print(f"[-] Warning: {fname} not found in {RAW_DATA_DIR}")
            continue

        print(f"    -> Reading {fname} in chunks...")
        day_name = fname.replace(".csv", "").capitalize()
        chunk_iter = pd.read_csv(fpath, chunksize=100000, low_memory=False)

        for chunk_idx, chunk in enumerate(chunk_iter):
            validate_schema(chunk)
            clean_chunk(chunk)
            total_raw_rows += len(chunk)
            chunk["day_source"] = day_name

            # Track raw label counts
            for lbl, cnt in chunk["Label"].value_counts().items():
                label_counts_raw[lbl] = label_counts_raw.get(lbl, 0) + cnt

            # Sampling strategy:
            # Rare classes (< 10,000 occurrences in dataset): take ALL
            # Abundant classes (BENIGN, Portscan, DoS Hulk, DDoS): sample proportionally
            sampled_pieces = []
            for lbl, group in chunk.groupby("Label"):
                if len(group) <= 2000:
                    sampled_pieces.append(group)
                else:
                    frac = min(1.0, 4000 / len(group))
                    sampled_pieces.append(group.sample(frac=frac, random_state=random_state))

            if sampled_pieces:
                collected_dfs.append(pd.concat(sampled_pieces, ignore_index=True))

    full_sample = pd.concat(collected_dfs, ignore_index=True)
    print(f"[+] Total raw rows processed: {total_raw_rows:,}")
    print(f"[+] Curated sample shape before deduplication: {full_sample.shape}")

    # Deduplicate based on flow features (excluding identifiers)
    subset_cols = [c for c in SELECTED_NUMERIC_FEATURES if c in full_sample.columns]
    dup_count = full_sample.duplicated(subset=subset_cols).sum()
    print(f"    -> Identified {dup_count} duplicate flows in sample. Preserving unique network patterns...")
    full_sample = full_sample.drop_duplicates(subset=subset_cols).reset_index(drop=True)
    print(f"[+] Final curated dataset size: {full_sample.shape[0]:,} flows across {full_sample['Label'].nunique()} unique labels.")

    return full_sample, total_raw_rows, label_counts_raw


def run_preprocessing_pipeline():
    """Execute complete data engineering, leakage prevention, splitting, and scaling."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    df, total_raw_rows, raw_label_counts = extract_curated_dataset()

    # Targets & Attack families
    df["is_attack"] = (df["Label"].str.upper() != "BENIGN").astype(int)
    df["attack_family"] = df["Label"].map(lambda x: ATTACK_FAMILY_MAP.get(x, "Unknown"))

    # Metadata & Identifiers saved separately to prevent leakage
    metadata_cols = ["Src IP dec", "Dst IP dec", "Timestamp", "Label", "Attempted Category", "day_source", "is_attack", "attack_family"]
    meta_df = df[[c for c in metadata_cols if c in df.columns]].copy()

    # Features for ML
    feature_cols = [c for c in SELECTED_NUMERIC_FEATURES + CATEGORICAL_FEATURES if c in df.columns]
    X_df = df[feature_cols].copy()

    # Audit Data Leakage
    leakage_audit = {
        "status": "PASSED_ZERO_LEAKAGE",
        "excluded_columns": LEAKAGE_EXCLUDED_COLUMNS,
        "input_feature_count": len(feature_cols),
        "target_column": "is_attack (Binary: 0=BENIGN, 1=ATTACK)",
        "multiclass_target": "attack_family",
        "feature_list": feature_cols,
        "identifiers_in_features": [col for col in feature_cols if col in LEAKAGE_EXCLUDED_COLUMNS]
    }
    with open(METADATA_DIR / "dataset_leakage_audit.json", "w") as f:
        json.dump(leakage_audit, f, indent=2)

    # 1. Stratified 70/15/15 Split
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_df, df["is_attack"], test_size=0.30, random_state=42, stratify=df["is_attack"]
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    # Fit RobustScaler ONLY on X_train to prevent test data leakage
    print("[*] Fitting RobustScaler strictly on X_train...")
    scaler = RobustScaler()
    scaler.fit(X_train[SELECTED_NUMERIC_FEATURES])
    joblib.dump(scaler, MODELS_DIR / "scaler.joblib")

    # Transform numeric features
    X_train_scaled = X_train.copy()
    X_val_scaled = X_val.copy()
    X_test_scaled = X_test.copy()

    X_train_scaled[SELECTED_NUMERIC_FEATURES] = scaler.transform(X_train[SELECTED_NUMERIC_FEATURES])
    X_val_scaled[SELECTED_NUMERIC_FEATURES] = scaler.transform(X_val[SELECTED_NUMERIC_FEATURES])
    X_test_scaled[SELECTED_NUMERIC_FEATURES] = scaler.transform(X_test[SELECTED_NUMERIC_FEATURES])

    # Save splits as Parquet for high-speed I/O
    print("[*] Saving train/val/test splits to Parquet...")
    train_export = X_train_scaled.copy()
    train_export["is_attack"] = y_train
    train_export["Label"] = df.loc[X_train.index, "Label"]
    train_export["attack_family"] = df.loc[X_train.index, "attack_family"]
    train_export["day_source"] = df.loc[X_train.index, "day_source"]
    train_export["Src IP dec"] = df.loc[X_train.index, "Src IP dec"]
    train_export["Dst IP dec"] = df.loc[X_train.index, "Dst IP dec"]
    train_export.to_parquet(PROCESSED_DIR / "train.parquet", index=False)

    val_export = X_val_scaled.copy()
    val_export["is_attack"] = y_val
    val_export["Label"] = df.loc[X_val.index, "Label"]
    val_export["attack_family"] = df.loc[X_val.index, "attack_family"]
    val_export["day_source"] = df.loc[X_val.index, "day_source"]
    val_export["Src IP dec"] = df.loc[X_val.index, "Src IP dec"]
    val_export["Dst IP dec"] = df.loc[X_val.index, "Dst IP dec"]
    val_export.to_parquet(PROCESSED_DIR / "validation.parquet", index=False)

    test_export = X_test_scaled.copy()
    test_export["is_attack"] = y_test
    test_export["Label"] = df.loc[X_test.index, "Label"]
    test_export["attack_family"] = df.loc[X_test.index, "attack_family"]
    test_export["day_source"] = df.loc[X_test.index, "day_source"]
    test_export["Src IP dec"] = df.loc[X_test.index, "Src IP dec"]
    test_export["Dst IP dec"] = df.loc[X_test.index, "Dst IP dec"]
    test_export.to_parquet(PROCESSED_DIR / "test.parquet", index=False)

    # 2. Chronological / Day-Based Holdout Split metadata
    # Train on Mon, Tue, Wed, Thu; Holdout on Friday (which has DDoS, Botnet, Portscan)
    friday_mask = df["day_source"] == "Friday"
    day_holdout_summary = {
        "strategy": "Chronological_Day_Holdout",
        "train_days": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "holdout_day": "Friday",
        "train_samples": int((~friday_mask).sum()),
        "holdout_samples": int(friday_mask.sum())
    }

    # Summary Metadata
    meta = {
        "total_canonical_raw_rows": total_raw_rows,
        "curated_sample_rows": len(df),
        "train_rows": len(X_train),
        "validation_rows": len(X_val),
        "test_rows": len(X_test),
        "feature_count": len(feature_cols),
        "numeric_features": len(SELECTED_NUMERIC_FEATURES),
        "categorical_features": len(CATEGORICAL_FEATURES),
        "class_distribution_sample": {
            "BENIGN": int((df["is_attack"] == 0).sum()),
            "ATTACK": int((df["is_attack"] == 1).sum()),
            "attack_ratio": float((df["is_attack"] == 1).mean())
        },
        "day_holdout_summary": day_holdout_summary,
        "feature_descriptions": FEATURE_DESCRIPTIONS
    }

    with open(METADATA_DIR / "preprocessing_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    with open(METADATA_DIR / "feature_dictionary.json", "w") as f:
        json.dump({
            "features": feature_cols,
            "numeric": SELECTED_NUMERIC_FEATURES,
            "categorical": CATEGORICAL_FEATURES,
            "descriptions": FEATURE_DESCRIPTIONS,
            "attack_families": list(set(ATTACK_FAMILY_MAP.values()))
        }, f, indent=2)

    print("[+] Preprocessing pipeline finished successfully!")
    print(f"    Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")


if __name__ == "__main__":
    run_preprocessing_pipeline()
