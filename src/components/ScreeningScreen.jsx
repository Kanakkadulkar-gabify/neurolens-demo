import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/gemini";
import { getAgeSlab } from "../utils/helpers";
import { Spinner, MicIcon,ExclamationCircleIcon, ArrowRightCircleIcon } from "../utils/icons";

const SCREENING_DURATION = 240; // 4 minutes max

function ScreeningScreen({ age, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(SCREENING_DURATION);
  const [activities, setActivities] = useState([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [status, setStatus] = useState("initializing");
  const [imageUrl, setImageUrl] = useState("");
  const [toastMsg, setToastMsg] = useState(null); 
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const activityAbortRef = useRef(null);

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
            console.log(" Recorded Blob:", blob);
            console.log("Play in browser:", URL.createObjectURL(blob));
            onComplete(blob, activities);
          } else {
            console.log(" No data recorded.");
            onComplete(null, activities);
          }
        };

        setStatus("generating");
        const fetchedActivities = await api.fetchActivities(getAgeSlab(age));
        setActivities(fetchedActivities);
        setStatus("active");
      } catch (err) {
        showToast(
          " Could not access camera/microphone. Please check permissions.",
          5000
        );
        console.error("Media access error:", err);
        setTimeout(() => window.location.reload(), 2500);
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
  }, [age, onComplete]);

  useEffect(() => {
    if (status === "active" && activities.length > 0) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "inactive"
      ) {
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
  }, [status, currentActivityIndex, activities]);

  const handleNextTask = () => {
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
       if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null; // release video element
    }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const currentActivity = activities[currentActivityIndex];
  const isSpeakingTask =
    currentActivity?.task_type === "verbal" ||
    currentActivity?.task_type === "reasoning";

  return (
   <div className="relative bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-3xl shadow-xl w-full max-w-3xl mx-auto">
  {/* Toast Notification */}
  {toastMsg && (
    <div className="absolute top-4 right-4 bg-fuchsia-600 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-out z-10">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>{toastMsg}</span>
      </div>
    </div>
  )}

  {/* Fixed Video Feed */}
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
      <span className="text-rose-600 font-semibold text-sm tracking-wide">
        RECORDING
      </span>
    </div>
    <div className="text-xl font-bold bg-white px-4 py-2 rounded-xl text-violet-700 border border-violet-200 shadow-sm">
      {formatTime(timeLeft)}
    </div>
  </div>

  {/* Main Content - Flex Column */}
  <div className="flex flex-col gap-6">
    {/* Question Panel */}
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

    {/* Image Container */}
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

  {/* Action Button */}
  <div className="mt-8 flex justify-end">
    <button
      onClick={handleNextTask}
      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 group"
    >
      <span>
        {currentActivityIndex < activities.length - 1
          ? "Next Task"
          : "Finish Screening"}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
</div>
  );
}

export default ScreeningScreen;
