'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  dockerImageUrl: string;
  usagePrice: number;
  status: string;
  rating?: number;
  inputShape: string | object;
  outputShape: string | object;
  ownerWallet: string;
  requiredEnv: string[];
  priceMode?: string;
  fixedPrice?: number;
  energyBaseline?: number;
}

interface TestResult {
  success: boolean;
  deployed: boolean;
  pending?: boolean;
  instance?: any;
  tool?: Tool;
  reason?: string;
  details?: any;
  testReport?: any;
}

interface InputShape {
  [key: string]: string | object;
}

interface TestInput {
  [key: string]: string | number | boolean | object | any[];
}

const API_BASE = 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('access_token');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.state?.token ?? null; 
    } catch (err) {
      console.error('Failed to parse token from localStorage', err);
      return null;
    }
  }
  return null;
};

const getWalletAddress = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    const localWallet = localStorage.getItem('walletAccountId');
    if (localWallet) {
      console.log('Wallet address retrieved from localStorage:', localWallet);
      return localWallet;
    }
    
    try {
      const token = getAuthToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.walletAccountId) {
          localStorage.setItem('walletAccountId', userData.walletAccountId);
          console.log('Wallet address retrieved from backend:', userData.walletAccountId);
          return userData.walletAccountId;
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallet from backend:', error);
    }
  }
  return null;
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    DEPLOYED: { color: 'bg-green-500/20 text-green-400 border-green-400/30', label: 'Deployed' },
    TESTING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30', label: 'Testing' },
    PENDING: { color: 'bg-blue-500/20 text-blue-400 border-blue-400/30', label: 'Pending' },
    FAILED: { color: 'bg-red-500/20 text-red-400 border-red-400/30', label: 'Failed' },
    RUNNING: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30', label: 'Running' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || 
                 { color: 'bg-gray-500/20 text-gray-400 border-gray-400/30', label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function TestToolPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.id as string;

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState('configuration');
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [testInput, setTestInput] = useState<TestInput>({});
  const [testOutput, setTestOutput] = useState<any>(null);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const checkWalletAndLoad = async () => {
      const wallet = await getWalletAddress();
      setUserWallet(wallet);
      setWalletLoading(false);
      
      if (!wallet) {
        console.warn('No wallet connected. Redirecting...');
        alert('Please connect your wallet to test tools');
        router.push('/tools');
        return;
      }
    };

    checkWalletAndLoad();
  }, [router]);

  useEffect(() => {
    if (walletLoading || !userWallet || !toolId) return;
    loadToolDetails();
  }, [toolId, userWallet, walletLoading]);

const loadToolDetails = async () => {
  setLoading(true);
  console.log('🌀 Loading tool details for ID:', toolId);

  try {
    const token = getAuthToken();
    console.log('🔑 Token found:', token ? 'Yes' : 'No');

    const url = `${API_BASE}/tools/${toolId}`;
    console.log('📡 Fetching tool details from:', url);

    const toolResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Tool fetch response status:', toolResponse.status);

    const rawText = await toolResponse.text();
    console.log('📦 Raw response text:', rawText);

    if (!toolResponse.ok) {
      throw new Error(`Failed to fetch tool details: ${rawText}`);
    }

    const toolData: Tool = JSON.parse(rawText);
    console.log('✅ Tool data received:', toolData);

    setTool(toolData);
    const initialEnvVars: Record<string, string> = {};
    toolData.requiredEnv?.forEach((env: string) => (initialEnvVars[env] = ''));
    setEnvVars(initialEnvVars);

    // Input shape parsing
    try {
      let inputShape: InputShape = {};
      if (typeof toolData.inputShape === 'string') {
        inputShape = toolData.inputShape === 'Not specified'
          ? { input: 'string' }
          : JSON.parse(toolData.inputShape);
      } else {
        inputShape = toolData.inputShape as InputShape;
      }

      const initialInput: TestInput = {};
      Object.keys(inputShape).forEach((key) => {
        const type = inputShape[key];
        if (typeof type === 'string') {
          if (type.includes('number')) initialInput[key] = 0;
          else if (type.includes('bool')) initialInput[key] = false;
          else if (type.includes('array')) initialInput[key] = [];
          else if (type.includes('object')) initialInput[key] = {};
          else initialInput[key] = '';
        } else {
          initialInput[key] = '';
        }
      });
      setTestInput(initialInput);
    } catch (e) {
      console.warn('Failed to parse inputShape, using default');
      setTestInput({ input: '' });
    }
  } catch (error) {
    console.error('❌ Error loading tool details:', error);
    alert('Failed to load tool details (see console for details)');
  } finally {
    setLoading(false);
  }
}; 
const handleEnvVarChange = (key: string, value: string) => {
  console.log('Env var changed:', key, value);
  setEnvVars(prev => ({ ...prev, [key]: value }));
};

