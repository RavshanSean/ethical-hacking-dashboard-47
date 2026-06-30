import hashlib
import math
import zipfile
from collections import Counter
from io import BytesIO
import os
import subprocess
import tempfile
from services.hash_reputation_service import check_hash_reputation
from ravshield_threatintel.ioc_database import check_ioc_record


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

SUSPICIOUS_SCRIPT_PATTERNS = [
    "powershell",
    "-enc",
    "-encodedcommand",
    "invoke-webrequest",
    "iwr ",
    "curl ",
    "wget ",
    "downloadstring",
    "new-object net.webclient",
    "iex",
    "frombase64string",
    "start-process",
    "bypass",
    "hidden",
    "nop",
]

MAX_ZIP_FILES = 100
MAX_ZIP_UNCOMPRESSED_SIZE = 20 * 1024 * 1024
MAX_INNER_FILE_READ_SIZE = 1024 * 1024
MAX_RECURSION_DEPTH = 2


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


def detect_script_patterns(file_bytes: bytes):
    try:
        text = file_bytes.decode("utf-8", errors="ignore").lower()
    except Exception:
        return []

    matches = []

    for pattern in SUSPICIOUS_SCRIPT_PATTERNS:
        if pattern in text:
            matches.append(pattern)

    return matches


def inspect_zip_contents(
    file_bytes: bytes,
    depth: int = 0,
    max_depth: int = MAX_RECURSION_DEPTH,
):
    findings = []

    if depth > max_depth:
        findings.append("Maximum archive recursion depth reached")
        return findings

    try:
        with zipfile.ZipFile(BytesIO(file_bytes)) as archive:
            archive_entries = archive.infolist()
            encrypted_files = [
                info.filename
                for info in archive_entries
                if info.flag_bits & 0x1
            ]
            
            if encrypted_files:
                findings.append(
                    f"Archive contains password-protected files: {len(encrypted_files)}"
                )

            if len(archive_entries) > MAX_ZIP_FILES:
                findings.append(
                    f"Archive contains too many files: {len(archive_entries)}"
                )
                return findings

            total_uncompressed_size = sum(
                info.file_size for info in archive_entries
            )

            if total_uncompressed_size > MAX_ZIP_UNCOMPRESSED_SIZE:
                findings.append(
                    "Archive uncompressed size exceeds safe scanning limit"
                )
                return findings

            for info in archive_entries:
                if info.is_dir():
                    continue

                name = info.filename
                lower_name = name.lower()

                for extension in DANGEROUS_EXTENSIONS:
                    if lower_name.endswith(extension):
                        findings.append(
                            f"Archive contains potentially dangerous file: {name}"
                        )

                parts = lower_name.split(".")

                if len(parts) >= 3:
                    findings.append(
                        f"Archive contains file with multiple extensions: {name}"
                    )

                if info.file_size <= MAX_INNER_FILE_READ_SIZE:
                    inner_bytes = archive.read(name)

                    inner_type = detect_file_signature(inner_bytes)

                    if inner_type == "Windows executable":
                        findings.append(
                            f"Archive contains Windows executable content: {name}"
                        )

                    inner_script_matches = detect_script_patterns(inner_bytes)

                    if inner_script_matches:
                        findings.append(
                            "Archive contains suspicious script behavior in "
                            f"{name}: {', '.join(inner_script_matches[:5])}"
                        )

                    if inner_type == "ZIP/JAR/APK archive":
                        findings.append(
                            f"Nested archive detected inside ZIP: {name}"
                        )

                        nested_findings = inspect_zip_contents(
                            inner_bytes,
                            depth=depth + 1,
                            max_depth=max_depth,
                        )

                        findings.extend(
                            [
                                f"Nested archive finding: {finding}"
                                for finding in nested_findings[:5]
                            ]
                        )
                else:
                    findings.append(
                        f"Archive file skipped because it exceeds inner scan limit: {name}"
                    )

    except Exception as error:
        print("ZIP inspection error:", error)
        return []

    return findings


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


def scan_with_clamav(filename: str, file_bytes: bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        result = subprocess.run(
            ["clamscan", "--no-summary", temp_path],
            capture_output=True,
            text=True,
            timeout=30,
        )

        output = result.stdout.strip()

        os.remove(temp_path)

        if result.returncode == 1:
            threat_name = output.split(":")[-1].replace("FOUND", "").strip()

            return {
                "enabled": True,
                "status": "INFECTED",
                "threat": threat_name,
                "raw_output": output,
            }

        if result.returncode == 0:
            return {
                "enabled": True,
                "status": "CLEAN",
                "threat": None,
                "raw_output": output,
            }

        return {
            "enabled": True,
            "status": "ERROR",
            "threat": None,
            "raw_output": result.stderr.strip() or output,
        }

    except Exception as error:
        return {
            "enabled": False,
            "status": "UNAVAILABLE",
            "threat": None,
            "raw_output": str(error),
        }

def analyze_file(filename: str, file_bytes: bytes):
    lower_name = filename.lower()
    risk_score = 0
    reasons = []

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
    hash_reputation = check_hash_reputation(sha256_hash)
    
    hash_ioc = check_ioc_record(
        "SHA256",
        sha256_hash,
    )

    detected_file_type = detect_file_signature(file_bytes)
    entropy = calculate_entropy(file_bytes)
    script_matches = detect_script_patterns(file_bytes)
    zip_findings = inspect_zip_contents(file_bytes)
    clamav_result = scan_with_clamav(filename, file_bytes)
    
    if hash_reputation["status"] == "KNOWN_MALICIOUS":
        risk_score = 100
        reasons.insert(
            0,
            f"Known malicious file hash detected: {hash_reputation['threat']}"
        )
        
    if hash_ioc.get("matched"):
        record = hash_ioc["record"]

        risk_score = 100

        reasons.insert(
            0,
            f"IOC database match: {record['description']}"
        )

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

    if (
        detected_file_type == "Windows executable"
        and not lower_name.endswith(".exe")
    ):
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

    if script_matches:
        risk_score += min(len(script_matches) * 15, 60)
        reasons.append(
            "Suspicious script behavior detected: " + ", ".join(script_matches[:5])
        )

    for part in parts[:-1]:
        dangerous_part = f".{part}"

        if dangerous_part in DANGEROUS_EXTENSIONS:
            risk_score += 40
            reasons.append(
                f"Hidden dangerous extension detected inside filename: {dangerous_part}"
            )

    if zip_findings:
        risk_score += min(len(zip_findings) * 20, 60)
        reasons.extend(zip_findings[:5])

    if file_size == 0:
        risk_score += 20
        reasons.append("File is empty or unreadable")

    if file_size > 25 * 1024 * 1024:
        risk_score += 10
        reasons.append("File is larger than 25MB")

    if clamav_result["status"] == "INFECTED":
        risk_score = 100
        reasons.insert(
            0,
            f"ClamAV detected malware signature: {clamav_result['threat']}"
        )

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
        "hash_reputation": hash_reputation,
        "hash_ioc": hash_ioc,
        "risk_score": risk_score,
        "threat_level": threat_level,
        "reasons": reasons,
        "archive_findings": zip_findings,
        "suspicious_script_patterns": script_matches,
        "antivirus": clamav_result,
        "scan_type": "Static file scan",
        "engine_version": "0.1.0",
        "status": "File scan complete",
    }

    scan_result["ai_summary"] = generate_file_ai_summary(scan_result)

    return scan_result