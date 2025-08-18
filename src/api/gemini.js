import { pcmToWav } from '../utils/pcmToWav';

// Use environment variable for the API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
const IMAGEN_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;
const TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;

export const api = {
    fetchActivities: async (ageSlab) => {
        const detailedPrompts = `
            Here are the screening guidelines by age group:
            ---Infants: 8–12 months---
            - Purpose: Check early babbling, response to sound, social engagement.
            - Tasks: Parent calls child’s name (response to sound), Show colorful rattle/toy (babbling sounds), Play animal sounds (vocal imitation), Parent waves “bye-bye” (gesture imitation).
            ---Toddlers: 1–2 years---
            - Purpose: Identify vocabulary emergence, imitation, gesture use.
            - Tasks: Show picture of common objects (ball, cup, dog) and ask “What is this?” (vocabulary), Request simple actions like “Clap hands” (imitation), Encourage imitation of simple words or sounds (imitation), Show fruit/animal flashcards (naming/pointing).
            ---Preschool: 3–5 years---
            - Purpose: Check sentence formation, comprehension, concept knowledge.
            - Tasks: Ask to name colors, fruits, or animals from flashcards (concept knowledge), Ask “What is happening in this picture?” (picture description), Request repeating short sentences (sentence formation), Ask to follow 2-step commands like “Touch your nose and clap” (comprehension).
            ---School-age: 6–10 years---
            - Purpose: Assess grammar, vocabulary, reading, attention.
            - Tasks: Show letters or words and ask to read aloud (reading), Ask simple reasoning questions like “Why do we wear shoes?” (reasoning), Show 4–5 objects, hide one, ask “Which is missing?” (attention/memory), Repeat longer sentences or rhymes (grammar).
            ---Pre-teens & Teens: 11–17 years---
            - Purpose: Check fluency, comprehension, working memory.
            - Tasks: Read a short paragraph and recall details (comprehension), Describe a sequence in a picture story (fluency), Solve quick verbal puzzles or riddles (working memory), Repeat complex sentences with conjunctions (fluency).
            ---Adults: 18+ years---
            - Purpose: Screen for speech clarity, cognitive-linguistic functions.
            - Tasks: Read a standard passage (speech clarity), Describe a personal experience (cognitive-linguistic), Name as many animals/fruits as possible in 30 seconds (verbal fluency), Repeat long sentences and tongue twisters (speech clarity).

            ---YOUR TASK---
            Based on the guidelines above, generate a diverse set of exactly 4 screening activities for the age group: "${ageSlab}". Ensure the tasks cover the different purposes for that age group.
            For each activity, provide a spoken prompt, a simple image query for an AI image generator, and a task_type.
            The task_type can be 'verbal', 'motor', 'imitation', 'comprehension', or 'reasoning'.
            Return a valid JSON array of objects. Example: [{"prompt_text": "Can you show me the lion?", "image_query": "A clear, simple photo of a lion on a white background", "task_type": "comprehension"}]
        `;
        const payload = { contents: [{ parts: [{ text: detailedPrompts }] }], generationConfig: { responseMimeType: "application/json" } };
        try {
            const res = await fetch(GEMINI_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const result = await res.json();
            return JSON.parse(result.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error("Error fetching activities:", error);
            return [{ prompt_text: "Let's clap our hands!", image_query: "hands clapping", task_type: "imitation" }];
        }
    },
    generateImage: async (prompt) => {
        if (!prompt) return "https://placehold.co/800x600/e0e7ff/4f46e5?text=No+Image";
        const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
        try {
            const res = await fetch(IMAGEN_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const result = await res.json();
            return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        } catch (error) {
            console.error("Error generating image:", error);
            return "https://placehold.co/800x600/e0e7ff/4f46e5?text=Image+Error";
        }
    },
    speakText: async (text) => {
        const payload = { contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"] }, model: "gemini-2.5-flash-preview-tts" };
        try {
            const res = await fetch(TTS_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const result = await res.json();
            const audioData = result.candidates[0].content.parts[0].inlineData.data;
            const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0)).buffer;
            const pcm16 = new Int16Array(pcmData);
            const wavBlob = pcmToWav(pcm16, 24000);
            const audioUrl = URL.createObjectURL(wavBlob);
            new Audio(audioUrl).play();
        } catch (error) {
            console.error("Error generating speech:", error);
        }
    },
    generateReport: async (age, activities) => {
        const prompt = `You are an AI assistant for the Gabify Screening App. Your role is to provide a supportive, non-clinical summary. A screening was just completed for a patient who is ${age} years old. The following activities were presented: ${activities.map(a => `"${a.prompt_text}"`).join(', ')}. Based on these activities, generate a brief, qualitative report in Markdown. The report should include "Potential Strengths", "Areas for Observation", and a clear disclaimer that this is not a medical diagnosis. Keep the tone friendly and helpful.`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        try {
            const res = await fetch(GEMINI_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const result = await res.json();
            return result.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error generating report:", error);
            return '<p class="text-red-500">Sorry, we were unable to generate the report.</p>';
        }
    }
};