const handleTestInputChange = (key: string, value: any) => {
  console.log('Test input changed:', key, value);
  setTestInput(prev => ({ ...prev, [key]: value }));
};

const pollInstanceStatus = async (instanceId: string, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/instances/${instanceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const instance = await response.json();
        if (instance.usageUrl && instance.status === 'RUNNING') {
          return instance;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Polling error:', error);
    }
  }
  throw new Error('Instance failed to start within timeout');
};

const startTest = async () => {
  console.log('🚀 Starting test...');
  if (!userWallet) {
    alert('Please connect your wallet');
    return;
  }

  setTesting(true);
  setTestResult(null);

  try {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to test tools');
      return;
    }

    const url = `${API_BASE}/tools/${toolId}/test`;
    console.log('📡 Sending test request to:', url);
    console.log('📦 Request body:', { env: envVars });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ env: envVars }),
    });

    console.log('📥 Test response status:', response.status);
    const text = await response.text();
    console.log('📦 Raw response text:', text);

    if (!response.ok) {
      throw new Error(`Failed to start test: ${text}`);
    }

    const result: TestResult = JSON.parse(text);
    console.log('✅ Test result received:', result);
    setTestResult(result);

    // Fixed logic - check if instance has usageUrl
    if (!result.instance?.usageUrl) {
      console.log('⏳ Test instance is being created...');
      alert('Test instance is being created, try refreshing.');
      
      // Optional: Implement polling here
      if (result.instance?.id) {
        console.log('🔄 Starting to poll instance status...');
        try {
          const updatedInstance = await pollInstanceStatus(result.instance.id);
          setTestResult(prev => prev ? {
            ...prev,
            instance: updatedInstance
          } : null);
          
          if (updatedInstance.usageUrl) {
            console.log('🔗 Test instance ready at:', updatedInstance.usageUrl);
            setActiveTab('test-data');
          }
        } catch (pollError) {
          console.error('❌ Polling failed:', pollError);
        }
      }
    } else {
      console.log('🔗 Test instance ready at:', result.instance.usageUrl);
      setActiveTab('test-data');
    }
  } catch (error) {
    console.error('❌ Error starting test:', error);
    alert(error instanceof Error ? error.message : 'Failed to start test (see console)');
  } finally {
    setTesting(false);
  }
};

