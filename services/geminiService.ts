
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WorldEntity } from '../types';

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

const imagePromptSchema = {
    type: Type.OBJECT,
    properties: {
        prompt: {
            type: Type.STRING,
            description: 'A single, short, evocative sentence for generating an image.'
        }
    },
    required: ['prompt']
};

const descriptionSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: 'A rich, creative, and detailed description for the given entity, suitable for a fantasy novel.'
        }
    },
    required: ['description']
};


export async function getStoryContinuations(storySoFar: string[], userGuidance: string, worldEntities: WorldEntity[]): Promise<string[]> {
    const fullStory = storySoFar.join('\n\n');

    let worldBible = "No world information has been added yet.";
    if (worldEntities.length > 0) {
        worldBible = worldEntities.map(entity => 
            `### ${entity.type}: ${entity.name}\n${entity.description}`
        ).join('\n\n');
    }

    const prompt = `
You are a creative council of 100 master novelists, each with a unique style. Your goal is to collaboratively help a user write a novel by providing multiple, diverse paths forward.

**Task:**
Based on the story so far, the established world lore, and the user's latest input, provide 3 distinctly different and compelling options for the next paragraph. The user's input might be a direct instruction (e.g., "Introduce a dragon") or it may be the most recent paragraph of the story, indicating a request to continue from there. These options should explore different plot directions, character moods, or narrative styles. Crucially, you should try to incorporate elements from the "World Bible" where it feels natural, to maintain consistency.

**Language Requirement:**
Analyze the language of the User's Input. ALL your suggestions MUST be in the same language as that input.

**World Bible (Lore & Established Elements):**
${worldBible}

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

export async function generateImagePrompt(storySoFar: string[]): Promise<string> {
    const fullStory = storySoFar.join('\n\n');
    const systemInstruction = `You are a creative muse for a fantasy writer. Your task is to inspire them with a visual idea.
Based on the story so far, create a single, short, and evocative sentence. This sentence will be used as a prompt for an AI image generator to create a piece of atmospheric fantasy art.
The sentence should be descriptive, imaginative, and fit the tone of the story, but also introduce a new, intriguing element.

Example: "A lone figure stands before a glowing, ancient tree in a bioluminescent forest at twilight."

You MUST respond with a JSON object that strictly follows the provided schema. Do not include any other text or explanations.`;

    const prompt = `
**Story So Far:**
${fullStory.length > 0 ? `\`\`\`\n${fullStory}\n\`\`\`` : "The story has not yet begun. Create a prompt for a captivating story opening."}

Generate the image prompt sentence.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: imagePromptSchema,
                temperature: 1.0,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson && typeof parsedJson.prompt === 'string') {
            return parsedJson.prompt;
        }

        console.error("Parsed JSON for image prompt does not match expected structure:", parsedJson);
        throw new Error("Failed to parse image prompt from AI.");

    } catch (error) {
        console.error("Error calling Gemini API for image prompt:", error);
        throw new Error("Failed to generate image prompt from AI.");
    }
}

export async function generateEntityDescription(entityName: string, entityType: string): Promise<string> {
    const systemInstruction = `You are a world-building assistant for a fantasy novelist. Your task is to generate a rich, creative description for a character, location, or item. The description should be evocative and provide enough detail to be inspiring, but leave room for the author to expand upon. It should be written in a narrative, descriptive style suitable for a fantasy novel.`;
    
    const prompt = `Generate a description for the following entity:
- **Name:** ${entityName}
- **Type:** ${entityType}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: descriptionSchema,
                temperature: 0.8,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson && typeof parsedJson.description === 'string') {
            return parsedJson.description;
        }
        
        console.error("Parsed JSON for entity description does not match expected structure:", parsedJson);
        throw new Error("Failed to parse entity description from AI.");

    } catch (error) {
        console.error("Error calling Gemini API for entity description:", error);
        throw new Error("Failed to generate entity description from AI.");
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

export async function generateSpeechForParagraph(paragraph: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: paragraph }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            return base64Audio;
        }
        
        throw new Error("No audio data found in the response.");

    } catch (error) {
        console.error("Error calling Gemini TTS API:", error);
        throw new Error("Failed to generate speech from AI.");
    }
}

export async function askWorldOracle(question: string, storySoFar: string[], worldEntities: WorldEntity[]): Promise<string> {
    const fullStory = storySoFar.join('\n\n');

    let worldBible = "No world information has been added yet.";
    if (worldEntities.length > 0) {
        worldBible = worldEntities.map(entity =>
            `### ${entity.type}: ${entity.name}\n${entity.description}`
        ).join('\n\n');
    }

    const systemInstruction = `You are the World Oracle, an omniscient entity with deep knowledge of the story and world provided. Your purpose is to answer the user's questions about their creation, acting as a "god" of this world they are building.

Your knowledge is based ONLY on the "World Bible" (the lore and entities the user has defined) and the "Story So Far" (the narrative they have written).

**Rules:**
1.  **Base answers on provided context:** Answer the user's questions using information from the World Bible and Story So Far.
2.  **Creative Inference:** If the information isn't explicitly available, you are encouraged to creatively and consistently infer details. You should weave your answer into the existing lore as if it were always true. Do not explicitly state that you are inferring.
3.  **Maintain Persona:** Speak with an air of ancient wisdom and omniscience. Be evocative and literary in your responses.
4.  **Language Consistency:** Respond in the same language as the user's question.

**Example Answer Style:**
*User Question:* "What is Elara's greatest fear?"
*Oracle Response (if not specified):* "Elara, the Shadow Weaver, fears not the darkness she commands, but the blinding, unforgiving light that would reveal the sacrifices she made to gain her power. She fears the memory of the sun on her face, for it reminds her of a life she can never reclaim."
`;

    const prompt = `
**World Bible (Lore & Established Elements):**
${worldBible}

**Story So Far:**
${fullStory.length > 0 ? `\`\`\`\n${fullStory}\n\`\`\`` : "The story has not yet begun."}

**User's Question:**
"${question}"

Provide your answer now, Oracle.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.7,
            },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error calling Gemini API for Oracle:", error);
        throw new Error("The Oracle is silent. The cosmos may be out of alignment.");
    }
}
