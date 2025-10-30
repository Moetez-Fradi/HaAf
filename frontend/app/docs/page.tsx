export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <h1 className="text-4xl font-bold text-center text-white mb-6">
        Welcome to AgentHive, an automation building platform powered by people!
      </h1>

      <p className="text-lg leading-relaxed text-gray-300 mb-10 text-center">
        This documentation will help you understand and use our decentralized platform effectively. 
        Our platform combines AI, decentralization Concepts and Hedera services to ensure a secure hive for everyone!
      </p>

      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        What is AgentHive?
      </h2>

      <p className="text-gray-300 leading-relaxed mb-6">
        Our platform is a revolutionary approach to creating automations that leverages decentralization 
        and opnenness to ensure:
      </p>

      <ul className="list-disc list-inside space-y-2 text-gray-300 mb-10">
        <li>Secure and transparent tool creation and usage</li>
        <li>Secure and easy workflow development</li>
        <li>Decentralized workflow hosting</li>
        <li>Fair and transparent payment for all members</li>
      </ul>

      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-6">
        Key Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="feature-card bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-400/30 transition">
          <h3 className="text-2xl font-semibold mb-3 text-white">Tool Management</h3>
          <p className="text-gray-400">Create, deploy, and manage tools while earning HBAR for each workflow that uses your tool.</p>
        </div>

        <div className="feature-card bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-400/30 transition">
          <h3 className="text-2xl font-semibold mb-3 text-white">Workflow Automation</h3>
          <p className="text-gray-400">Build complex workflows combining multiple tools with automated execution and monitoring.</p>
        </div>

        <div className="feature-card bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-400/30 transition">
          <h3 className="text-2xl font-semibold mb-3 text-white">Hedera Integration</h3>
          <p className="text-gray-400">Leverage Hedera's secure and fast blockchain network for transaction processing and verification.</p>
        </div>

        <div className="feature-card bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-400/30 transition">
          <h3 className="text-2xl font-semibold mb-3 text-white">Node System</h3>
          <p className="text-gray-400">Distributed node architecture for scalable and reliable tool execution, no more expensive AWS bills!</p>
        </div>
      </div>

      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Getting Started
      </h2>

      <p className="text-gray-300 leading-relaxed mb-6">
        To get started with the platform, we recommend following these steps:
      </p>

      <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-10">
        <li>Read through the Quick Start guide</li>
        <li>Create your first tool</li>
        <li>Build a simple workflow</li>
        <li>Learn about advanced features</li>
      </ol>

      <div className="info-block bg-gray-900 border border-gray-700 p-6 rounded-2xl mt-8">
        <h3 className="text-2xl font-semibold text-white mb-2">Need Help?</h3>
        <p className="text-gray-400">
          If you need assistance, check out our detailed guides in the sidebar or reach out to our support team.
        </p>
      </div>
    </div>
  )
}
