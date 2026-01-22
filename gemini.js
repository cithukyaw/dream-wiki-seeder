import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { getPrompt, trimOutput } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const fileName = '1000009140';

async function main() {
  const base64ImageData = fs.readFileSync(`data/${fileName}.jpg`, { encoding: "base64" });

  console.log("Sending request to Gemini API...");

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64ImageData,
        },
      },
      { text: getPrompt() }
    ],
  });

  const outputText = response.text ?? '';
  const cleanedOutput = trimOutput(outputText);
  fs.writeFileSync(`output/${fileName}.json`, cleanedOutput);

  console.log(`Output successfully saved to output/${fileName}.json.`);
}

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text);
// }

main();
