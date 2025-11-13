
import { GoogleGenAI, Type, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const suggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: 'A compelling and creative continuation of the story.'
            },
            description: 'An array of 3 to 5 distinct story continuation suggestions.'
        }
    },
    required: ['suggestions']
};

export async function getStoryContinuations(storySoFar: string[], userGuidance: string): Promise<string[]> {
    const fullStory = storySoFar.join('\n\n');

    const prompt = `
You are a creative council of 100 master novelists, each with a unique style. Your goal is to collaboratively help a user write a novel by providing multiple, diverse paths forward.

**Task:**
Based on the story so far and the user's latest input, provide 3 distinctly different and compelling options for the next paragraph. The user's input might be a direct instruction (e.g., "Introduce a dragon") or it may be the most recent paragraph of the story, indicating a request to continue from there. These options should explore different plot directions, character moods, or narrative styles. Avoid cliches and be creative.

**Language Requirement:**
Analyze the language of the User's Input. ALL your suggestions MUST be in the same language as that input.

**Story So Far:**
${fullStory.length > 0 ? `\`\`\`\n${fullStory}\n\`\`\`` : "The story has not yet begun."}

**User's Input:**
"${userGuidance}"

**Output Format:**
You MUST respond with a JSON object that strictly follows the provided schema. Do not include any other text, explanations, or markdown formatting. The suggestions should be creative and well-written paragraphs.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionsSchema,
                temperature: 0.9,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson && Array.isArray(parsedJson.suggestions)) {
            return parsedJson.suggestions;
        }

        console.error("Parsed JSON does not match expected structure:", parsedJson);
        return [];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get suggestions from AI.");
    }
}

export async function generateImageForParagraph(paragraph: string): Promise<string> {
    const prompt = `Generate a cinematic, atmospheric, and inspiring illustration for the following story segment.
Style: digital painting, epic fantasy, moody lighting, high detail.
Paragraph: "${paragraph}"
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }

        throw new Error("No image data found in the response.");

    } catch (error) {
        console.error("Error calling Gemini Image API:", error);
        throw new Error("Failed to generate image from AI.");
    }
}
