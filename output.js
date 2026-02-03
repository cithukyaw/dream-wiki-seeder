import fs from 'fs';
import path from 'path';

// Function to recursively read all JSON files in a directory
function readJsonFiles(dirPath) {
  const jsonData = {};

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && path.extname(file) === '.json') {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);

          // Merge data - combine arrays for same keys
          for (const [key, value] of Object.entries(data)) {
            if (jsonData[key]) {
              // If key exists, merge arrays
              if (Array.isArray(jsonData[key]) && Array.isArray(value)) {
                jsonData[key] = [...jsonData[key], ...value];
              } else {
                // Handle non-array values by converting to array
                const existingArray = Array.isArray(jsonData[key]) ? jsonData[key] : [jsonData[key]];
                const newArray = Array.isArray(value) ? value : [value];
                jsonData[key] = [...existingArray, ...newArray];
              }
            } else {
              jsonData[key] = value;
            }
          }
        } catch (error) {
          console.error(`Error reading JSON file ${filePath}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return jsonData;
}

// Main function to process all subfolders
function mergeJsonFiles() {
  const outputDir = './output';
  const dbDir = './db';

  // Create db directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✓ Created /db directory');
  }

  try {
    const subfolders = fs.readdirSync(outputDir);
    let totalProcessed = 0;

    for (const subfolder of subfolders) {
      const subfolderPath = path.join(outputDir, subfolder);

      try {
        const stat = fs.statSync(subfolderPath);

        if (stat.isDirectory()) {
          console.log(`\nProcessing subfolder: ${subfolder}`);

          // Count JSON files in subfolder
          const files = fs.readdirSync(subfolderPath);
          const jsonFiles = files.filter(file => path.extname(file) === '.json');
          console.log(`  Found ${jsonFiles.length} JSON files`);

          // Read and merge all JSON files in this subfolder
          const mergedData = readJsonFiles(subfolderPath);

          // Save merged data to db directory
          const outputFileName = `${subfolder}.json`;
          const outputFilePath = path.join(dbDir, outputFileName);

          fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2), 'utf8');

          const entryCount = Object.keys(mergedData).length;
          console.log(`  ✓ Created ${outputFileName} with ${entryCount} unique entries`);
          totalProcessed++;
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${subfolder}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully processed ${totalProcessed} subfolders`);
    console.log('✅ All JSON files have been merged and saved to /db directory');
  } catch (error) {
    console.error('Error processing folders:', error.message);
  }
}

// Run the merge process
mergeJsonFiles();