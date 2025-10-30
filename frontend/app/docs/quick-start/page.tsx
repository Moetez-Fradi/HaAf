import Image from 'next/image';

export default function QuickStartPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Quick Start Guide
      </h1>

      <p className="text-lg leading-relaxed text-gray-300 mb-10 text-center">
        This guide will help you understand the core features and how to interact with AgentHive.
      </p>

      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Creating Your First Workflow
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
            <code className="bg-gray-800 px-2 py-1 rounded text-blue-300 ml-2">closest_category === 'technology'</code>.
            Please note that you should only use single quotes inside the conditions!
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
            Each edge also needs a mapping, which is the way you transform an incoming output to the desired shape of the next tool.
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
            Once you're happy with your workflow, you can test it! Testing will take a while to deploy an instance of each tool you used.
          </p>

          <div className="my-6 space-y-6">
            <Image src="/docs4.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <p className="text-gray-400">Once done, you will have an interface to test your incredible workflow! The instance will only be up for 25 minutes for you to test it.</p>

            <Image src="/docs5.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <p className="text-gray-400">
              This is your free space to test your workflow as much as you need, with the weirdest inputs you can think of, and you get a full
              log of what each of your tools are doing after each execution!
            </p>

            <Image src="/docs6.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <Image src="/docs7.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />

            <p className="text-gray-400 leading-relaxed">
              This space is important for you to make sure you're creating a valid workflow for your future users. Once you're happy, you can pass to deploying.
            </p>

            <p className="text-gray-400 leading-relaxed">
              In the deploying page, you'll have the opportunity to set automated tests, where the server runs your inputs automatically and sends you a detailed report of what worked and what didn’t.
            </p>

            <Image src="/docs8.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
          </div>
        </li>

        <li>
          <strong className="text-white text-lg">Congrats!</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            And that's it! You now have a working workflow that we host for you, either on renter Nodes from around the world or on our own server if no sufficient nodes are available.
          </p>

          <div className="my-6 space-y-6">
            <Image src="/docs9.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
            <p className="text-gray-400 leading-relaxed">
              You'll find your workflow now featured on your profile — users can try it out and use it!
            </p>
            <Image src="/docs10.png" alt="Documentation image" width={1000} height={750} className="rounded-xl shadow-lg hover:shadow-blue-400/30 transition" />
          </div>
        </li>
      </ol>

      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Creating Your First Tool
      </h2>

      <p className="text-gray-300 leading-relaxed mb-6">
        Follow these steps to create your first tool:
      </p>

      <ol className="list-decimal list-inside space-y-4 text-gray-300 mb-16">
        <li>
          <strong className="text-white">Create a Docker image</strong>
          <p className="ml-4 text-gray-400">
            Dockerize your tool's code and push it to Docker Hub in a public container.
            Make sure it exposes a <code className="bg-gray-800 px-2 py-1 rounded text-blue-300 ml-1">/run</code> endpoint.
          </p>
        </li>
        <li>
          <strong className="text-white">Register the tool</strong>
          <p className="ml-4 text-gray-400">
            Use the platform to register your tool with its metadata and configuration.
          </p>
        </li>
        <li>
          <strong className="text-white">Test the tool</strong>
          <p className="ml-4 text-gray-400">
            Use the testing interface to verify your tool's functionality.
          </p>
        </li>
      </ol>

      <h2 className="text-3xl font-semibold text-blue-400 mt-12 mb-4">
        Next Steps
      </h2>

      <p className="text-gray-300 leading-relaxed mb-6">
        After completing this quick start guide, you might want to:
      </p>

      <ul className="list-disc list-inside space-y-2 text-gray-300 mb-10">
        <li>Learn about advanced tool configurations</li>
        <li>Explore workflow patterns and best practices</li>
        <li>Learn about node renting</li>
      </ul>

      <div className="mt-12 p-6 bg-yellow-100/10 border border-yellow-400/40 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold text-yellow-400 mb-2">Important Note</h3>
        <p className="text-yellow-200 leading-relaxed">
          Make sure to follow security best practices when deploying to production.
          Review our security documentation for more information.
        </p>
      </div>
    </div>
  )
}
