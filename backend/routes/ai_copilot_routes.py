from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai-copilot", tags=["AI Copilot"])


class CopilotRequest(BaseModel):
    question: str


@router.post("/ask")
def ask_copilot(payload: CopilotRequest):
    question = payload.question.lower()

    if "phishing" in question:
        answer = (
            "Phishing is a cyberattack where an attacker tries to trick users "
            "into entering passwords, credit cards, or private information on "
            "a fake website. Warning signs include suspicious domains, login "
            "keywords, urgent messages, and invalid SSL."
        )

    elif "ssl" in question:
        answer = (
            "SSL protects the connection between the browser and the website. "
            "If SSL is invalid or expired, users should avoid entering sensitive "
            "information because the site may not be trustworthy."
        )

    elif "sql injection" in question:
        answer = (
            "SQL injection happens when attackers insert malicious database "
            "commands into input fields. It can expose, modify, or delete data "
            "if the backend does not validate inputs properly."
        )

    elif "high risk" in question or "dangerous" in question:
        answer = (
            "A high-risk result usually means the target matched multiple danger "
            "signals such as suspicious keywords, invalid SSL, redirects, malware "
            "indicators, or unsafe reputation patterns."
        )

    elif "quarantine" in question:
        answer = (
            "Quarantine means the file was moved to a safe isolated location so "
            "it cannot run or harm the system. The user can later restore or "
            "delete it after review."
        )

    else:
        answer = (
            "I can explain phishing, SSL issues, SQL injection, high-risk URLs, "
            "malware detections, quarantine, and security scan results."
        )

    return {
        "question": payload.question,
        "answer": answer,
        "engine": "Rule-based AI Copilot V1",
    }