import Image from 'next/image';

export default function ToolsDocPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Tools Documentation
      </h1>

      <p className="text-lg leading-relaxed text-gray-300 mb-10 text-center">
        Tools are the <strong>core components</strong> of the AgentHive platform.
        Each tool is a <strong>containerized microservice</strong> that performs a specific function, 
    such as sending emails, classifying text, or interacting with external APIs.
      </p>

      {/* --- Section: Creating a New Tool --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Creating a New Tool
      </h2>

      <p className="text-gray-300 mb-6">
        To create your own tool, you’ll define its behavior, inputs, outputs, and environment
        configuration. Every tool runs inside a Docker container for portability and security.
      </p>

      <h3 className="text-2xl font-semibold text-blue-300 mt-8 mb-3">
        Requirements
      </h3>
      <ul className="list-disc list-inside text-gray-400 space-y-2 mb-8">
        <li>A valid hosted <code className="text-blue-300">Dockerfile</code> in a public repo at     <a href="https://hub.docker.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
      Dockerhub
    </a></li>
        <li>Defined input and output schema</li>
        <li>Required environment variables (if applicable)</li>
      </ul>

      <h3 className="text-2xl font-semibold text-blue-300 mt-8 mb-3">
        Example: Email Sender Tool
      </h3>

      <p className="text-gray-400 mb-4">
        Below is an example of a simple Python-based tool that sends an email using SMTP.
      </p>

      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 my-6">
        <pre className="text-sm text-gray-100 overflow-x-auto">
{`# email_sender.py
from fastapi import FastAPI
from pydantic import BaseModel
import smtplib, os

app = FastAPI()

class RunInput(BaseModel):
    email: str
    message: str

@app.post("/run")
async def run_tool(data: RunInput):
    try:
        sender = os.getenv("SMTP_USER", "noreply@example.com")
        password = os.getenv("SMTP_PASS", "")
        host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        port = int(os.getenv("SMTP_PORT", "587"))

        with smtplib.SMTP(host, port) as server:
            server.starttls()
            if password:
                server.login(sender, password)
            server.sendmail(sender, data.email, f"Subject: Message\\n\\n{data.message}")

        return {"status": "sent", "details": f"Message sent to {data.email}"}
    except Exception as e:
        return {"status": "failed", "error": str(e)"}`}
        </pre>
      </div>

      {/* --- Section: Registering a Tool --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Registering Your Tool
      </h2>

      <p className="text-gray-300 mb-6">
        Once your container is ready, register it on AgentHive through the platform interface or API.
        The registration includes metadata like the Docker image, input/output shapes, and required
        environment variables.
      </p>

      <h3 className="text-2xl font-semibold text-blue-300 mt-8 mb-3">
        Example Tool Registration Request
      </h3>

      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 my-6">
        <pre className="text-sm text-gray-100 overflow-x-auto">
{`{
  "name": "EmailSender",
  "description": "Send an email to whoever you want!",
  "dockerImageUrl": "goldendragon4/emailertool",
  "usagePrice": 0,
  "requiredEnv": ["SMTP_PASS", "SMTP_USER", "SMTP_HOST", "SMTP_PORT"],
  "inputShape": "{'email': 'email@gmail.com', 'message': 'message'}",
  "outputShape": "{'status': 'sent', 'details': 'Message sent to email@gmail.com'}"
}`}
        </pre>
      </div>

      <p className="text-gray-400 mb-8">
        Ensure that all environment variables used in your code are listed in{" "}
        <code className="text-blue-300">requiredEnv</code> for secure configuration during execution.
      </p>

      {/* --- Section: Testing --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Testing Your Tool
      </h2>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-2">
        Local Testing
      </h3>
      <ol className="list-decimal list-inside text-gray-400 space-y-2 mb-8">
        <li>Build the image: <code className="text-blue-300">docker build -t emailer .</code></li>
        <li>Run locally: <code className="text-blue-300">docker run -p 8080:80 emailer</code></li>
        <li>Send a test POST request to <code className="text-blue-300">/run</code></li>
        <li>Check logs and outputs for validation.</li>
      </ol>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-2">
        Platform Testing
      </h3>
      <ol className="list-decimal list-inside text-gray-400 space-y-2 mb-10">
        <li>Upload or register the tool on AgentHive.</li>
        <li>You'll be redirected to the <strong>Testing Interface</strong></li>
        <li>Run test executions using sample input data.</li>
        <li>View logs and outputs after each run.</li>
      </ol>

      {/* --- Section: Best Practices --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Best Practices
      </h2>

      <ul className="list-disc list-inside text-gray-400 space-y-2 mb-10">
        <li>Keep tools <strong>modular</strong> and <strong>single-purpose</strong>.</li>
        <li>Implement consistent response formats (<code>{`{ "status": "sent" }`}</code>).</li>
        <li>Use environment variables for all secrets and API keys.</li>
        <li>Include meaningful logs for debugging.</li>
        <li>Version your tools properly (<code>1.0.0</code>, <code>1.1.0</code>, etc.).</li>
        <li>Document your input and output formats clearly.</li>
      </ul>

      {/* --- Info and Warning Boxes --- */}
      <div className="mt-10 p-6 bg-blue-100/10 border border-blue-400/40 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold text-blue-400 mb-2">Sample Tools</h3>
        <p className="text-blue-200">
          Explore these examples for reference implementations:
        </p>
        <ul className="list-disc list-inside text-blue-300 mt-2">
          <li><strong>EmailSender</strong> : send emails through SMTP</li>
          <li><strong>TextClassifier</strong> : classify text using AI models</li>
        </ul>
      </div>

      <div className="mt-10 p-6 bg-yellow-100/10 border border-yellow-400/40 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold text-yellow-400 mb-2">Important Note</h3>
        <p className="text-yellow-200 leading-relaxed">
          Always follow security best practices when deploying to production.
          Never hardcode credentials — use secure environment variables instead.
        </p>
      </div>
    </div>
  );
}
