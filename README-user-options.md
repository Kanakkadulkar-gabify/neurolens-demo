# User Options Component for Next.js

A standalone TypeScript React component that provides users with options to either upload a video or start a live screening session.

## Installation

1. Copy the `UserOptions.tsx` file to your Next.js project's components directory
2. Make sure you have Tailwind CSS configured in your Next.js project

## Usage

```tsx
import UserOptions from './components/UserOptions';

export default function MyPage() {
  const handleLiveScreening = () => {
    console.log('Starting live screening...');
    // Navigate to live screening or update state
  };

  const handleVideoUpload = (file: File) => {
    console.log('Video uploaded:', file);
    // Process the uploaded video file
  };

  return (
    <div>
      <UserOptions 
        onLiveScreening={handleLiveScreening}
        onVideoUpload={handleVideoUpload}
        title="Choose Your Assessment Method"
        subtitle="Select how you'd like to proceed with the screening"
      />
    </div>
  );
}
```

## Props

- `onLiveScreening` (function, **required**): Callback function called when user chooses live screening
  - Type: `() => void`
- `onVideoUpload` (function, optional): Callback function called when a video is successfully uploaded
  - Type: `(file: File) => void`
- `className` (string, optional): Additional CSS classes to apply to the container
- `title` (string, optional): Main title (default: "Choose how to proceed")
- `subtitle` (string, optional): Subtitle text (default: "Select your preferred screening method")
- `maxFileSize` (number, optional): Maximum file size in bytes (default: 5MB)
- `allowedFileTypes` (string[], optional): Array of allowed MIME types (default: ["video/mp4", "video/quicktime", "video/webm"])

## Features

### Upload Video Option
- **Drag & Drop Interface**: Modern file upload with visual feedback
- **File Validation**: Checks file type and size before upload
- **Progress Indicator**: Shows upload progress with smooth animations
- **Error Handling**: Clear error messages for invalid files
- **File Information**: Displays file name and size after successful upload
- **Remove Functionality**: Option to remove uploaded file and try again

### Live Screening Option
- **Interactive Design**: Engaging call-to-action for live screening
- **Feature Highlights**: Lists benefits of live screening
- **Requirements Notice**: Informs users about camera/microphone needs
- **Recommendation**: Suggests live screening for best results

### Design Features
- **Responsive Layout**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional design with gradients and shadows
- **Hover Effects**: Interactive elements with smooth transitions
- **Visual Feedback**: Icons and colors indicate different states
- **Accessibility**: Proper labels and keyboard navigation

## File Upload Configuration

You can customize the file upload behavior:

```tsx
<UserOptions 
  onLiveScreening={handleLiveScreening}
  onVideoUpload={handleVideoUpload}
  maxFileSize={10 * 1024 * 1024} // 10MB
  allowedFileTypes={["video/mp4", "video/mov", "video/avi"]}
/>
```

## TypeScript Interface

```tsx
interface UserOptionsProps {
  onLiveScreening: () => void;
  onVideoUpload?: (file: File) => void;
  className?: string;
  title?: string;
  subtitle?: string;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}
```

## Example Integration with State Management

```tsx
'use client';

import { useState } from 'react';
import UserOptions from './components/UserOptions';

export default function ScreeningPage() {
  const [currentStep, setCurrentStep] = useState<'options' | 'screening' | 'analysis'>('options');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);

  const handleLiveScreening = () => {
    setCurrentStep('screening');
    // Start live screening process
  };

  const handleVideoUpload = (file: File) => {
    setUploadedVideo(file);
    setCurrentStep('analysis');
    // Process uploaded video
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 'options' && (
        <UserOptions 
          onLiveScreening={handleLiveScreening}
          onVideoUpload={handleVideoUpload}
          title="Speech Assessment Options"
          subtitle="Choose your preferred method for speech screening"
        />
      )}
      
      {currentStep === 'screening' && (
        <div>Live Screening Component</div>
      )}
      
      {currentStep === 'analysis' && uploadedVideo && (
        <div>Video Analysis Component</div>
      )}
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes and includes:
- Gradient backgrounds and modern card designs
- Hover states and micro-interactions
- Progress bars and loading states
- Error and success state styling
- Responsive grid layouts

## File Handling

The component includes robust file handling:
- **Type Validation**: Ensures only allowed video formats
- **Size Validation**: Prevents oversized file uploads
- **Progress Tracking**: Visual feedback during upload
- **Error Recovery**: Clear error messages and retry options
- **File Information**: Shows file details after successful upload

## Browser Compatibility

- Works in all modern browsers that support File API
- Drag and drop functionality included
- Graceful fallback for older browsers
- Mobile-friendly touch interactions

## Notes

- The component is designed for client-side use only (use `'use client'` directive in Next.js)
- File upload is simulated with progress animation - integrate with your actual upload logic
- All styling is self-contained using Tailwind CSS
- Component handles all internal state management
- Fully accessible with proper ARIA labels and keyboard navigation