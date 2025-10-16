import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { translate } from '@vitalets/google-translate-api';

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = 5000;
const DEFAULT_LANG = process.env.DEFAULT_TARGET_LANG || "en";

app.post("/run", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing 'text' field" });

    const result = await translate(text, { to: DEFAULT_LANG });
    console.log(result.text)
    res.json({ text: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Text Translator running on port ${PORT}`);
});
