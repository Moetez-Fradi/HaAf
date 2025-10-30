export default function HederaDocPage() {
  return (
    <div className="prose max-w-none">
            <h1 className="text-4xl font-bold text-center text-white mb-8">
Hedera Integration</h1>

      <p>
        Our platform leverages the Hedera network for secure, fast, and reliable
        payment functionality.
      </p>

      
      <div className="mt-8 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-purple-800">Resources</h3>
        <ul className="text-purple-600">
          <li><a href="https://docs.hedera.com" className="text-purple-600 hover:text-purple-800">Hedera Documentation</a></li>
          <li><a href="https://hashpack.app" className="text-purple-600 hover:text-purple-800">HashPack Wallet</a></li>
          <li><a href="https://portal.hedera.com" className="text-purple-600 hover:text-purple-800">Hedera Portal</a></li>
        </ul>
      </div>
    </div>
  )
}