import Docker from "dockerode";
import axios from "axios";

const docker = new Docker();

export async function pullImage(image) {
  return new Promise((resolve, reject) => {
    docker.pull(image, (err, stream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

export async function waitForUrl(url, timeoutMs = 60000, intervalMs = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      console.log("looping...");
      await axios.get(url, { timeout: 10000 });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
  return false;
}