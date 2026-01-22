import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import { findImageFiles, moveImageToDone, getPrompt, trimOutput } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Process a single image file
 */
async function processImage(imagePath) {
  const relativePath = path.relative('data', imagePath);
  const outputPath = path.join('output', relativePath.replace(/\.(jpg|jpeg)$/i, '.json'));
  const outputDir = path.dirname(outputPath);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Skip if output already exists
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping ${outputPath} - output already exists`);
    moveImageToDone(imagePath);
    return;
  }

  console.log(`Processing: ${relativePath}`);

  const base64ImageData = fs.readFileSync(imagePath, { encoding: "base64" });

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
  fs.writeFileSync(outputPath, cleanedOutput);

  console.log(`Output successfully saved to ${outputPath}`);

  // Move the image file to data/done after successful save
  moveImageToDone(imagePath);
}

async function main() {
  const numImages = parseInt(process.argv[2]) || 1;

  console.log(`Finding images in data directory...`);
  const imageFiles = findImageFiles('data', numImages);

  if (imageFiles.length === 0) {
    console.log('No image files found in data directory');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s). Processing...`);

  for (const imagePath of imageFiles) {
    try {
      await processImage(imagePath);
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error.message);
    }
  }

  console.log('Processing complete!');
}

main();
