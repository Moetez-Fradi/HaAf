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

    for (const t of tests) {
      const input = {"text":t.input} ?? t;
      const expected = t.expected;
      let out, duration, memUsage;

      const start = Date.now();
      try {
        const preStats = await container.stats({ stream: false });
        const r = await axios.post(`${baseUrl}/run`, input, { timeout: 20000 });
        console.log(r);
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
      if (expected !== undefined) ok = JSON.stringify(out.closest_category) === JSON.stringify(expected.closest_category);

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

const port = process.env.PORT || 3111;
app.listen(port, () => console.log(`Runner listening on ${port}`));
