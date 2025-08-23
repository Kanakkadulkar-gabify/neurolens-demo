'use client';

import React, { useState, useEffect, useRef } from 'react';

// Type definitions
interface FormData {
  // Step 1
  firstName: string;
  lastName: string;
  age: string;
  sex: string;
  languagesSpoken: string;
  phoneNumber: string;
  provisionalDiagnosis: string;
  briefHistory: string;
  // Step 2
  pregnancyHistory: string;
  pregnancyComplications: string;
  generalDevelopment: string;
  delayedDevelopment: string;
  birthCry: string;
  birthWeight: string;
  motorGeneral: string;
  motorNeck: string;
  motorSitting: string;
  motorWalking: string;
  babblingAge: string;
  firstWordAge: string;
  firstSentence: string;
  firstSentenceAge: string;
  // Step 3
  attentionSpan: string;
  eyeContact: string;
  imitationAbility: string;
  socialSkills: string;
  selfHelpSkills: string;
  grossMotorSkills: string;
  fineMotorSkills: string;
  receptiveLanguageAge: string;
  expressiveLanguageAge: string;
  receptiveVocabulary: string;
  expressiveVocabulary: string;
  familyType: string;
  socialSetting: string;
}

interface Activity {
  prompt_text: string;
  image_query: string;
  task_type: 'verbal' | 'motor' | 'imitation' | 'comprehension' | 'reasoning';
}

interface ScreeningData {
  blob: Blob | null;
  activities: Activity[];
}

interface GabifyScreeningProps {
  geminiApiKey: string;
  onComplete?: (data: ScreeningData & { age: number; formData?: FormData }) => void;
  className?: string;
  showTitle?: boolean;
  showEvaluationForm?: boolean;
}

interface EvaluationFormProps {
  onSuccess: (formData: FormData) => void;
}

interface UserOptionsProps {
  setScreen: (screen: string) => void;
  formData: FormData;
}

interface StartScreenProps {
  onStart: (age: number) => void;
}

interface ScreeningScreenProps {
  age: number;
  onComplete: (blob: Blob | null, activities: Activity[]) => void;
  apiKey: string;
}

interface CompletionScreenProps {
  blob: Blob | null;
  activities: Activity[];
  age: number;
  formData?: FormData;
  onRestart: () => void;
  apiKey: string;
}

interface ApiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          data: string;
        };
      }>;
    };
  }>;
}

interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
  }>;
}

// Utility functions
const getAgeSlab = (age: number): string => {
  if (age < 1) return "Infants: 8–12 months";
  if (age <= 2) return "Toddlers: 1–2 years";
  if (age <= 5) return "Preschool: 3–5 years";
  if (age <= 10) return "School-age: 6–10 years";
  if (age <= 17) return "Pre-teens & Teens: 11–17 years";
  return "Adults: 18+ years";
};

const pcmToWav = (pcmData: Int16Array, sampleRate: number): Blob => {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const dataSize = pcmData.length * 2;
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);
  const wavBytes = new Uint8Array(44 + dataSize);
  wavBytes.set(new Uint8Array(header), 0);
  wavBytes.set(new Uint8Array(pcmData.buffer), 44);
  return new Blob([wavBytes], { type: 'audio/wav' });
};

