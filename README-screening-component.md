# Screening Component for Next.js

A standalone TypeScript React component for interactive speech and language screening that can be easily integrated into any Next.js project.

## Installation

1. Copy the `ScreeningComponent.tsx` file to your Next.js project's components directory
2. Make sure you have Tailwind CSS configured in your Next.js project

## Usage

```tsx
import ScreeningComponent, { Activity } from './components/ScreeningComponent';

export default function MyPage() {
  const handleScreeningComplete = (blob: Blob | null, activities: Activity[]) => {
    console.log('Screening completed:', { blob, activities });
    // Handle the completion data
    // blob contains the recorded video
    // activities contains the screening tasks that were performed
  };

  return (
    <div>
      <ScreeningComponent 
        age={5}
        geminiApiKey="your-gemini-api-key-here"
        onComplete={handleScreeningComplete}
        screeningDuration={240} // 4 minutes
      />
    </div>
  );
}
```

## Props

- `age` (number, **required**): Patient's age for age-appropriate activity generation
- `geminiApiKey` (string, **required**): Your Google Gemini API key
- `onComplete` (function, **required**): Callback function called when screening is completed
  - Type: `(blob: Blob | null, activities: Activity[]) => void`
- `className` (string, optional): Additional CSS classes to apply to the container
- `screeningDuration` (number, optional): Duration in seconds (default: 240 = 4 minutes)

## TypeScript Types

```tsx
interface Activity {
  prompt_text: string;
  image_query: string;
  task_type: 'verbal' | 'motor' | 'imitation' | 'comprehension' | 'reasoning';
}

interface ScreeningComponentProps {
  age: number;
  geminiApiKey: string;
  onComplete: (blob: Blob | null, activities: Activity[]) => void;
  className?: string;
  screeningDuration?: number;
}
```

## Features

### Age-Appropriate Activities
The component automatically generates screening activities based on the patient's age:
- **Infants (8-12 months)**: Babbling, sound response, social engagement
- **Toddlers (1-2 years)**: Vocabulary emergence, imitation, gesture use
- **Preschool (3-5 years)**: Sentence formation, comprehension, concept knowledge
- **School-age (6-10 years)**: Grammar, vocabulary, reading, attention
- **Pre-teens & Teens (11-17 years)**: Fluency, comprehension, working memory
- **Adults (18+ years)**: Speech clarity, cognitive-linguistic functions

### Real-time Recording
- Records video and audio during the screening session
- Shows live video feed in a floating window
- Automatic recording start/stop based on session duration
- Returns recorded blob for download or processing

### AI-Generated Content
- **Activities**: Uses Gemini AI to generate age-appropriate screening tasks
- **Images**: Creates relevant images for each activity using Imagen API
- **Text-to-Speech**: Converts activity prompts to speech using Gemini TTS

### Interactive Interface
- **Timer**: Shows remaining time for the screening session
- **Progress Indicators**: Visual dots showing current activity progress
- **Task Types**: Different visual indicators for speaking vs. other tasks
- **Next Task Button**: Manual progression through activities

### Error Handling
- Camera/microphone permission handling
- API error recovery with fallback activities
- Toast notifications for user feedback
- Graceful degradation when APIs fail

## Browser Permissions

The component requires:
- **Camera access**: For video recording during screening
- **Microphone access**: For audio recording during screening

Users will be prompted to grant these permissions when the component loads.

## API Requirements

You'll need a Google Gemini API key with access to:
- Gemini 2.5 Flash (for activity generation)
- Imagen 3.0 (for image generation)
- Gemini TTS (for text-to-speech)

Get your API key from: https://makersuite.google.com/app/apikey

## Example Integration

```tsx
'use client';

import { useState } from 'react';
import ScreeningComponent, { Activity } from './components/ScreeningComponent';

export default function ScreeningPage() {
  const [isScreening, setIsScreening] = useState(false);
  const [results, setResults] = useState<{
    blob: Blob | null;
    activities: Activity[];
  } | null>(null);

  const handleStart = () => {
    setIsScreening(true);
  };

  const handleComplete = (blob: Blob | null, activities: Activity[]) => {
    setResults({ blob, activities });
    setIsScreening(false);
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Screening Complete!</h2>
          <p className="text-gray-600 mb-4">
            Completed {results.activities.length} activities
          </p>
          {results.blob && (
            <a
              href={URL.createObjectURL(results.blob)}
              download={`screening-${new Date().toISOString()}.webm`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Download Recording
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isScreening) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ScreeningComponent
          age={5}
          geminiApiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY!}
          onComplete={handleComplete}
          screeningDuration={300} // 5 minutes
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <button
        onClick={handleStart}
        className="bg-purple-600 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-purple-700"
      >
        Start Screening
      </button>
    </div>
  );
}
```

## Environment Variables

Add your Gemini API key to your `.env.local` file:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## Styling

The component uses Tailwind CSS classes and includes:
- Gradient backgrounds and modern design
- Floating video feed with live indicator
- Progress indicators and timer
- Responsive design for mobile and desktop
- Hover states and smooth transitions

## Notes

- The component is designed for client-side use only (use `'use client'` directive in Next.js)
- Recording format is WebM, supported by most modern browsers
- Generated images and audio are temporary and not stored permanently
- The component handles all media permissions and error states internally
- Full TypeScript support with proper type definitions
- Activities are generated in real-time based on patient age
- Component automatically cleans up media streams when unmounted