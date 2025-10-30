export default function WalletIntegrationPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <h1 className="text-4xl font-bold text-center text-white mb-8">
        Integrating Your Wallet
      </h1>

      <p className="text-lg leading-relaxed text-gray-300 mb-10 text-center">
        Follow these simple steps to connect your wallet and start using it with our platform.
      </p>

      <h2 className="text-3xl font-semibold text-blue-400 mt-10 mb-4">
        Steps to Integrate Your Wallet
      </h2>

      <ol className="list-decimal list-inside space-y-8 text-gray-300 mb-16">
        <li>
          <strong className="text-white text-lg">Download Haspack</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            Haspack is our wallet interface application. Download it from the official site and install it on your machine.
          </p>
        </li>

        <li>
          <strong className="text-white text-lg">Create or Access a Hedera Account</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            If you don’t have a Hedera account yet, create one at <a href="https://hedera.com" target="_blank" className="text-blue-400 underline">hedera.com</a>. 
            Make sure to safely store your account credentials.
          </p>
        </li>

        <li>
          <strong className="text-white text-lg">Copy Your Pairing String</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            In your Hedera account dashboard, generate a pairing string. This string will allow Haspack to link with your wallet securely.
          </p>
        </li>

        <li>
          <strong className="text-white text-lg">Paste the Pairing String into Haspack</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            Open Haspack, go to the wallet integration section, and paste your pairing string. Confirm the connection.
          </p>
        </li>

        <li>
          <strong className="text-white text-lg">All Done!</strong>
          <p className="ml-4 text-gray-400 leading-relaxed mt-2">
            Your wallet is now successfully integrated. You can start sending and receiving transactions, or interact with workflows and tools that require your wallet.
          </p>
        </li>
      </ol>

      <div className="mt-10 p-6 bg-green-100/10 border border-green-400/40 rounded-2xl shadow-lg">
        <h3 className="text-2xl font-semibold text-green-400 mb-3">Tips</h3>
        <ul className="list-disc list-inside text-green-300 space-y-1">
          <li>Keep your pairing string secure and do not share it publicly.</li>
          <li>Ensure Haspack is always updated to the latest version.</li>
          <li>Check network connectivity if the wallet fails to link.</li>
        </ul>
      </div>
    </div>
  )
}