// API functions
const createApi = (apiKey: string) => {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  const IMAGEN_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  return {
    fetchActivities: async (ageSlab: string): Promise<Activity[]> => {
      const detailedPrompts = `
        Here are the screening guidelines by age group:
        ---Infants: 8–12 months---
        - Purpose: Check early babbling, response to sound, social engagement.
        - Tasks: Parent calls child's name (response to sound), Show colorful rattle/toy (babbling sounds), Play animal sounds (vocal imitation), Parent waves "bye-bye" (gesture imitation).
        ---Toddlers: 1–2 years---
        - Purpose: Identify vocabulary emergence, imitation, gesture use.
        - Tasks: Show picture of common objects (ball, cup, dog) and ask "What is this?" (vocabulary), Request simple actions like "Clap hands" (imitation), Encourage imitation of simple words or sounds (imitation), Show fruit/animal flashcards (naming/pointing).
        ---Preschool: 3–5 years---
        - Purpose: Check sentence formation, comprehension, concept knowledge.
        - Tasks: Ask to name colors, fruits, or animals from flashcards (concept knowledge), Ask "What is happening in this picture?" (picture description), Request repeating short sentences (sentence formation), Ask to follow 2-step commands like "Touch your nose and clap" (comprehension).
        ---School-age: 6–10 years---
        - Purpose: Assess grammar, vocabulary, reading, attention.
        - Tasks: Show letters or words and ask to read aloud (reading), Ask simple reasoning questions like "Why do we wear shoes?" (reasoning), Show 4–5 objects, hide one, ask "Which is missing?" (attention/memory), Repeat longer sentences or rhymes (grammar).
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
      const payload = { 
        contents: [{ parts: [{ text: detailedPrompts }] }], 
        generationConfig: { responseMimeType: "application/json" } 
      };
      
      try {
        const res = await fetch(GEMINI_API_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const result: ApiResponse = await res.json();
        return JSON.parse(result.candidates[0].content.parts[0].text || '[]');
      } catch (error) {
        console.error("Error fetching activities:", error);
        return [{ prompt_text: "Let's clap our hands!", image_query: "hands clapping", task_type: "imitation" as const }];
      }
    },

    generateImage: async (prompt: string): Promise<string> => {
      if (!prompt) return "https://placehold.co/800x600/e0e7ff/4f46e5?text=No+Image";
      const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
      
      try {
        const res = await fetch(IMAGEN_API_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const result: ImagenResponse = await res.json();
        return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
      } catch (error) {
        console.error("Error generating image:", error);
        return "https://placehold.co/800x600/e0e7ff/4f46e5?text=Image+Error";
      }
    },

    speakText: async (text: string): Promise<void> => {
      const payload = { 
        contents: [{ parts: [{ text }] }], 
        generationConfig: { responseModalities: ["AUDIO"] }, 
        model: "gemini-2.5-flash-preview-tts" 
      };
      
      try {
        const res = await fetch(TTS_API_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const result: ApiResponse = await res.json();
        const audioData = result.candidates[0].content.parts[0].inlineData?.data;
        if (audioData) {
          const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0)).buffer;
          const pcm16 = new Int16Array(pcmData);
          const wavBlob = pcmToWav(pcm16, 24000);
          const audioUrl = URL.createObjectURL(wavBlob);
          new Audio(audioUrl).play();
        }
      } catch (error) {
        console.error("Error generating speech:", error);
      }
    },

    generateReport: async (age: number, activities: Activity[]): Promise<string> => {
      const prompt = `You are an AI assistant for the Gabify Screening App. Your role is to provide a supportive, non-clinical summary. A screening was just completed for a patient who is ${age} years old. The following activities were presented: ${activities.map(a => `"${a.prompt_text}"`).join(', ')}. Based on these activities, generate a brief, qualitative report in Markdown. The report should include "Potential Strengths", "Areas for Observation", and a clear disclaimer that this is not a medical diagnosis. Keep the tone friendly and helpful.`;
      const payload = { contents: [{ parts: [{ text: prompt }] }] };
      
      try {
        const res = await fetch(GEMINI_API_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const result: ApiResponse = await res.json();
        return result.candidates[0].content.parts[0].text || '<p class="text-red-500">Sorry, we were unable to generate the report.</p>';
      } catch (error) {
        console.error("Error generating report:", error);
        return '<p class="text-red-500">Sorry, we were unable to generate the report.</p>';
      }
    }
  };
};

// Icon Components
const PlayCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10,8 16,12 10,16 10,8"/>
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const Spinner: React.FC = () => (
  <div className="border-4 border-slate-200 w-9 h-9 border-t-indigo-600 rounded-full animate-spin"></div>
);

// Evaluation Form Component
const EvaluationForm: React.FC<EvaluationFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    firstName: "",
    lastName: "",
    age: "",
    sex: "",
    languagesSpoken: "",
    phoneNumber: "",
    provisionalDiagnosis: "",
    briefHistory: "",
    // Step 2
    pregnancyHistory: "",
    pregnancyComplications: "",
    generalDevelopment: "",
    delayedDevelopment: "",
    birthCry: "",
    birthWeight: "",
    motorGeneral: "",
    motorNeck: "",
    motorSitting: "",
    motorWalking: "",
    babblingAge: "",
    firstWordAge: "",
    firstSentence: "",
    firstSentenceAge: "",
    // Step 3
    attentionSpan: "",
    eyeContact: "",
    imitationAbility: "",
    socialSkills: "",
    selfHelpSkills: "",
    grossMotorSkills: "",
    fineMotorSkills: "",
    receptiveLanguageAge: "",
    expressiveLanguageAge: "",
    receptiveVocabulary: "",
    expressiveVocabulary: "",
    familyType: "",
    socialSetting: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message: string, duration: number = 1000): void => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), duration);
  };

  const nextStep = (e: React.FormEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = (): void => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Submitted Data:", formData);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Form submitted! Check console for data.", 2000);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(formData);
        }
      }, 2000);
    }, 1000);
  };

  return (
    <div className="w-full h-full max-w-[100vw]">
      {toastMsg && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-out z-10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
      <div className="w-4xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-violet-100 shadow-lg rounded-2xl border border-blue-200">
        <div className="flex flex-col space-y-2 mb-4">
          <h1 className="text-2xl font-bold text-purple-600 text-center">
            Evaluation Form
          </h1>
          <p className="text-center text-sm text-blue-800">
            Please fill out the form below to the best of your ability.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Step Indicators */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center py-2 rounded-full mx-1 text-sm font-medium ${
                  step === s
                    ? "bg-purple-600 text-white"
                    : "bg-blue-100 text-purple-600"
                }`}
              >
                Step {s}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6 w-full bg-white py-8 px-5 rounded-lg">
              <label className="font-medium mb-2">
                Name <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="border rounded-lg p-2 w-full"
                />

                <div className="flex flex-col">
                  <label className="font-medium mb-1">
                    Age <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g., 2.3 (2 years 3 months)"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min="0"
                    className="border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg p-2 w-full"
                  />
                  <span className="text-xs text-gray-500">Years/ Months</span>
                </div>

                <div className="flex flex-col">
                  <label className="font-medium">
                    Sex <span className="text-red-600">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    {["Male", "Female", "Other"].map((option) => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sex"
                          value={option}
                          checked={formData.sex === option}
                          onChange={handleChange}
                          required
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-medium mb-1">Languages Spoken:</label>
                  <input
                    type="text"
                    name="languagesSpoken"
                    placeholder="Languages Spoken"
                    value={formData.languagesSpoken}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium mb-1">
                    Phone Number (WhatsApp Preferred){" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="(000) 000-0000"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="border rounded-lg p-2 w-full"
                  />
                  <span className="text-xs text-gray-500">
                    We will be sending the report on this number
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium">
                  Provisional Diagnosis (if any)
                </label>
                <textarea
                  name="provisionalDiagnosis"
                  rows={4}
                  placeholder=""
                  value={formData.provisionalDiagnosis}
                  onChange={handleChange}
                  className="border resize-none rounded-lg p-2 w-full"
                />
                <span className="text-xs text-gray-500">
                  Please mention the past findings if any
                </span>
              </div>

              <div>
                <label className="block font-medium">Brief History</label>
                <textarea
                  name="briefHistory"
                  rows={4}
                  placeholder=""
                  value={formData.briefHistory}
                  onChange={handleChange}
                  className="border resize-none rounded-lg p-2 w-full"
                />
                <span className="text-xs text-gray-500">
                  Please provide summary of child's history
                </span>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 w-full bg-white py-8 px-5 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-700">
                Pre-natal History
              </h2>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-medium">
                    Significant History During Pregnancy:
                  </label>
                  <div className="space-y-1 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="pregnancyHistory"
                        value="Normal"
                        checked={formData.pregnancyHistory === "Normal"}
                        onChange={handleChange}
                      />{" "}
                      Normal
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="pregnancyHistory"
                        value="Complicated"
                        checked={formData.pregnancyHistory === "Complicated"}
                        onChange={handleChange}
                      />{" "}
                      Complicated
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  name="pregnancyComplications"
                  placeholder="If complicated, please specify"
                  value={formData.pregnancyComplications}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>

              <h2 className="text-xl font-semibold text-blue-700">
                Developmental History
              </h2>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-medium">
                    General Development:
                  </label>
                  <div className="space-y-1 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="generalDevelopment"
                        value="Adequately Achieved"
                        checked={formData.generalDevelopment === "Adequately Achieved"}
                        onChange={handleChange}
                      />{" "}
                      Adequately Achieved
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="generalDevelopment"
                        value="Delayed"
                        checked={formData.generalDevelopment === "Delayed"}
                        onChange={handleChange}
                      />{" "}
                      Delayed
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  name="delayedDevelopment"
                  placeholder="If delayed, specify"
                  value={formData.delayedDevelopment}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>

              <h2 className="text-xl font-semibold text-blue-700">
                Post-natal History
              </h2>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-medium">Birth Cry:</label>
                  <div className="space-y-1 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="birthCry"
                        value="Present"
                        checked={formData.birthCry === "Present"}
                        onChange={handleChange}
                      />{" "}
                      Present
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="birthCry"
                        value="Absent"
                        checked={formData.birthCry === "Absent"}
                        onChange={handleChange}
                      />{" "}
                      Absent
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="birthCry"
                        value="Delayed"
                        checked={formData.birthCry === "Delayed"}
                        onChange={handleChange}
                      />{" "}
                      Delayed
                    </label>
                  </div>
                </div>
                <input
                  type="number"
                  name="birthWeight"
                  placeholder="Birth Weight (in KGs)"
                  value={formData.birthWeight}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>

              <h2 className="text-xl font-semibold text-blue-700">
                Motor Milestones
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">General:</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorGeneral"
                      value="Adequately Achieved"
                      checked={formData.motorGeneral === "Adequately Achieved"}
                      onChange={handleChange}
                    />{" "}
                    Adequately Achieved
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorGeneral"
                      value="Delayed"
                      checked={formData.motorGeneral === "Delayed"}
                      onChange={handleChange}
                    />{" "}
                    Delayed
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorGeneral"
                      value="Advanced"
                      checked={formData.motorGeneral === "Advanced"}
                      onChange={handleChange}
                    />{" "}
                    Advanced
                  </label>
                </div>
                <div>
                  <label className="block font-medium mb-1">Neck Control:</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorNeck"
                      value="Age appropriate"
                      checked={formData.motorNeck === "Age appropriate"}
                      onChange={handleChange}
                    />{" "}
                    Age appropriate
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorNeck"
                      value="Delayed"
                      checked={formData.motorNeck === "Delayed"}
                      onChange={handleChange}
                    />{" "}
                    Delayed
                  </label>
                </div>
                <div>
                  <label className="block font-medium mb-1">Sitting:</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorSitting"
                      value="Age appropriate"
                      checked={formData.motorSitting === "Age appropriate"}
                      onChange={handleChange}
                    />{" "}
                    Age appropriate
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorSitting"
                      value="Delayed"
                      checked={formData.motorSitting === "Delayed"}
                      onChange={handleChange}
                    />{" "}
                    Delayed
                  </label>
                </div>
                <div>
                  <label className="block font-medium mb-1">Walking:</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorWalking"
                      value="Age appropriate"
                      checked={formData.motorWalking === "Age appropriate"}
                      onChange={handleChange}
                    />{" "}
                    Age appropriate
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="motorWalking"
                      value="Delayed"
                      checked={formData.motorWalking === "Delayed"}
                      onChange={handleChange}
                    />{" "}
                    Delayed
                  </label>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-blue-700">
                Speech Milestones
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="babblingAge"
                  placeholder="Babbling (Age)"
                  value={formData.babblingAge}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="number"
                  name="firstWordAge"
                  placeholder="First Word (Age)"
                  value={formData.firstWordAge}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <div>
                  <label className="block font-medium mb-1">
                    First Sentence (Status):
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="firstSentence"
                      value="Achieved"
                      checked={formData.firstSentence === "Achieved"}
                      onChange={handleChange}
                    />{" "}
                    Achieved
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="firstSentence"
                      value="Not yet achieved"
                      checked={formData.firstSentence === "Not yet achieved"}
                      onChange={handleChange}
                    />{" "}
                    Not yet achieved
                  </label>
                </div>
                {formData.firstSentence === "Achieved" && (
                  <input
                    type="number"
                    name="firstSentenceAge"
                    placeholder="If achieved (specify age)"
                    value={formData.firstSentenceAge}
                    onChange={handleChange}
                    className="border rounded-lg p-2 w-full"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 w-full bg-white py-8 px-5 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-700">
                Psychological Evaluation
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Attention Span:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="attentionSpan"
                        value="Adequate"
                        checked={formData.attentionSpan === "Adequate"}
                        onChange={handleChange}
                      />{" "}
                      Adequate
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="attentionSpan"
                        value="Inadequate"
                        checked={formData.attentionSpan === "Inadequate"}
                        onChange={handleChange}
                      />{" "}
                      Inadequate
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="attentionSpan"
                        value="Variable"
                        checked={formData.attentionSpan === "Variable"}
                        onChange={handleChange}
                      />{" "}
                      Variable
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Eye Contact:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="eyeContact"
                        value="Adequate"
                        checked={formData.eyeContact === "Adequate"}
                        onChange={handleChange}
                      />{" "}
                      Adequate
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="eyeContact"
                        value="Poor"
                        checked={formData.eyeContact === "Poor"}
                        onChange={handleChange}
                      />{" "}
                      Poor
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="eyeContact"
                        value="Avoidant"
                        checked={formData.eyeContact === "Avoidant"}
                        onChange={handleChange}
                      />{" "}
                      Avoidant
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Imitation Ability:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="imitationAbility"
                        value="Present"
                        checked={formData.imitationAbility === "Present"}
                        onChange={handleChange}
                      />{" "}
                      Present
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="imitationAbility"
                        value="Absent"
                        checked={formData.imitationAbility === "Absent"}
                        onChange={handleChange}
                      />{" "}
                      Absent
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="imitationAbility"
                        value="Partial"
                        checked={formData.imitationAbility === "Partial"}
                        onChange={handleChange}
                      />{" "}
                      Partial
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Social Skills:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="socialSkills"
                        value="Adequate"
                        checked={formData.socialSkills === "Adequate"}
                        onChange={handleChange}
                      />{" "}
                      Adequate
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="socialSkills"
                        value="Withdrawn"
                        checked={formData.socialSkills === "Withdrawn"}
                        onChange={handleChange}
                      />{" "}
                      Withdrawn
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="socialSkills"
                        value="Inappropriate"
                        checked={formData.socialSkills === "Inappropriate"}
                        onChange={handleChange}
                      />{" "}
                      Inappropriate
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Self-Help Skills:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="selfHelpSkills"
                        value="Independent"
                        checked={formData.selfHelpSkills === "Independent"}
                        onChange={handleChange}
                      />{" "}
                      Independent
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="selfHelpSkills"
                        value="Needs Assistance"
                        checked={formData.selfHelpSkills === "Needs Assistance"}
                        onChange={handleChange}
                      />{" "}
                      Needs Assistance
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="selfHelpSkills"
                        value="Dependent"
                        checked={formData.selfHelpSkills === "Dependent"}
                        onChange={handleChange}
                      />{" "}
                      Dependent
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Gross Motor Skills:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="grossMotorSkills"
                        value="Adequate"
                        checked={formData.grossMotorSkills === "Adequate"}
                        onChange={handleChange}
                      />{" "}
                      Adequate
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="grossMotorSkills"
                        value="Clumsy"
                        checked={formData.grossMotorSkills === "Clumsy"}
                        onChange={handleChange}
                      />{" "}
                      Clumsy
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="grossMotorSkills"
                        value="Delayed"
                        checked={formData.grossMotorSkills === "Delayed"}
                        onChange={handleChange}
                      />{" "}
                      Delayed
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Fine Motor Skills:</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="fineMotorSkills"
                        value="Adequate"
                        checked={formData.fineMotorSkills === "Adequate"}
                        onChange={handleChange}
                      />{" "}
                      Adequate
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="fineMotorSkills"
                        value="Poor"
                        checked={formData.fineMotorSkills === "Poor"}
                        onChange={handleChange}
                      />{" "}
                      Poor
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="fineMotorSkills"
                        value="Delayed"
                        checked={formData.fineMotorSkills === "Delayed"}
                        onChange={handleChange}
                      />{" "}
                      Delayed
                    </label>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-blue-700">
                Language Evaluation
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="receptiveLanguageAge"
                  placeholder="Receptive Language Age (e.g., 23)"
                  value={formData.receptiveLanguageAge}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="text"
                  name="expressiveLanguageAge"
                  placeholder="Expressive Language Age (e.g., 23)"
                  value={formData.expressiveLanguageAge}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="text"
                  name="receptiveVocabulary"
                  placeholder="Receptive Vocabulary (understanding)"
                  value={formData.receptiveVocabulary}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="text"
                  name="expressiveVocabulary"
                  placeholder="Expressive Vocabulary (use)"
                  value={formData.expressiveVocabulary}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>

              <h2 className="text-lg font-semibold text-blue-700">
                Social Context
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="familyType"
                  placeholder="Family Type (e.g., Joint, Nuclear)"
                  value={formData.familyType}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="text"
                  name="socialSetting"
                  placeholder="Social Setting (e.g., Attends school, College, Works)"
                  value={formData.socialSetting}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// User Options Component
const UserOptions: React.FC<UserOptionsProps> = ({ setScreen, formData }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validFileTypes = ["video/mp4", "video/quicktime"];
  const maxFileSize = 5 * 1024 * 1024;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validFileTypes.includes(file.type)) {
      setError("Invalid file type. Please upload MP4 or MOV files.");
      return;
    }

    if (file.size > maxFileSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setUploadedFile(file);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
      } else {
        setUploadProgress(progress);
      }
    }, 200);
  };

  const removeFile = (): void => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLiveRecording = (): void => {
    setScreen("screening");
  };

  return (
    <div>
      <p className="text-2xl text-center font-medium text-gray-700 mb-6">
        Choose how to proceed
      </p>
      <div className="w-3xl mx-auto bg-white p-6 rounded-xl shadow border border-purple-100">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">
          Upload a video
        </h2>
        <p className="text-sm text-gray-500 mb-3">Upload a 2 mins Video</p>

        <label
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition
            ${
              uploadedFile
                ? "border-green-300 bg-green-50"
                : "border-purple-300 hover:border-purple-400 hover:bg-purple-50"
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-purple-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {uploadedFile ? (
            <>
              <p className="text-green-700 font-medium">File Ready</p>
              <p className="text-sm text-green-600 truncate max-w-xs">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-green-500">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>

              {uploadProgress < 100 ? (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <p className="text-xs text-purple-600 mt-1">
                    {Math.round(uploadProgress)}% uploaded
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFile();
                  }}
                  className="mt-3 text-xs text-red-500 hover:text-red-700"
                >
                  Remove file
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-purple-700 font-medium">Browse Files</p>
              <p className="text-xs text-gray-500">Drag and drop files here</p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="flex mt-3 mb-3 items-center gap-2">
          <div className="w-[50%] h-0.5 bg-black"></div>
          <p className="text-black">OR</p>
          <div className="w-[50%] h-0.5 bg-black"></div>
        </div>

        <div className="mt-4 relative">
          <p className="text-sm text-center text-gray-600 mb-3">
            Don't have a video to upload? Take the live screening test for the
            most accurate, real-time analysis.
          </p>
          <button
            onClick={handleLiveRecording}
            className="relative w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:shadow-lg transition-all shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
              />
            </svg>
            <span className="font-semibold">Go to Live Screening</span>
          </button>
          <p className="mt-2 text-xs text-center text-purple-400">
            Real-time audio analysis
          </p>
        </div>
      </div>
    </div>
  );
};

// Start Screen Component
const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleStart = (): void => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0) {
      setError("Please enter a valid age.");
    } else {
      setError('');
      onStart(ageNum);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Gabify Screening</h1>
      <p className="text-slate-600 mb-6">A 4-minute interactive screening with real images and voice prompts.</p>
      <div className="space-y-4">
        <label htmlFor="age-input" className="block text-sm font-medium text-slate-700">
          Please enter the patient's age:
        </label>
        <input 
          type="number" 
          id="age-input" 
          value={age} 
          onChange={(e) => setAge(e.target.value)} 
          min="0" 
          max="120" 
          placeholder="e.g., 4" 
          className="w-full max-w-xs mx-auto px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
        />
        <button 
          onClick={handleStart} 
          className="w-full max-w-xs mx-auto bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <PlayCircleIcon /> Start Screening
        </button>
      </div>
      {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
    </div>
  );
};

// Screening Screen Component
const ScreeningScreen: React.FC<ScreeningScreenProps> = ({ age, onComplete, apiKey }) => {
  const [timeLeft, setTimeLeft] = useState<number>(240);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(0);
  const [status, setStatus] = useState<string>("initializing");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activityAbortRef = useRef<AbortController | null>(null);
  
  const api = createApi(apiKey);

  const showToast = (message: string, duration: number = 1000): void => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), duration);
  };

  useEffect(() => {
    const setup = async (): Promise<void> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
        
        mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, {
              type: "video/webm",
            });
            onComplete(blob, activities);
          } else {
            onComplete(null, activities);
          }
        };

        setStatus("generating");
        const fetchedActivities = await api.fetchActivities(getAgeSlab(age));
        setActivities(fetchedActivities);
        setStatus("active");
      } catch (err) {
        showToast("Could not access camera/microphone. Please check permissions.", 5000);
        console.error("Media access error:", err);
      }
    };
    setup();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [age, onComplete, apiKey, activities]);

  useEffect(() => {
    if (status === "active" && activities.length > 0) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
        mediaRecorderRef.current.start();
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, activities]);

  useEffect(() => {
    if (status === "active" && currentActivityIndex < activities.length) {
      const updateActivity = async (): Promise<void> => {
        const activity = activities[currentActivityIndex];
        setImageUrl("");

        if (activityAbortRef.current) {
          activityAbortRef.current.abort();
        }
        const controller = new AbortController();
        activityAbortRef.current = controller;

        try {
          const newImageUrl = await api.generateImage(activity.image_query);
          if (!controller.signal.aborted) {
            setImageUrl(newImageUrl);
            await api.speakText(activity.prompt_text);
          }
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error("Error generating activity:", err);
            showToast("⚠️ Error generating activity content.");
          }
        }
      };
      updateActivity();
    }
  }, [status, currentActivityIndex, activities, api]);

  const handleNextTask = (): void => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const currentActivity = activities[currentActivityIndex];
  const isSpeakingTask = currentActivity?.task_type === "verbal" || currentActivity?.task_type === "reasoning";

  return (
    <div className="relative bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-3xl shadow-xl w-full max-w-3xl mx-auto">
      {toastMsg && (
        <div className="absolute top-4 right-4 bg-fuchsia-600 text-white px-4 py-3 rounded-xl shadow-lg z-10">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 w-48 h-36 z-20 rounded-xl overflow-hidden border-4 border-white shadow-2xl transition-all duration-300 hover:shadow-purple-300/50">
        <div className="relative w-full h-full bg-gray-800">
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform scale-x-[-1]"
            autoPlay
            muted
          />
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 bg-rose-500/10 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
          <span className="text-rose-600 font-semibold text-sm tracking-wide">RECORDING</span>
        </div>
        <div className="text-xl font-bold bg-white px-4 py-2 rounded-xl text-violet-700 border border-violet-200 shadow-sm">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-violet-100">
          <div className="h-full flex flex-col">
            {isSpeakingTask && (
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-violet-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
                  SPEAKING TASK
                </span>
              </div>
            )}

            <div className="flex-1 flex items-center">
              <p className="text-violet-900 font-medium text-xl md:text-2xl leading-relaxed">
                {currentActivity?.prompt_text || "Preparing your activity..."}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full aspect-video bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
          {status !== "active" || !imageUrl ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-violet-700 font-medium">Loading activity...</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Activity"
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
            />
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNextTask}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 group"
        >
          <span>
            {currentActivityIndex < activities.length - 1 ? "Next Task" : "Finish Screening"}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Completion Screen Component
const CompletionScreen: React.FC<CompletionScreenProps> = ({ blob, activities, age, formData, onRestart, apiKey }) => {
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const downloadUrl = blob ? URL.createObjectURL(blob) : null;
  const api = createApi(apiKey);

  const handleGenerateReport = async (): Promise<void> => {
    setIsGenerating(true);
    const prompt = `You are an AI assistant for the Gabify Screening App. A screening was completed for ${formData?.firstName || 'a patient'} ${formData?.lastName || ''} who is ${age} years old. Patient details: ${formData ? `Sex: ${formData.sex}, Languages: ${formData.languagesSpoken}, Phone: ${formData.phoneNumber}` : 'Limited details available'}. The following activities were presented: ${activities.map(a => `"${a.prompt_text}"`).join(', ')}. Generate a comprehensive report including patient information, screening activities, potential strengths, areas for observation, and recommendations. Include a disclaimer that this is not a medical diagnosis.`;
    const markdownReport = await api.generateReport(age, activities);
    const htmlReport = markdownReport
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
      .replace(/(\n- .*)+/g, (match) => `<ul>${match.replace(/\n- /g, '<li>')}</ul>`)
      .replace(/\n/g, '<br />');
    setReport(htmlReport);
    setIsGenerating(false);
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-10 rounded-3xl shadow-xl text-center w-full max-w-4xl mx-auto transition-all duration-500">
      <div className="flex flex-col items-center">
        <CheckCircleIcon className="w-16 h-16 text-violet-600 mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Screening Complete!</h2>
        <p className="text-slate-600 mb-8">Your recording has been successfully saved.</p>
      </div>

      <div className={`relative transition-all duration-500 ${report ? "mb-8" : "mb-0"}`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mx-auto max-w-3xl">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`gabify-screening-${new Date().toISOString()}.webm`}
              className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
            >
              ⬇️ Download Recording
            </a>
          )}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300 disabled:from-violet-300 disabled:to-fuchsia-300"
          >
            {isGenerating ? <Spinner /> : "✨ Generate Summary Report"}
          </button>
        </div>

        {report && (
          <div 
            className="mt-10 text-left p-6 border border-violet-200 rounded-2xl bg-white shadow-md" 
            dangerouslySetInnerHTML={{ __html: report }}
          />
        )}
      </div>

      <button onClick={onRestart} className="text-violet-600 hover:underline mt-6 font-medium">
        🔄 Start New Screening
      </button>
    </div>
  );
};

// Main Component
const GabifyScreening: React.FC<GabifyScreeningProps> = ({ 
  geminiApiKey, 
  onComplete, 
  className = "",
  showTitle = true,
  showEvaluationForm = true
}) => {
  const [screen, setScreen] = useState<string>(showEvaluationForm ? "form" : "start");
  const [age, setAge] = useState<number | null>(null);
  const [screeningData, setScreeningData] = useState<ScreeningData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  if (!geminiApiKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium">Gemini API Key is required</p>
        <p className="text-red-500 text-sm mt-1">Please provide your Gemini API key as a prop</p>
      </div>
    );
  }

  const handleFormSubmit = (submittedFormData: FormData): void => {
    setFormData(submittedFormData);
    setAge(parseFloat(submittedFormData.age));
    setScreen("options");
  };

  const handleStartScreening = (selectedAge: number): void => {
    setAge(selectedAge);
    setScreen('screening');
  };

  const handleScreeningComplete = (blob: Blob | null, activities: Activity[]): void => {
    const data = { blob, activities };
    setScreeningData(data);
    setScreen('completion');
    if (onComplete && age) {
      onComplete({ ...data, age, formData: formData || undefined });
    }
  };

  const handleRestart = (): void => {
    setScreen(showEvaluationForm ? 'form' : 'start');
    setAge(null);
    setScreeningData(null);
    setFormData(null);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 flex items-center justify-center min-h-screen ${className}`}>
      {showTitle && (screen === 'start' || screen === 'form') && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Gabify</h1>
          <p className="text-gray-600">AI-Powered Speech Screening</p>
        </div>
      )}
      
      {screen === 'form' && <EvaluationForm onSuccess={handleFormSubmit} />}
      {screen === 'options' && formData && <UserOptions setScreen={setScreen} formData={formData} />}
      {screen === 'start' && <StartScreen onStart={handleStartScreening} />}
      {screen === 'screening' && age && (
        <ScreeningScreen 
          age={age} 
          onComplete={handleScreeningComplete} 
          apiKey={geminiApiKey}
        />
      )}
      {screen === 'completion' && screeningData && age && (
        <CompletionScreen 
          {...screeningData} 
          age={age} 
          formData={formData || undefined}
          onRestart={handleRestart}
          apiKey={geminiApiKey}
        />
      )}
    </div>
  );
};

export default GabifyScreening;