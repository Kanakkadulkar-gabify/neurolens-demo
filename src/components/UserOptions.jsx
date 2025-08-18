import { useState, useRef } from "react";
import React from "react";

const Options = ({ setScreen }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Allowed file types and max size (5MB)
  const validFileTypes = ["video/mp4", "video/quicktime"];
  const maxFileSize = 5 * 1024 * 1024;

  const handleFileUpload = (e) => {
    setError(null);
    const file = e.target.files[0];
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

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLiveRecording = () => {
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

      {/* Upload box */}
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

      {/* Live Screening Button */}
      <div className="flex mt-3 mb-3 items-center gap-2">
        <div className="w-[50%] h-0.5 bg-black  "></div>
        <p className="text-black">OR</p>
        <div className="w-[50%] h-0.5 bg-black  "></div>
      </div>

      <div className="mt-4 relative">
        <p className="text-sm text-center text-gray-600 mb-3">
          Don’t have a video to upload? Take the live screening test for the
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

export default Options;
