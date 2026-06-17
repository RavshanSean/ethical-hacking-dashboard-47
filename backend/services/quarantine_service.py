import json
import os
import time
import uuid
from pathlib import Path

QUARANTINE_DIR = Path("quarantine_storage")
INDEX_FILE = QUARANTINE_DIR / "index.json"

QUARANTINE_DIR.mkdir(exist_ok=True)


def load_index():
    if not INDEX_FILE.exists():
        return []

    with open(INDEX_FILE, "r") as file:
        return json.load(file)


def save_index(items):
    with open(INDEX_FILE, "w") as file:
        json.dump(items, file, indent=2)


def quarantine_file(filename: str, file_bytes: bytes, scan_result: dict):
    items = load_index()

    quarantine_id = str(uuid.uuid4())
    safe_name = f"{quarantine_id}.quarantine"
    file_path = QUARANTINE_DIR / safe_name

    with open(file_path, "wb") as file:
        file.write(file_bytes)

    item = {
        "id": quarantine_id,
        "original_filename": filename,
        "stored_filename": safe_name,
        "threat_level": scan_result.get("threat_level"),
        "risk_score": scan_result.get("risk_score"),
        "threat": scan_result.get("antivirus", {}).get("threat"),
        "status": "QUARANTINED",
        "created_at": int(time.time()),
    }

    items.insert(0, item)
    save_index(items)

    return item


def get_quarantined_files():
    return load_index()