import axios from 'axios';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { findImageFiles, moveImageToDone, getPrompt, trimOutput } from './utils.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Process a single image file via Google Generative Language REST API
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

  const base64ImageFile = fs.readFileSync(imagePath, { encoding: 'base64' });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  console.log(`Sending request to ${url} ...`);

  const data = {
    contents: [{
      parts: [
        { text: getPrompt() },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64ImageFile
          }
        }
      ]
    }]
  };

  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });

    const outputText = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleanedOutput = trimOutput(outputText);

    fs.writeFileSync(outputPath, cleanedOutput);
    console.log(`Output successfully saved to ${outputPath}`);

    // Move the image file to data/done after successful save
    moveImageToDone(imagePath);
  } catch (error) {
    console.error('Axios Error:', error.response ? error.response.data : error.message);
    console.log(error);
  }
}

async function main() {
  const numImages = parseInt(process.argv[2]) || 1;

  console.log('Finding images in data directory...');
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
