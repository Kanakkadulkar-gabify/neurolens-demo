# Gabify Screening Component for Next.js

A standalone React component for speech and language screening that can be easily integrated into any Next.js project.

## Installation

1. Copy the `GabifyScreening.jsx` file to your Next.js project's components directory
2. Install required dependencies:

```bash
npm install react react-dom
```

3. Make sure you have Tailwind CSS configured in your Next.js project

## Usage

```jsx
import GabifyScreening from './components/GabifyScreening';

export default function MyPage() {
  const handleScreeningComplete = (data) => {
    console.log('Screening completed:', data);
    // Handle the completion data (blob, activities, age)
  };

  return (
    <div>
      <GabifyScreening 
        geminiApiKey="your-gemini-api-key-here"
        onComplete={handleScreeningComplete}
        showTitle={true}
        className="my-custom-class"
      />
    </div>
  );
}
```

## Props

- `geminiApiKey` (string, required): Your Google Gemini API key
- `onComplete` (function, optional): Callback function called when screening is completed
- `showTitle` (boolean, optional): Whether to show the Gabify title (default: true)
- `className` (string, optional): Additional CSS classes to apply to the container

## Features

- **Age-appropriate screening**: Automatically generates activities based on patient age
- **Real-time recording**: Records video during the screening process
- **AI-generated content**: Uses Gemini AI for activities, images, and text-to-speech
- **Responsive design**: Works on desktop and mobile devices
- **Report generation**: Creates summary reports after screening completion

## API Key Setup

You'll need a Google Gemini API key to use this component. Get one from:
https://makersuite.google.com/app/apikey

## Browser Permissions

The component requires:
- Camera access for video recording
- Microphone access for audio recording

Users will be prompted to grant these permissions when starting a screening.

## Styling

The component uses Tailwind CSS classes. Make sure your Next.js project has Tailwind CSS configured. The component is fully self-contained and doesn't require additional CSS files.

## Example Integration

```jsx
'use client';

import { useState } from 'react';
import GabifyScreening from './components/GabifyScreening';

export default function ScreeningPage() {
  const [results, setResults] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <GabifyScreening 
        geminiApiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}
        onComplete={(data) => {
          setResults(data);
          console.log('Screening results:', data);
        }}
      />
      
      {results && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold">Screening Results:</h3>
          <p>Age: {results.age}</p>
          <p>Activities completed: {results.activities?.length}</p>
          <p>Recording available: {results.blob ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

Add your Gemini API key to your `.env.local` file:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## Notes

- The component is designed to work in client-side environments only (use 'use client' directive in Next.js)
- Recording format is WebM, which is supported by most modern browsers
- The component handles all media permissions and error states internally
- Generated images and audio are temporary and not stored permanently