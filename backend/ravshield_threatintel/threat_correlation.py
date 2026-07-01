from ravshield_threatintel.domain_reputation import analyze_domain_reputation
from ravshield_threatintel.ip_reputation import analyze_ip_reputation
from ravshield_threatintel.ioc_database import check_ioc_record


def correlate_url_threats(domain: str, resolved_ip: str):
    correlation_reasons = []
    risk_adjustment = 0
    matched_iocs = []

    domain_reputation = analyze_domain_reputation(domain)

    if domain_reputation.get("risk_score", 0) >= 30:
        risk_adjustment += 15
        correlation_reasons.append(
            "Domain reputation engine found suspicious indicators."
        )

    domain_ioc = check_ioc_record("DOMAIN", domain)

    if domain_ioc.get("matched"):
        risk_adjustment += 40
        matched_iocs.append(domain_ioc["record"])
        correlation_reasons.append(
            "Domain matched local IOC database."
        )

    ip_reputation = None
    ip_ioc = None

    if resolved_ip and resolved_ip != "Unable to resolve":
        ip_reputation = analyze_ip_reputation(resolved_ip)

        if ip_reputation.get("risk_score", 0) >= 30:
            risk_adjustment += 15
            correlation_reasons.append(
                "Resolved IP reputation engine found suspicious indicators."
            )

        ip_ioc = check_ioc_record("IP", resolved_ip)

        if ip_ioc.get("matched"):
            risk_adjustment += 40
            matched_iocs.append(ip_ioc["record"])
            correlation_reasons.append(
                "Resolved IP matched local IOC database."
            )

    risk_adjustment = min(risk_adjustment, 100)

    has_high_ioc = any(
    ioc.get("severity") == "HIGH"
    for ioc in matched_iocs
)

    has_medium_ioc = any(
        ioc.get("severity") == "MEDIUM"
        for ioc in matched_iocs
    )

    if has_high_ioc:
        correlation_level = "HIGH"
    elif risk_adjustment >= 70:
        correlation_level = "HIGH"
    elif has_medium_ioc:
        correlation_level = "MEDIUM"
    elif risk_adjustment >= 30:
        correlation_level = "MEDIUM"
    elif risk_adjustment > 0:
        correlation_level = "LOW"
    else:
        correlation_level = "NONE"

    if not correlation_reasons:
        correlation_reasons.append(
            "No IOC or reputation correlation found."
        )

    return {
        "correlation_level": correlation_level,
        "risk_adjustment": risk_adjustment,
        "domain_reputation": domain_reputation,
        "ip_reputation": ip_reputation,
        "matched_iocs": matched_iocs,
        "reasons": correlation_reasons,
    }