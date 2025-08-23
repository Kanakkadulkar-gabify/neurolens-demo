# Evaluation Form Component for Next.js

A standalone TypeScript React component for comprehensive patient evaluation that can be easily integrated into any Next.js project.

## Installation

1. Copy the `EvaluationForm.tsx` file to your Next.js project's components directory
2. Make sure you have Tailwind CSS configured in your Next.js project

## Usage

```tsx
import EvaluationForm, { FormData } from './components/EvaluationForm';

export default function MyPage() {
  const handleFormSubmit = (formData: FormData) => {
    console.log('Form submitted:', formData);
    // Handle the form data
    // You can save to database, send to API, etc.
  };

  return (
    <div>
      <EvaluationForm 
        onSubmit={handleFormSubmit}
        title="Patient Evaluation"
        subtitle="Complete patient assessment form"
        className="my-custom-class"
      />
    </div>
  );
}
```

## Props

- `onSubmit` (function, **required**): Callback function called when form is submitted
  - Type: `(formData: FormData) => void`
- `className` (string, optional): Additional CSS classes to apply to the container
- `title` (string, optional): Form title (default: "Evaluation Form")
- `subtitle` (string, optional): Form subtitle (default: "Please fill out the form below to the best of your ability.")

## Form Structure

The form consists of 3 steps:

### Step 1: Basic Information
- **Personal Details**: First name, last name, age, sex
- **Contact**: Phone number, languages spoken
- **Medical**: Provisional diagnosis, brief history

### Step 2: Medical & Developmental History
- **Pre-natal History**: Pregnancy complications
- **Developmental History**: General development milestones
- **Post-natal History**: Birth details, weight
- **Motor Milestones**: Neck control, sitting, walking
- **Speech Milestones**: Babbling, first words, sentences

### Step 3: Detailed Assessment
- **Psychological Evaluation**: Attention span, eye contact, imitation, social skills
- **Motor Skills**: Gross and fine motor development
- **Language Evaluation**: Receptive and expressive language abilities
- **Social Context**: Family type, social setting

## TypeScript Interface

```tsx
interface FormData {
  // Step 1 - Basic Information
  firstName: string;
  lastName: string;
  age: string;
  sex: string;
  languagesSpoken: string;
  phoneNumber: string;
  provisionalDiagnosis: string;
  briefHistory: string;

  // Step 2 - Medical History
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

  // Step 3 - Detailed Assessment
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
```

## Features

- **Multi-step form**: 3 organized steps with progress indicators
- **Form validation**: Required field validation with user feedback
- **Responsive design**: Works on desktop and mobile devices
- **TypeScript support**: Full type safety and IntelliSense
- **Toast notifications**: User feedback for form submission
- **Progress tracking**: Visual step indicators with completion states
- **Conditional fields**: Dynamic form fields based on previous answers

## Styling

The component uses Tailwind CSS classes and includes:
- Gradient backgrounds and modern design
- Hover states and transitions
- Focus states for accessibility
- Responsive grid layouts
- Custom radio button styling

## Validation

The form includes:
- Required field validation for Step 1
- Email/phone format validation
- Age range validation
- Real-time feedback with toast messages

## Example Integration

```tsx
'use client';

import { useState } from 'react';
import EvaluationForm, { FormData } from './components/EvaluationForm';

export default function PatientEvaluation() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const handleFormSubmit = (formData: FormData) => {
    // Save to database or send to API
    console.log('Patient evaluation data:', formData);
    setSubmittedData(formData);
    
    // Example: Send to your API
    // fetch('/api/evaluations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Form Submitted!</h2>
          <p className="text-gray-600">
            Evaluation for {submittedData.firstName} {submittedData.lastName} has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EvaluationForm 
        onSubmit={handleFormSubmit}
        title="Patient Evaluation Form"
        subtitle="Please complete all sections for comprehensive assessment"
      />
    </div>
  );
}
```

## Notes

- The component is designed to work in client-side environments only (use `'use client'` directive in Next.js)
- All form data is typed with TypeScript for better development experience
- The component handles all form state management internally
- Includes proper accessibility features and keyboard navigation
- Form data is validated before submission
- Toast notifications provide immediate user feedback