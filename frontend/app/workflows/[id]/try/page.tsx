'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

/* Lightweight types */
type Workflow = {
  id: string;
  name?: string;
  description?: string;
  graphJson?: any;
  usageUrl?: string | null; // workflow-level usage URL (preferred target)
  usage_url?: string | null; // tolerate snake_case too
};

type Tool = {
  id: string;
  name?: string;
  inputShape?: string | any;
  outputShape?: string | any;
  requiredEnv?: string[];
};

/* tolerant parser (same approach as you used earlier) */
function tryParseToolInputShape(raw: string | undefined | null): any | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {}

  try {
    let s = raw.trim();
    s = s.replace(/`/g, '"');
    s = s.replace(/([{,]\s*)([A-Za-z0-9_\-$]+)\s*:/g, '$1"$2":');
    s = s.replace(/:\s*'([^']*)'/g, ': "$1"');
    s = s.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(s);
  } catch (e) {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${raw});`);
      return fn();
    } catch (err) {
      console.warn('Could not parse tool inputShape:', err, raw);
      return null;
    }
  }
}

export default function WorkflowTryPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = (params as any).id as string;

  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  // derived input shape & input state
  const [inputShape, setInputShape] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [rawJson, setRawJson] = useState('{}');
  const [submitting, setSubmitting] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  useEffect(() => {
    if (!workflowId) return;

    const fetchWorkflowAndShape = async () => {
      setLoading(true);
      setError(null);

      // read token if available (for fetching workflow/tools)
      const tokenString = localStorage.getItem('access_token');
      let token = '';
      if (tokenString) {
        try {
          const parsed = JSON.parse(tokenString);
          token = parsed.state?.token ?? '';
        } catch (e) {
          console.warn('Failed to parse access_token', e);
        }
      }

      try {
        // fetch workflow
        const wres = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/workflows/${workflowId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const wf = (wres.data.workflow ?? wres.data) as Workflow;
        setWorkflow(wf);

        // determine first node and attempt to fetch its tool's input shape
        const sourceGraph = wf.graphJson ?? {};
        const firstNode = sourceGraph?.nodes?.[0];

        let toolInputShape: any = null;
        if (firstNode?.toolId) {
          try {
            const tres = await axios.get<Tool>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tools/${firstNode.toolId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            toolInputShape = tres.data.inputShape ?? tres.data.inputShape ?? null;
            if (typeof toolInputShape === 'string') {
              const parsed = tryParseToolInputShape(toolInputShape);
              if (parsed !== null) toolInputShape = parsed;
            }
          } catch (toolErr) {
            console.warn('Failed to fetch tool, falling back to node-level shape', toolErr);
          }
        }

        // fallback: try node-level shape
        if (!toolInputShape) {
          let shape =
            firstNode?.inputShape ??
            firstNode?.data?.inputShape ??
            firstNode?.input_shape ??
            null;
          if (typeof shape === 'string') {
            const parsed = tryParseToolInputShape(shape);
            if (parsed !== null) shape = parsed;
          }
          toolInputShape = shape;
        }

        setInputShape(toolInputShape);

        // initialize form state
        if (toolInputShape && typeof toolInputShape === 'object' && !Array.isArray(toolInputShape)) {
          const initial: Record<string, any> = {};
          Object.keys(toolInputShape).forEach(k => (initial[k] = ''));
          setFormValues(initial);
        } else if (toolInputShape && typeof toolInputShape === 'string') {
          setFormValues({ input: '' });
        } else {
          setRawJson('{}');
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowAndShape();
  }, [workflowId]);

  const handleChange = (key: string, val: any) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e?: any) => {
    e?.preventDefault?.();
    if (!workflow) return;

    // prefer workflow.usageUrl field (snake_case or camelCase)
    const usageUrl = (workflow.usageUrl ?? (workflow as any).usage_url) as string | null | undefined;
    if (!usageUrl) {
      alert('This workflow does not expose a usage URL (yet).');
      return;
    }

    // build payload: we send { input: <payload> } to mirror runner contract
    let payloadBody: any;
    if (inputShape && typeof inputShape === 'object' && !Array.isArray(inputShape)) {
      payloadBody = { ...formValues };
    } else if (inputShape && typeof inputShape === 'string') {
      payloadBody = formValues.input ?? '';
    } else {
      try {
        payloadBody = JSON.parse(rawJson);
      } catch (err) {
        alert('Invalid JSON in raw payload');
        return;
      }
    }

    const finalPayload = { input: payloadBody };

    setSubmitting(true);
    setResponseText(null);
    setResponseData(null);

    try {
      const resp = await axios.post(usageUrl, finalPayload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setResponseData(resp.data);
      setResponseText(JSON.stringify(resp.data, null, 2));
    } catch (err: any) {
      console.error('Call to usageUrl failed', err);
      const message = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
      setResponseText(`Request failed: ${err.response?.status || ''}\n${message}`);
      setResponseData(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!workflowId) return <div className="p-8">No workflow id provided</div>;
  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
  if (!workflow) return <div className="p-8">Workflow not found</div>;

  const usageUrl = (workflow.usageUrl ?? (workflow as any).usage_url) ?? null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold">{workflow.name ?? workflow.id}</h1>
          <br></br>
          <div className="text-sm text-gray-400">
            Workflow ID: <span className="font-mono">{workflow.id}</span>
          </div>
          {workflow.description && <div className="text-sm text-gray-400 mt-1">Desctiption: {workflow.description}</div>}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/workflows`)}
            className="px-3 py-2 border border-white/10 rounded text-sm"
          >
            Back to workflows
          </button>
          <button
            onClick={() => router.push(`/users/cmgu3nb5o0000uv3sfdkv3baq`)}
            className="px-3 py-2 bg-green-600 text-black rounded text-sm"
          >
            builder's account
          </button>
        </div>
      </div>

      {/* {usageUrl ? (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-800 text-green-200 rounded">
          Workflow usage URL available (will be used for requests): <span className="font-mono break-words">{usageUrl}</span>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-800 text-yellow-200 rounded">
          This workflow does not currently expose a usage URL — the runner may need provisioning or the workflow hasn't been deployed.
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* structured object inputs */}
        {inputShape && typeof inputShape === 'object' && !Array.isArray(inputShape) && (
          <div>
            <h3 className="font-semibold mb-2">Inputs</h3>
            <div className="space-y-3">
              {Object.keys(inputShape).map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="block text-sm text-gray-300 mb-1">{key}</label>
                  {key === 'text' ? (
                    <textarea
                      value={formValues[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full h-28 bg-[#071424] border border-white/6 rounded p-2 font-mono"
                      placeholder={typeof inputShape[key] === 'string' ? (inputShape[key] as string) : ''}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formValues[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full bg-[#071424] border border-white/6 rounded p-2"
                      placeholder={typeof inputShape[key] === 'string' ? (inputShape[key] as string) : ''}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* single textual input */}
        {inputShape && typeof inputShape === 'string' && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Value</label>
            <textarea
              value={formValues.input ?? ''}
              onChange={(e) => handleChange('input', e.target.value)}
              className="w-full h-40 bg-[#071424] border border-white/6 rounded p-2 font-mono"
            />
          </div>
        )}

        {/* raw JSON fallback */}
        {!inputShape && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Raw JSON payload</label>
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              className="w-full h-56 bg-[#071424] border border-white/6 rounded p-2 font-mono"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!usageUrl || submitting}
            className="px-4 py-2 bg-cyan-400 text-black rounded"
          >
            {submitting ? 'Sending…' : 'run workflow'}
          </button>

          <button
            type="button"
            onClick={() => {
              router.push(`/workflows/${workflow.id}`);
            }}
            className="px-4 py-2 border rounded border-white/10 text-white"
          >
            Back to workflow
          </button>
        </div>
      </form>

      {/* outputs */}
      {responseData && typeof responseData === 'object' && !Array.isArray(responseData) && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Outputs</h3>
          <div className="grid grid-cols-1 gap-3 max-w-2xl">
            {Object.keys(responseData).map((k) => (
              <div key={k} className="p-3 bg-[#071424] border border-white/6 rounded">
                <div className="text-xs text-gray-400 mb-1">{k}</div>
                <pre className="font-mono text-sm whitespace-pre-wrap">{JSON.stringify(responseData[k], null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* raw runner response */}
      {responseText && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Runner response</h3>
          <pre className="bg-[#071424] border border-white/6 rounded p-4 font-mono whitespace-pre-wrap">{responseText}</pre>
        </div>
      )}
    </div>
  );
}
