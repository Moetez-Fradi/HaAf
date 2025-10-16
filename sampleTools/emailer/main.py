from fastapi import FastAPI, Request
from pydantic import BaseModel
import smtplib, os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

class RunInput(BaseModel):
    message: str
    email: str

@app.post("/run")
async def run_tool(data: RunInput):
    try:
        sender = os.getenv("SMTP_USER", "noreply@example.com")
        password = os.getenv("SMTP_PASS", "")
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            if password:
                server.login(sender, password)
            server.sendmail(sender, data.email, f"Subject: Message\n\n{data.message}")

        return {"status": "sent", "details": f"Message sent to {data.email}"}

    except Exception as e:
        return {"status": "failed", "error": str(e)}
