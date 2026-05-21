
def generate_ai_summary(scan_data: dict):

    risk = scan_data.get("risk_score", 0)
    threat = scan_data.get("threat_level", "UNKNOWN")

    scripts = scan_data.get("scripts_detected", 0)

    login_forms = scan_data.get(
        "login_forms_detected",
        0,
    )

    reasons = scan_data.get("reasons", [])

    summary_parts = []

    # Threat level overview
    if threat == "HIGH":
        summary_parts.append(
            "This website appears highly suspicious "
            "based on multiple detected indicators."
        )

    elif threat == "MEDIUM":
        summary_parts.append(
            "This website shows several moderate-risk "
            "behaviors that may require caution."
        )

    else:
        summary_parts.append(
            "This website currently appears relatively "
            "low risk based on available analysis."
        )

    # Script analysis
    if scripts > 15:
        summary_parts.append(
            "A high number of scripts were detected, "
            "which may indicate tracking, obfuscation, "
            "or aggressive client-side behavior."
        )

    # Login analysis
    if login_forms > 0:
        summary_parts.append(
            "Login-related forms were detected on "
            "the page."
        )

    # Risk explanations
    if reasons:
        summary_parts.append(
            "Key risk indicators include: "
            + ", ".join(reasons[:3])
            + "."
        )

    return " ".join(summary_parts)