import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Read and encode the image
  // const imagePath = 'data/image.jpg';
  // const base64Image = fs.readFileSync(`data/ထ/1000008938.jpg`, { encoding: "base64" });

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
          content: 'What is the meaning of life?',
        },
      ],
      // messages: [
      //   {
      //     role: 'user',
      //     content: [
      //       {
      //         type: 'text',
      //         text: "What's in this image?",
      //       },
      //       {
      //         type: 'image_url',
      //         image_url: {
      //           url: base64Image,
      //         },
      //       },
      //     ],
      //   },
      // ],
    }),
  });

  const data = await response.json();
  console.log(data);
}

main().catch(console.error);
