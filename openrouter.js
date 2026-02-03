import * as fs from "node:fs";
import * as path from "node:path";
import { findImageFiles, moveImageToDone, getPrompt, trimOutput, writeLog } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

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

  const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

  console.log(`Sending request to OpenRouter API ...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPEN_ROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getPrompt(),
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error(` ✗ Error: Invalid response from API for ${relativePath}. Skipping output file creation.`);
    return;
  }

  const outputText = data.choices[0].message.content ?? '';
  const cleanedOutput = trimOutput(outputText);

  if (cleanedOutput === '') {
    console.error(` ✗ Error: Empty response from API for ${relativePath}. Skipping output file creation.`);
    return;
  }

  fs.writeFileSync(outputPath, cleanedOutput);
  const logMsg = `Output successfully saved to ${outputPath}`;
  console.log(`' ✓ ${logMsg}`);
  // Write log to file
  writeLog(`[openrouter]: ${logMsg}`);
  // Move the image file to data/done after successful save
  moveImageToDone(imagePath);
}

async function main() {
  const numImages = parseInt(process.argv[2]) || 1;

  console.log(`Finding images in data directory...`);
  const imageFiles = findImageFiles('data', numImages);

  if (imageFiles.length === 0) {
    console.log(' ✗ No image files found in data directory');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s). Processing...`);

  for (const imagePath of imageFiles) {
    try {
      await processImage(imagePath);
    } catch (error) {
      console.error(` ✗ Error processing ${imagePath}:`, error.message);
    }
  }

  console.log('Processing finished!');
}

main();
