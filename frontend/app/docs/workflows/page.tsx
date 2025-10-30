import Image from 'next/image';

export default function WorkflowsDocPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Workflows Documentation
      </h1>

      <p className="text-lg leading-relaxed text-gray-300 mb-10 text-center">
        Workflows are sequences of connected tools that work together to achieve a specific goal.
        Our platform provides a powerful workflow engine that handles tool execution,
        data flow, and error handling.
      </p>

      {/* --- Workflow Concepts --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Workflow Concepts
      </h2>

      <h3 className="text-2xl font-semibold text-blue-300 mt-6 mb-3">
        Basic Components
      </h3>
      <ul className="list-disc list-inside text-gray-400 space-y-2 mb-10">
        <li><strong>Nodes:</strong> Individual tool instances in the workflow</li>
        <li><strong>Connections:</strong> Data flow between tools</li>
        <li><strong>Conditions:</strong> Logic that controls workflow paths</li>
      </ul>

      {/* --- Workflow Steps --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Creating a Workflow
      </h2>

      <ol className="list-decimal list-inside space-y-8 text-gray-300 mb-16">
        <li>
          <strong className="text-white text-lg">Navigate to the workflow creation interface</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            Go to the Workflows section in the platform UI and click "create your own!".
          </p>
        </li>

        <li>
          <strong className="text-white text-lg">Designing the Workflow</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            Use the visual workflow designer to create your workflow steps.
            On the right panel, you will see a list of tools from which you can choose, drag, drop, and edit with your own variables.
            Each tool provides an input and output shape.
          </p>

          <div className="my-6">
            <Image
              src="/docs1.png"
              alt="Documentation image"
              width={1000}
              height={750}
              className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition"
            />
          </div>

          <p className="text-gray-400 leading-relaxed">
            You can link your tools from output of one to input of another only, by dragging an arrow from one point to the other.
            Each edge can have a condition that you should write in JavaScript syntax, e.g.:
            <code className="bg-gray-800 px-2 py-1 rounded text-blue-300 ml-2">
              closest_category === 'technology'
            </code>.
          </p>

          <div className="my-6">
            <Image
              src="/docs2.png"
              alt="Documentation image"
              width={1000}
              height={750}
              className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition"
            />
          </div>

          <p className="text-gray-400 leading-relaxed">
            Each edge also needs a mapping, which is how you transform an incoming output to the desired shape of the next tool.
            You can use variables this way:
          </p>

          <div className="my-6">
            <Image
              src="/docs3.png"
              alt="Documentation image"
              width={1000}
              height={750}
              className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition"
            />
          </div>

          <p className="text-gray-400 leading-relaxed">
            You can use any variable that is defined as an input or output of any precedent tool for the mapping of the next one!
          </p>
        </li>

        <li>
          <strong className="text-white text-lg">Testing</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            Once you're happy with your workflow, you can test it! Testing will deploy an instance of each tool you used.
          </p>

          <div className="my-6 space-y-6">
            <Image src="/docs4.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <p className="text-gray-400">The test interface will be available for 25 minutes to verify your workflow.</p>

            <Image src="/docs5.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <p className="text-gray-400">Test with any inputs and get a full log of each tool execution.</p>

            <Image src="/docs6.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <Image src="/docs7.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />

            <p className="text-gray-400 leading-relaxed">
              Ensure your workflow is valid before deploying. Automated tests can be set in the deployment page.
            </p>

            <Image src="/docs8.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
          </div>
        </li>

        <li>
          <strong className="text-white text-lg">Congrats!</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            You now have a working workflow hosted either on renter Nodes or our own servers.
          </p>

          <div className="my-6 space-y-6">
            <Image src="/docs9.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <p className="text-gray-400 leading-relaxed">
              Your workflow is now featured on your profile — users can try it out and use it!
            </p>
            <Image src="/docs10.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
          </div>
        </li>
      </ol>

      {/* --- Best Practices --- */}
      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Best Practices
      </h2>

      <ul className="list-disc list-inside text-gray-400 space-y-2 mb-10">
        <li>Keep workflows modular and reusable</li>
        <li>Use meaningful names for nodes and connections</li>
        <li>Document workflow purpose and requirements</li>
        <li>Test workflows thoroughly before deployment</li>
      </ul>

      {/* --- Template Workflows --- */}
      <div className="mt-10 p-6 bg-green-100/10 border border-green-400/40 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold text-green-400 mb-2">Template Workflows</h3>
        <p className="text-green-200">
          We provide several template workflows to help you get started:
        </p>
        <ul className="list-disc list-inside text-green-300 mt-2">
          <li>Document Processing Pipeline</li>
          <li>Data Analysis Workflow</li>
          <li>Notification System</li>
        </ul>
      </div>
    </div>
  )
}
