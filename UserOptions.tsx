'use client';

import React, { useState, useRef } from "react";

// TypeScript interfaces
interface UserOptionsProps {
  onLiveScreening: () => void;
  onVideoUpload?: (file: File) => void;
  className?: string;
  title?: string;
  subtitle?: string;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

const UserOptions: React.FC<UserOptionsProps> = ({
  onLiveScreening,
  onVideoUpload,
  className = "",
  title = "Choose how to proceed",
  subtitle = "Select your preferred screening method",
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedFileTypes = ["video/mp4", "video/quicktime", "video/webm"]
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setError(`Invalid file type. Please upload ${allowedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files.`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setUploadedFile(file);
    setUploadProgress(0);
    setIsUploading(true);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress between 5-20%
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        
        // Call the upload callback if provided
        if (onVideoUpload) {
          onVideoUpload(file);
        }
      } else {
        setUploadProgress(Math.min(progress, 95)); // Cap at 95% until complete
      }
    }, 200);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLiveRecording = () => {
    onLiveScreening();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Video Option */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-700">Upload Video</h3>
              <p className="text-sm text-gray-500">Upload an existing 2-4 minute video</p>
            </div>
          </div>

          {/* Upload Area */}
          <label
            className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              uploadedFile
                ? "border-green-400 bg-green-50 hover:bg-green-100"
                : error
                ? "border-red-400 bg-red-50 hover:bg-red-100"
                : "border-purple-300 hover:border-purple-400 hover:bg-purple-50"
            }`}
          >
            {uploadedFile ? (
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-semibold text-lg">File Ready!</p>
                <p className="text-sm text-green-600 truncate max-w-xs mt-1">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {formatFileSize(uploadedFile.size)}
                </p>

                {isUploading ? (
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-purple-600 mt-2 font-medium">
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
                    className="mt-4 text-sm text-red-500 hover:text-red-700 underline transition-colors"
                  >
                    Remove file
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-12 w-12 mb-4 mx-auto transition-colors ${
                    error ? "text-red-400" : "text-purple-400"
                  }`}
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
                <p className={`font-semibold text-lg mb-2 ${error ? "text-red-600" : "text-purple-700"}`}>
                  {error ? "Upload Failed" : "Browse Files"}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop your video here
                </p>
                <p className="text-xs text-gray-400">
                  Supported: {allowedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • Max {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={allowedFileTypes.join(',')}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {uploadedFile && uploadProgress === 100 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Video uploaded successfully! You can now proceed with analysis.
              </p>
            </div>
          )}
        </div>

        {/* Live Screening Option */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-700">Live Screening</h3>
              <p className="text-sm text-gray-500">Real-time interactive assessment</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-purple-700 mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Age-appropriate interactive activities
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  AI-generated images and voice prompts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Real-time video recording
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Comprehensive analysis report
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-700">Camera & Microphone Required</p>
                  <p className="text-xs text-amber-600 mt-1">
                    You'll be prompted to allow access to your camera and microphone for recording.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLiveRecording}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="font-semibold text-lg">Start Live Screening</span>
            </button>

            <p className="text-center text-xs text-purple-400">
              Duration: ~4 minutes • Real-time AI analysis
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <span className="text-gray-500 font-medium px-4 bg-gray-50 rounded-full text-sm">
          OR
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Recommendation</h4>
            <p className="text-sm text-blue-600 leading-relaxed">
              For the most accurate assessment, we recommend the <strong>Live Screening</strong> option. 
              It provides real-time interaction with age-appropriate activities and generates more 
              comprehensive analysis compared to uploaded videos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOptions;