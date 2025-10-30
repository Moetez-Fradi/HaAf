export default function QuickStartPage() {
  return (
    <div className="prose max-w-none">
      <h1>Quick Start Guide</h1>

      <p>
        This guide will help you get up and running with the Blockchain Tool Management
        Platform quickly. We'll cover the basics of setting up your environment and
        creating your first tool and workflow.
      </p>

      <h2>Prerequisites</h2>

      <ul>
        <li>Node.js 16.x or higher</li>
        <li>PNPM package manager</li>
        <li>Docker and Docker Compose</li>
        <li>A Hedera testnet account</li>
      </ul>

      <h2>Installation</h2>

      <div className="bg-gray-100 p-4 rounded-md my-4">
        <code className="block whitespace-pre">
          {`# Clone the repository
git clone https://github.com/your-username/blockchain-tool-management.git

# Install dependencies
cd blockchain-tool-management
pnpm install

# Set up environment variables
cp .env.example .env`}
        </code>
      </div>

      <h2>Configuration</h2>

      <p>
        Configure your environment variables in the <code>.env</code> file:
      </p>

      <div className="bg-gray-100 p-4 rounded-md my-4">
        <code className="block whitespace-pre">
          {`# Hedera Configuration
HEDERA_ACCOUNT_ID=your-account-id
HEDERA_PRIVATE_KEY=your-private-key

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# JWT Configuration
JWT_SECRET=your-jwt-secret`}
        </code>
      </div>

      <h2>Starting the Application</h2>

      <div className="bg-gray-100 p-4 rounded-md my-4">
        <code className="block whitespace-pre">
          {`# Start the database
docker-compose up -d

# Run migrations
cd backend
pnpm prisma migrate dev

# Start the backend
pnpm start:dev

# In a new terminal, start the frontend
cd frontend
pnpm dev`}
        </code>
      </div>

      <h2>Creating Your First Tool</h2>

      <p>
        Follow these steps to create your first tool:
      </p>

      <ol>
        <li>
          <strong>Create a Docker image</strong>
          <p>Create a Dockerfile for your tool following our template in the sampleTools directory.</p>
        </li>
        <li>
          <strong>Register the tool</strong>
          <p>Use the platform UI or API to register your tool with its metadata and configuration.</p>
        </li>
        <li>
          <strong>Test the tool</strong>
          <p>Use the testing interface to verify your tool's functionality.</p>
        </li>
      </ol>

      <h2>Creating Your First Workflow</h2>

      <ol>
        <li>
          <strong>Navigate to Workflows</strong>
          <p>Go to the Workflows section in the platform UI.</p>
        </li>
        <li>
          <strong>Design the Workflow</strong>
          <p>Use the visual workflow designer to create your workflow steps.</p>
        </li>
        <li>
          <strong>Configure Steps</strong>
          <p>Add your tool as a step and configure its inputs/outputs.</p>
        </li>
        <li>
          <strong>Deploy and Test</strong>
          <p>Save your workflow and run a test execution.</p>
        </li>
      </ol>

      <h2>Next Steps</h2>

      <p>
        After completing this quick start guide, you might want to:
      </p>

      <ul>
        <li>Learn about advanced tool configurations</li>
        <li>Explore workflow patterns and best practices</li>
        <li>Set up monitoring and alerts</li>
        <li>Integrate with the Hedera network</li>
      </ul>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-yellow-800">Important Note</h3>
        <p className="text-yellow-600">
          Make sure to follow security best practices when deploying to production.
          Review our security documentation for more information.
        </p>
      </div>
    </div>
  )
}