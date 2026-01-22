import axios from 'axios';
import * as fs from 'node:fs';
import { getPrompt, trimOutput } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

const fileName = '1000008938';

async function main() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  console.log(`Sending request to ${url} ...`)

  try {
    const base64ImageFile = fs.readFileSync(`data/${fileName}.jpg`, { encoding: "base64" });

    const data = {
      contents: [{
        parts: [
          { text: getPrompt() },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64ImageFile
            }
          }
        ]
      }]
    };

    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });

    // The response structure differs slightly from the SDK
    const outputText = response.data.candidates[0].content.parts[0].text;
    const cleanedOutput = trimOutput(outputText);

    fs.writeFileSync(`output/${fileName}.json`, cleanedOutput);
    console.log(`Output successfully saved to output/${fileName}.json.`);
  } catch (error) {
    console.error("Axios Error:", error.response ? error.response.data : error.message);
    console.log(error);
  }
}

main();
