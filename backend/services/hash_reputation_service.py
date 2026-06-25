KNOWN_BAD_HASHES = {
    # EICAR test file SHA256
    "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f": {
        "threat": "EICAR-Test-File",
        "category": "Test Malware Signature",
        "source": "Local RavShield hash intelligence",
        "risk_score": 100,
    },
}

KNOWN_CLEAN_HASHES = {}


def check_hash_reputation(sha256_hash: str):
    normalized_hash = sha256_hash.lower()

    if normalized_hash in KNOWN_BAD_HASHES:
        record = KNOWN_BAD_HASHES[normalized_hash]

        return {
            "known": True,
            "status": "KNOWN_MALICIOUS",
            "threat": record["threat"],
            "category": record["category"],
            "source": record["source"],
            "risk_score": record["risk_score"],
        }

    if normalized_hash in KNOWN_CLEAN_HASHES:
        return {
            "known": True,
            "status": "KNOWN_CLEAN",
            "threat": None,
            "category": "Trusted File",
            "source": "Local RavShield hash intelligence",
            "risk_score": 0,
        }

    return {
        "known": False,
        "status": "UNKNOWN",
        "threat": None,
        "category": "No local hash reputation match",
        "source": "Local RavShield hash intelligence",
        "risk_score": 0,
    }