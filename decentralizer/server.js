import express from "express";
import dotenv from "dotenv";
import { decryptEnv } from "./utils/decrypt.js";
import { pullImage, waitForUrl } from "./utils/docker.js";
import Docker from "dockerode";
import axios from "axios";

const docker = new Docker();
dotenv.config();
const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  try {
    const { instanceId, dockerImageUrl, envCipher } = req.body;
    const envVars = decryptEnv(envCipher);

    await pullImage(dockerImageUrl);

    const hostPort = 30000 + Math.floor(Math.random() * 1000);

    const container = await docker.createContainer({
      Image: dockerImageUrl,
      Env: Object.entries(envVars).map(([k, v]) => `${k}=${v}`),
      ExposedPorts: { "80/tcp": {} },
      HostConfig: {
        PortBindings: { "80/tcp": [{ HostPort: hostPort.toString() }] },
        AutoRemove: true,
      },
      name: `tool_${instanceId}`,
    });

    await container.start();
    console.log(`Instance ${instanceId} running at localhost:${hostPort}`);

    setTimeout(async () => {
      try {
        await container.stop();
        console.log(`Instance ${instanceId} stopped after 10 minutes`);
      } catch (e) {}
    }, 10 * 60 * 1000);

    res.json({
      usageUrl: `http://localhost:${hostPort}`,
      port: hostPort,
    });
  } catch (e) {
    console.error("Error starting container:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/run-and-test", async (req, res) => {
  try {
    console.log("we got in!");
    const { instanceId, dockerImageUrl, envCipher, tests = [] } = req.body;
    if (!instanceId || !dockerImageUrl || !envCipher)
      return res.status(400).json({ error: "instanceId, dockerImageUrl, envCipher required" });

    const envVars = decryptEnv(envCipher);
    console.log("we got them: ", envVars);
    await pullImage(dockerImageUrl);
    console.log("pulled!");

    const hostPort = 30000 + Math.floor(Math.random() * 10000);

    const container = await docker.createContainer({
      Image: dockerImageUrl,
      Env: Object.entries(envVars).map(([k, v]) => `${k}=${v}`),
      ExposedPorts: { "80/tcp": {} },
      HostConfig: { PortBindings: { "80/tcp": [{ HostPort: hostPort.toString() }] }, AutoRemove: true },
      name: `tool_${instanceId}`,
    });

    console.log("container created.")

    await container.start();
    console.log("container started.");
    const baseUrl = `http://localhost:${hostPort}`;

    console.log("ready!");

    const results = [];
    let totalMs = 0;
    let totalOutBytes = 0;
    let totalMemMB = 0;

    let inputShape = req.inputShape;
    let outputShape = req.outputShape;

  for (const t of tests) {
    const shape = typeof inputShape === "string" ? JSON.parse(inputShape) : inputShape;
    const expectedShape = typeof outputShape === "string" ? JSON.parse(outputShape) : outputShape;

    console.log(t.input);

    const input = t.input;

    const expected = t.expected;
    let out, duration, memUsage;

    console.log(input);

    const start = Date.now();
    try {
      const preStats = await container.stats({ stream: false });
      const r = await axios.post(`${baseUrl}/run`, input, { timeout: 20000 });
      const postStats = await container.stats({ stream: false });

      duration = Date.now() - start;
      out = r.data;

      const memNow = postStats.memory_stats?.usage || preStats.memory_stats?.usage || 0;
      memUsage = memNow / 1024 / 1024;
    } catch (e) {
      results.push({ input, error: e.message, ok: false });
      continue;
    }

    const outStr = JSON.stringify(out);
    const outBytes = Buffer.byteLength(outStr, "utf8");
    totalMs += duration;
    totalOutBytes += outBytes;
    totalMemMB += memUsage;

    let ok = true;
    if (expected) {
      for (const [key, expectedVal] of Object.entries(expected)) {
        if (out[key] === undefined) {
          ok = false;
          break;
        }
        if (typeof expectedVal === 'string' && typeof out[key] !== typeof expectedVal) {
          ok = false;
          break;
        }
        if (expectedVal !== null && expectedVal !== undefined && out[key] != expectedVal) {
          ok = false;
          break;
        }
      }
    } else if (expectedShape) {
      for (const key of Object.keys(expectedShape)) {
        if (!(key in out)) {
          ok = false;
          break;
        }
      }
    }

    results.push({ input, output: out, ok, timeMs: duration, memMB: memUsage });
  }

    const testCount = Math.max(1, results.length);
    const avgMs = totalMs / testCount;
    const avgMemMB = totalMemMB / testCount;
    const avgOutBytes = totalOutBytes / testCount;

    const timeVals = results.map(r => r.timeMs || avgMs);
    const mean = avgMs;
    const variance =
      timeVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / timeVals.length;
    const stability = 1 - Math.min(variance / mean ** 2, 1);
    const priceMode = stability > 0.8 ? "FIXED" : "DYNAMIC";

    const cpuPowerW = 25;
    const memPowerW = 0.3 * avgMemMB;
    const energyJ = (avgMs / 1000) * (cpuPowerW + memPowerW);
    const energyBaseline = Math.round(energyJ * 1000) / 1000;

    const USD_PER_JOULE = 0.000000005;
    const USD_PER_MB = 0.00001;

    const baseCost = energyJ * USD_PER_JOULE + avgMemMB * USD_PER_MB;
    const fixedPrice = Number((baseCost * 1.5).toFixed(6));
    const dynamicInputCoeff = Number((baseCost * 0.1).toFixed(6));
    const dynamicOutputCoeff = Number((avgOutBytes * 0.0000002).toFixed(6));

    const passedAll = results.every(r => r.ok);

    try {
      await container.stop();
    } catch {}

    return res.json({
      passed: passedAll,
      metrics: { avgMs, avgMemMB, avgOutBytes, stability, results },
      pricing: {
        priceMode,
        fixedPrice,
        dynamicInputCoeff,
        dynamicOutputCoeff,
      },
      energyBaseline,
    });
  } catch (e) {
    console.error("run-and-test error:", e);
    res.status(500).json({ error: e.message });
  }
});

const workflowStore = new Map();

function topoSortNodes(nodes = [], edges = []) {
  const indeg = new Map(nodes.map(n => [n.id, 0]));
  const ad = new Map(nodes.map(n => [n.id, []]));
  edges.forEach(e => {
    ad.get(e.from).push(e.to);
    indeg.set(e.to, (indeg.get(e.to) || 0) + 1);
  });
  const q = [];
  for (const [id, d] of indeg.entries()) if (d === 0) q.push(id);
  const order = [];
  while (q.length) {
    const n = q.shift();
    order.push(n);
    for (const nb of ad.get(n)) {
      indeg.set(nb, indeg.get(nb) - 1);
      if (indeg.get(nb) === 0) q.push(nb);
    }
  }
  return order;
}

app.post("/run-workflow", async (req, res) => {
  try {
    const { instanceId, graphJson, envCipher } = req.body;
    if (!instanceId || !graphJson) return res.status(400).json({ error: "instanceId and graphJson required" });

    const envVars = envCipher ? decryptEnv(envCipher) : {};
    const containers = {};

    for (const node of graphJson.nodes) {
      await pullImage(node.dockerImageUrl);

      const hostPort = 30000 + Math.floor(Math.random() * 10000);
      const container = await docker.createContainer({
        Image: node.dockerImageUrl,
        Env: Object.entries(envVars).map(([k, v]) => `${k}=${v}`),
        ExposedPorts: { "80/tcp": {} },
        HostConfig: { PortBindings: { "80/tcp": [{ HostPort: hostPort.toString() }] }, AutoRemove: true },
        name: `${instanceId}_${node.id}`,
      });

      await container.start();
      containers[node.id] = { container, usageUrl: `http://localhost:${hostPort}` };
      console.log(`Node ${node.name} running at ${containers[node.id].usageUrl}`);
    }

    workflowStore.set(instanceId, { graphJson, containers });
    res.json({ usageUrl: `${req.protocol}://${req.get("host")}/workflow/${instanceId}/run` });
  } catch (e) {
    console.error("run-workflow error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/workflow/:instanceId/run", async (req, res) => {
  const { instanceId } = req.params;
  const { input } = req.body;
  const wf = workflowStore.get(instanceId);
  if (!wf) return res.status(404).json({ error: "Workflow instance not found" });

  const { graphJson, containers } = wf;

  let currentOutputs = {};
  let executed = new Set();

  const getNodeOutput = async (nodeId, inputData) => {
    const node = graphJson.nodes.find(n => n.id === nodeId);
    const c = containers[nodeId];
    const resp = await axios.post(`${c.usageUrl}/run`, inputData, { timeout: 20000 });
    currentOutputs[nodeId] = resp.data;
    executed.add(nodeId);
    return resp.data;
  };

  for (const node of graphJson.nodes) {
    if (!graphJson.edges.some(e => e.to === node.id)) {
      await getNodeOutput(node.id, input);
    }
  }

  for (const edge of graphJson.edges) {
    const fromOutput = currentOutputs[edge.from];
    if (!fromOutput) continue;

    const condition = edge.condition ? eval(edge.condition) : true;
    if (!condition) continue;

    const mapping = {};
    for (const [k, v] of Object.entries(edge.mapping)) {
      mapping[k] = v.replace(/\{\{(.*?)\}\}/g, (_, key) => fromOutput[key.trim()] ?? input[key.trim()]);
    }

    await getNodeOutput(edge.to, mapping);
  }

  const lastNode = graphJson.nodes.find(n => !graphJson.edges.some(e => e.from === n.id));
  const finalOut = currentOutputs[lastNode?.id] ?? currentOutputs;
  res.json({ success: true, output: finalOut });
});

app.post("/run-workflow-and-test", async (req, res) => {
  try {
    const { instanceId, graphJson, tests = [] } = req.body;
    if (!instanceId || !graphJson) return res.status(400).json({ error: "instanceId, graphJson required" });

    const results = [];
    let totalMs = 0;
    let totalOutBytes = 0;
    let totalMemMB = 0;

    for (const t of tests) {
      const start = Date.now();
      try {
        const runResp = await axios.post(`http://localhost:${process.env.PORT || 3111}/workflow/${instanceId}/run`, { input: t.input });
        const out = runResp.data.result ?? runResp.data;
        const duration = Date.now() - start;
        const outStr = JSON.stringify(out);
        const outBytes = Buffer.byteLength(outStr, "utf8");
        totalMs += duration;
        totalOutBytes += outBytes;
        results.push({ input: t.input, output: out, ok: JSON.stringify(out) === JSON.stringify(t.expected), timeMs: duration });
      } catch (e) {
        results.push({ input: t.input, error: e.message, ok: false });
      }
    }

    const testCount = Math.max(1, results.length);
    const avgMs = totalMs / testCount;
    const avgOutBytes = totalOutBytes / testCount;
    const stability = 1; // simplified
    const priceMode = "FIXED";
    const energyBaseline = 0;

    const baseCost = avgMs * 0.000001;
    const fixedPrice = Number((baseCost * 1.5).toFixed(6));
    const dynamicInputCoeff = 0;
    const dynamicOutputCoeff = Number((avgOutBytes * 0.0000002).toFixed(6));

    workflowStore.set(instanceId, { graphJson, createdAt: Date.now() });

    return res.json({
      passed: results.every(r => r.ok),
      metrics: { avgMs, avgOutBytes, results },
      pricing: { priceMode, fixedPrice, dynamicInputCoeff, dynamicOutputCoeff, estimatedCost: fixedPrice },
      energyBaseline,
    });
  } catch (e) {
    console.error("run-workflow-and-test error:", e);
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3111;
app.listen(port, () => console.log(`Runner listening on ${port}`));