const sendTestData = async () => {
  console.log('Sending test data:', testInput);
  if (!testResult?.instance?.usageUrl) {
    alert('No test instance available or instance is not ready yet');
    return;
  }

  setSendingTest(true);
  try {
    const response = await fetch(`${testResult.instance.usageUrl}/run`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testInput),
      mode: 'cors',
    });

    console.log('Send test data response status:', response.status);

    if (!response.ok) {
      if (response.status === 0) {
        throw new Error('CORS error: Unable to connect to the tool instance. The tool may need CORS headers configured.');
      }
      const errorText = await response.text();
      throw new Error(`Test failed with status ${response.status}: ${errorText}`);
    }

    const output = await response.json();
    console.log('Test output received:', output);
    setTestOutput(output);
    setActiveTab('results');

  } catch (error) {
    console.error('Error sending test data:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      alert('CORS Error: Unable to connect to the tool instance. This usually means the tool container needs CORS headers configured. Check the browser console for details.');
    } else {
      alert(error instanceof Error ? error.message : 'Failed to send test data');
    }
  } finally {
    setSendingTest(false);
  }
};

  const deployTests = async () => {
  console.log('⚙️ Deploying tests...');
  if (!tool || !userWallet) return;
  setTesting(true);

  try {
    const token = getAuthToken();
    const url = `${API_BASE}/tools/${toolId}/deploy`;
    const tests = [
      { name: 'Basic functionality test', input: testInput, expectedOutput: { schema: tool.outputShape || { result: 'any' } } }
    ];

    console.log('📡 Sending deploy request to:', url);
    console.log('📦 Request body:', { env: envVars, tests });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ env: envVars, tests }),
    });

    console.log('📥 Deploy response status:', response.status);
    const text = await response.text();
    console.log('📦 Raw response text:', text);

    if (!response.ok) throw new Error(`Failed to deploy: ${text}`);

    const result: TestResult = JSON.parse(text);
    console.log('✅ Deploy result:', result);
    setTestResult(result);

    if (result.success) {
      alert('✅ Deployment tests passed!');
      router.push(`/tools/${toolId}`);
    } else {
      alert(`❌ Deployment tests failed: ${result.reason || 'Unknown error'}`);
      setActiveTab('results');
    }
  } catch (error) {
    console.error('❌ Error during deployment:', error);
    alert(error instanceof Error ? error.message : 'Failed to run deployment tests (see console)');
  } finally {
    setTesting(false);
  }
};

  if (walletLoading) {
    return <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center text-white text-xl">Checking wallet connection...</div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center text-white text-xl">Loading tool details...</div>;
  }

  if (!tool) {
    return <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center text-white text-xl">Tool not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-20 px-8 py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/tools/${toolId}`}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Tool Details
          </Link>
          
          <div className="flex items-center gap-4">
            {userWallet && (
              <div className="text-sm text-gray-400">
                Wallet: <span className="text-cyan-400 font-mono">{userWallet.slice(0, 8)}...{userWallet.slice(-6)}</span>
              </div>
            )}
            <StatusBadge status={tool.status} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Test <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{tool.name}</span>
          </h1>
          <p className="text-lg text-cyan-400 max-w-2xl mx-auto">
            Configure environment variables and test your tool before deployment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex space-x-1 mb-6">
                {['configuration', 'test-data', 'results'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>

              {activeTab === 'configuration' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-4">Environment Variables</h3>
                    <p className="text-gray-400 mb-6">
                      Configure the environment variables required by your tool. These will be encrypted and stored securely.
                    </p>

                    {tool.requiredEnv && tool.requiredEnv.length > 0 ? (
                      <div className="space-y-4">
                        {tool.requiredEnv.map((envVar) => (
                          <div key={envVar} className="bg-white/5 rounded-xl p-4">
                            <label className="block text-white font-semibold mb-2">
                              {envVar}
                            </label>
                            <input
                              type="text"
                              value={envVars[envVar] || ''}
                              onChange={(e) => handleEnvVarChange(envVar, e.target.value)}
                              placeholder={`Enter value for ${envVar}`}
                              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                            />
                            <p className="text-gray-400 text-sm mt-2">
                              This value will be encrypted and stored securely
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No environment variables required for this tool.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-white/10">
                    <button
                      onClick={startTest}
                      disabled={testing}
                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Starting Test...
                        </div>
                      ) : (
                        'Start Test Deployment'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'test-data' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-4">Test Input Data</h3>
                    <p className="text-gray-400 mb-6">
                      Provide test input data according to the tool's input specification.
                    </p>

                    <div className="space-y-4">
                      {Object.keys(testInput).map((key) => (
                        <div key={key} className="bg-white/5 rounded-xl p-4">
                          <label className="block text-white font-semibold mb-2">
                            {key}
                          </label>
                          {typeof testInput[key] === 'string' ? (
                            <textarea
                              value={testInput[key] as string}
                              onChange={(e) => handleTestInputChange(key, e.target.value)}
                              placeholder={`Enter ${key}`}
                              rows={4}
                              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                            />
                          ) : typeof testInput[key] === 'number' ? (
                            <input
                              type="number"
                              value={testInput[key] as number}
                              onChange={(e) => handleTestInputChange(key, parseFloat(e.target.value))}
                              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                            />
                          ) : typeof testInput[key] === 'boolean' ? (
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={testInput[key] as boolean}
                                onChange={(e) => handleTestInputChange(key, e.target.checked)}
                                className="w-5 h-5 rounded bg-white/10 border border-white/20 focus:ring-2 focus:ring-cyan-400"
                              />
                              <span className="text-white">{(testInput[key] as boolean) ? 'True' : 'False'}</span>
                            </div>
                          ) : (
                            <textarea
                              value={JSON.stringify(testInput[key], null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  handleTestInputChange(key, parsed);
                                } catch {
                                  handleTestInputChange(key, e.target.value);
                                }
                              }}
                              placeholder={`Enter ${key} as JSON`}
                              rows={4}
                              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none font-mono text-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-white/10">
                    <button
                      onClick={sendTestData}
                      disabled={sendingTest || !testResult?.instance?.usageUrl}
                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold hover:from-green-400 hover:to-cyan-400 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingTest ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Test...
                        </div>
                      ) : (
                        'Send Test Data'
                      )}
                    </button>
                    
                    <button
                      onClick={deployTests}
                      disabled={testing || !testResult?.instance?.usageUrl}
                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testing ? 'Running Tests...' : 'Run Full Deployment Tests'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6">
                  <h3 className="text-white font-bold text-xl mb-4">Test Results</h3>
                  
                  {testResult && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border ${
                        testResult.instance?.usageUrl || testResult.success
                          ? 'bg-green-500/20 border-green-400/30 text-green-400' 
                          : 'bg-red-500/20 border-red-400/30 text-red-400'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            testResult.instance?.usageUrl || testResult.success ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className="font-semibold">
                            {testResult.instance?.usageUrl || testResult.success ? 'Test Completed Successfully' : 'Test Failed'}
                          </span>
                        </div>
                        {testResult.reason && (
                          <p className="mt-2 text-sm">{testResult.reason}</p>
                        )}
                        {testResult.pending && (
                          <p className="mt-2 text-sm text-yellow-400">Test instance is being created...</p>
                        )}
                      </div>

                      {testResult.instance && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-white font-semibold mb-3">Test Instance</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Instance ID:</span>
                              <span className="text-white font-mono">{testResult.instance.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status:</span>
                              <StatusBadge status={testResult.instance.status} />
                            </div>
                            {testResult.instance.usageUrl && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">URL:</span>
                                <span className="text-cyan-400 font-mono text-xs">{testResult.instance.usageUrl}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {testOutput && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-white font-semibold mb-3">Test Output</h4>
                          <pre className="text-sm text-gray-300 bg-black/20 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(testOutput, null, 2)}
                          </pre>
                        </div>
                      )}

                      {testResult.testReport && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-white font-semibold mb-3">Deployment Test Report</h4>
                          <pre className="text-sm text-gray-300 bg-black/20 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(testResult.testReport, null, 2)}
                          </pre>
                        </div>
                      )}

                      {testResult.details && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-white font-semibold mb-3">Test Details</h4>
                          <pre className="text-sm text-gray-300 bg-black/20 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(testResult.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {!testResult && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No test results yet. Run a test to see results here.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Tool Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Name</span>
                    <div className="text-white font-semibold">{tool.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Input Shape</span>
                    <pre className="text-white text-xs mt-1 bg-black/20 p-2 rounded-lg overflow-auto max-h-32">
                      {typeof tool.inputShape === 'string' ? tool.inputShape : JSON.stringify(tool.inputShape, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Output Shape</span>
                    <pre className="text-white text-xs mt-1 bg-black/20 p-2 rounded-lg overflow-auto max-h-32">
                      {typeof tool.outputShape === 'string' ? tool.outputShape : JSON.stringify(tool.outputShape, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Testing Steps</h3>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${activeTab === 'configuration' ? 'text-cyan-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      activeTab === 'configuration' ? 'bg-cyan-500/20 border-cyan-400' : 'border-gray-600'
                    }`}>
                      1
                    </div>
                    <span>Configure Environment</span>
                  </div>
                  <div className={`flex items-center gap-3 ${activeTab === 'test-data' ? 'text-cyan-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      activeTab === 'test-data' ? 'bg-cyan-500/20 border-cyan-400' : 'border-gray-600'
                    }`}>
                      2
                    </div>
                    <span>Test with Data</span>
                  </div>
                  <div className={`flex items-center gap-3 ${activeTab === 'results' ? 'text-cyan-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      activeTab === 'results' ? 'bg-cyan-500/20 border-cyan-400' : 'border-gray-600'
                    }`}>
                      3
                    </div>
                    <span>View Results</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Having issues with testing? Check the tool documentation or contact support.
                </p>
                <button className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20">
                  Get Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  