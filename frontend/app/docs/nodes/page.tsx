export default function NodesDocPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Node System Documentation
      </h1>

      <p className="text-lg leading-relaxed text-gray-300 mb-10 text-center">
        The Node System is a crucial component of our platform that handles the
        execution of tools and workflows in a distributed environment. This
        documentation explains how nodes work.
      </p>

      {/* --- Node Architecture --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Node Architecture
      </h2>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-3">
        Components
      </h3>
      <ul className="list-disc list-inside text-gray-400 space-y-2 mb-10">
        <li><strong>Decentralizer:</strong> Manages node distribution and load balancing</li>
        <li><strong>Renter:</strong> Handles tool execution and resource management</li>
      </ul>

      {/* --- Node Types --- */}


      {/* --- Node Setup --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Node Setup
      </h2>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-2">Requirements</h3>
      <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
        <li>Docker runtime environment</li>
        <li>Network connectivity</li>
        <li>Required system resources</li>
        <li>Security certificates</li>
      </ul>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-2">Installation</h3>
      <div className="bg-gray-800 p-6 rounded-xl my-4 shadow-md overflow-x-auto">
        <code className="block text-green-300 whitespace-pre">
{`# Install node dependencies
pnpm install

# Start the node
node renter-node.js`}
        </code>
      </div>
              <p>Then you'll be prompted to login and chose the renting hardware based on how much you have of CPU cores and RAM.</p>


      {/* --- Node Management --- */}
      

      {/* --- Tool Execution --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Tool Execution
      </h2>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-2">Execution Flow</h3>
      <ol className="list-decimal list-inside text-gray-400 mb-6 space-y-1">
        <li>The server checks for available nodes. Each available node keeps sending heartbeats every 2 minutes, if a node doesn't send a heart 
            beat for more than 5 minutes it's marked as inactive.
        </li>
        <li>If there are enough nodes for a workflow to run, each tool is sent to a node for it to run.</li>
        <li>Once every node has run the container associated correctly, the users gets back a single url that handles the connection between them.</li>
        <li>You can send a request to that url and recieve responses normally.</li>
        <li>If no nodes are available, the tools are run on another public server.</li>
      </ol>

      {/* --- Security --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Security
      </h2>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-2">Node Security</h3>
      <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
        <li>SSL/TLS encryption</li>
        <li>Authentication mechanisms</li>
        <li>Access control</li>
        <li>One time tokens to prevent reusage of keys</li>
      </ul>
    </div>
  )
}
