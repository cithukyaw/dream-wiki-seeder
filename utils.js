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
