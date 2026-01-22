import * as fs from 'node:fs';
import * as path from 'node:path';

// Remove surrounding ```json and ``` fences if present
export const trimOutput = (outputText) => outputText
  .replace(/^\s*```(?:json)?\s*/i, '')
  .replace(/\s*```\s*$/i, '')
  .trim();

export const getGeminiVisionPayload = base64ImageFile => {
  return [
    {
      text: "Extract the Burmese texts from the image as json format where the key will be a word for category and it has a list of definitions. The category word should prepend to each definition without using any character except a space. Do not extract page number, header and footer."
    },
    {
      inlineData: {
        mime_type: "image/jpeg",
        data: base64ImageFile
      }
    }
  ]
}

export const getPrompt = () => {
  return "Extract the Burmese texts from the image as json format where the key means category and it has a group of definitions. The category word should prepend to each definition without using any character except a space. No need the static key 'category' and 'definitionso'. Do not extract page number, header and footer."
}

/**
 * Recursively find JPG files in a directory up to the specified limit.
 * Skips the `done` directory.
 */
export function findImageFiles(dir, limit, fileList = []) {
  if (fileList.length >= limit) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (fileList.length >= limit) {
      break;
    }

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'done') {
        findImageFiles(filePath, limit, fileList);
      }
    } else if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Move image file to data/done preserving directory structure.
 * Example: data/ထ/100.jpg -> data/done/ထ/100.jpg
 */
export function moveImageToDone(imagePath, dataRoot = 'data') {
  const relativePath = path.relative(dataRoot, imagePath);
  const donePath = path.join(dataRoot, 'done', relativePath);
  const doneDir = path.dirname(donePath);

  if (!fs.existsSync(doneDir)) {
    fs.mkdirSync(doneDir, { recursive: true });
  }

  fs.renameSync(imagePath, donePath);
  console.log(`Moved image to: ${path.join(`${dataRoot}/done`, relativePath)}`);
}
