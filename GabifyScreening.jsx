import React, { useState, useEffect, useRef } from 'react';

// Utility functions
const getAgeSlab = (age) => {
  if (age < 1) return "Infants: 8–12 months";
  if (age <= 2) return "Toddlers: 1–2 years";
  if (age <= 5) return "Preschool: 3–5 years";
  if (age <= 10) return "School-age: 6–10 years";
  if (age <= 17) return "Pre-teens & Teens: 11–17 years";
  return "Adults: 18+ years";
};

const pcmToWav = (pcmData, sampleRate) => {
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
const createApi = (apiKey) => {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  const IMAGEN_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const TTS_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  return {
    fetchActivities: async (ageSlab) => {
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
};

// Icons
const PlayCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10,8 16,12 10,16 10,8"/>
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const Spinner = () => (
  <div className="border-4 border-slate-200 w-9 h-9 border-t-indigo-600 rounded-full animate-spin"></div>
);

// Start Screen Component
const StartScreen = ({ onStart }) => {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
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
        <label htmlFor="age-input" className="block text-sm font-medium text-slate-700">Please enter the patient's age:</label>
        <input 
          type="number" 
          id="age-input" 
          value={age} 
          onChange={e => setAge(e.target.value)} 
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
const ScreeningScreen = ({ age, onComplete, apiKey }) => {
  const [timeLeft, setTimeLeft] = useState(240);
  const [activities, setActivities] = useState([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [status, setStatus] = useState("initializing");
  const [imageUrl, setImageUrl] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const activityAbortRef = useRef(null);
  const api = createApi(apiKey);

  const showToast = (message, duration = 1000) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), duration);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
        mediaRecorderRef.current.ondataavailable = (e) => {
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
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [age, onComplete, apiKey]);

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
      const updateActivity = async () => {
        const activity = activities[currentActivityIndex];
        setImageUrl("");

        if (activityAbortRef.current) {
          activityAbortRef.current.abort();
        }
        const controller = new AbortController();
        activityAbortRef.current = controller;

        try {
          const newImageUrl = await api.generateImage(activity.image_query, {
            signal: controller.signal,
          });
          if (!controller.signal.aborted) {
            setImageUrl(newImageUrl);
            await api.speakText(activity.prompt_text);
          }
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Error generating activity:", err);
            showToast("⚠️ Error generating activity content.");
          }
        }
      };
      updateActivity();
    }
  }, [status, currentActivityIndex, activities, api]);

  const handleNextTask = () => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  const formatTime = (seconds) => {
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
          ></video>
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
const CompletionScreen = ({ blob, activities, age, onRestart, apiKey }) => {
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const downloadUrl = blob ? URL.createObjectURL(blob) : null;
  const api = createApi(apiKey);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
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
          <div className="mt-10 text-left p-6 border border-violet-200 rounded-2xl bg-white shadow-md" dangerouslySetInnerHTML={{ __html: report }}></div>
        )}
      </div>

      <button onClick={onRestart} className="text-violet-600 hover:underline mt-6 font-medium">
        🔄 Start New Screening
      </button>
    </div>
  );
};

// Main Component
const GabifyScreening = ({ 
  geminiApiKey, 
  onComplete, 
  className = "",
  showTitle = true 
}) => {
  const [screen, setScreen] = useState("start");
  const [age, setAge] = useState(null);
  const [screeningData, setScreeningData] = useState(null);

  if (!geminiApiKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium">Gemini API Key is required</p>
        <p className="text-red-500 text-sm mt-1">Please provide your Gemini API key as a prop</p>
      </div>
    );
  }

  const handleStartScreening = (selectedAge) => {
    setAge(selectedAge);
    setScreen('screening');
  };

  const handleScreeningComplete = (blob, activities) => {
    setScreeningData({ blob, activities });
    setScreen('completion');
    if (onComplete) {
      onComplete({ blob, activities, age });
    }
  };

  const handleRestart = () => {
    setScreen('start');
    setAge(null);
    setScreeningData(null);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-6 flex items-center justify-center min-h-screen ${className}`}>
      {showTitle && screen === 'start' && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Gabify</h1>
          <p className="text-gray-600">AI-Powered Speech Screening</p>
        </div>
      )}
      
      {screen === 'start' && <StartScreen onStart={handleStartScreening} />}
      {screen === 'screening' && (
        <ScreeningScreen 
          age={age} 
          onComplete={handleScreeningComplete} 
          apiKey={geminiApiKey}
        />
      )}
      {screen === 'completion' && (
        <CompletionScreen 
          {...screeningData} 
          age={age} 
          onRestart={handleRestart}
          apiKey={geminiApiKey}
        />
      )}
    </div>
  );
};

export default GabifyScreening;