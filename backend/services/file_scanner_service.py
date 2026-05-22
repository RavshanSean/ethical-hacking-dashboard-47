import hashlib
import math
from collections import Counter


DANGEROUS_EXTENSIONS = [
    ".exe",
    ".bat",
    ".cmd",
    ".scr",
    ".js",
    ".vbs",
    ".ps1",
    ".jar",
    ".apk",
    ".dmg",
    ".zip",
    ".rar",
]


SUSPICIOUS_KEYWORDS = [
    "payload",
    "crack",
    "keygen",
    "trojan",
    "malware",
    "stealer",
    "rat",
    "backdoor",
    "inject",
]

EXECUTABLE_TYPES = [
    "Windows executable",
    "ZIP/JAR/APK archive",
]

SAFE_LOOKING_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".txt",
]


def detect_file_signature(file_bytes: bytes):
    if file_bytes.startswith(b"MZ"):
        return "Windows executable"

    if file_bytes.startswith(b"%PDF"):
        return "PDF document"

    if file_bytes.startswith(b"PK"):
        return "ZIP/JAR/APK archive"

    if file_bytes.startswith(b"\x89PNG"):
        return "PNG image"

    if file_bytes.startswith(b"\xff\xd8\xff"):
        return "JPEG image"

    if file_bytes.startswith(b"GIF87a") or file_bytes.startswith(b"GIF89a"):
        return "GIF image"

    return "Unknown file type"


def calculate_entropy(file_bytes: bytes):
    if not file_bytes:
        return 0

    byte_counts = Counter(file_bytes)

    entropy = 0

    for count in byte_counts.values():
        probability = count / len(file_bytes)
        entropy -= probability * math.log2(probability)

    return round(entropy, 2)


def generate_file_ai_summary(scan_result: dict):
    filename = scan_result.get("filename", "Unknown file")
    file_type = scan_result.get("detected_file_type", "Unknown file type")
    threat_level = scan_result.get("threat_level", "UNKNOWN")
    risk_score = scan_result.get("risk_score", 0)
    entropy = scan_result.get("entropy", 0)
    reasons = scan_result.get("reasons", [])

    summary_parts = []

    if threat_level == "HIGH":
        summary_parts.append(
            f"{filename} appears highly suspicious based on the current static file analysis."
        )
    elif threat_level == "MEDIUM":
        summary_parts.append(
            f"{filename} shows moderate-risk indicators and should be reviewed before opening."
        )
    else:
        summary_parts.append(
            f"{filename} appears low risk based on the current static file scan."
        )

    summary_parts.append(
        f"The detected file type is {file_type}, with a risk score of {risk_score}/100."
    )

    if entropy > 7.2:
        summary_parts.append(
            f"The file has high entropy ({entropy}), which can sometimes indicate compression, packing, encryption, or obfuscation."
        )

    if reasons:
        summary_parts.append(
            "Key indicators include: " + ", ".join(reasons[:3]) + "."
        )

    return " ".join(summary_parts)


def analyze_file(filename: str, file_bytes: bytes):
    risk_score = 0
    reasons = []

    lower_name = filename.lower()
    
    parts = lower_name.split(".")

    has_double_extension = (
        len(parts) >= 3
        and any(
            f".{parts[-2]}" == ext
            for ext in SAFE_LOOKING_EXTENSIONS
        )
    )

    file_size = len(file_bytes)

    sha256_hash = hashlib.sha256(file_bytes).hexdigest()
    
    detected_file_type = detect_file_signature(file_bytes)
    entropy = calculate_entropy(file_bytes)

    for extension in DANGEROUS_EXTENSIONS:
        if lower_name.endswith(extension):
            risk_score += 30
            reasons.append(
                f"File has potentially dangerous extension: {extension}"
            )

    if has_double_extension:
        risk_score += 35
        reasons.append(
            "Filename appears to use a double-extension masquerading technique"
        )
            
    if detected_file_type == "Windows executable" and not lower_name.endswith(".exe"):
        risk_score += 40
        reasons.append(
            "File content appears to be a Windows executable but extension does not match"
        )
        
    if entropy > 7.2 and detected_file_type in EXECUTABLE_TYPES:
        risk_score += 25
        reasons.append(
            f"High entropy detected ({entropy}) — executable may be packed or encrypted"
        )

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in lower_name:
            risk_score += 25
            reasons.append(
                f"Filename contains suspicious keyword: {keyword}"
            )

    if file_size == 0:
        risk_score += 20
        reasons.append("File is empty or unreadable")

    if file_size > 10 * 1024 * 1024:
        risk_score += 10
        reasons.append("File is larger than 10MB")

    if len(reasons) == 0:
        reasons.append("No obvious suspicious file indicators detected")

    risk_score = min(risk_score, 100)

    if risk_score >= 70:
        threat_level = "HIGH"
    elif risk_score >= 30:
        threat_level = "MEDIUM"
    else:
        threat_level = "LOW"
        
        

    scan_result = {
        "detected_file_type": detected_file_type,
        "entropy": entropy,
        "filename": filename,
        "file_size": file_size,
        "sha256": sha256_hash,
        "risk_score": risk_score,
        "threat_level": threat_level,
        "reasons": reasons,
        "scan_type": "Static file scan",
        "engine_version": "0.1.0",
        "status": "File scan complete",
    }

    scan_result["ai_summary"] = generate_file_ai_summary(scan_result)

    return scan_result