'use client';

import React, { useState } from "react";

// TypeScript interfaces
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

interface EvaluationFormProps {
  onSubmit: (formData: FormData) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  onSubmit, 
  className = "",
  title = "Evaluation Form",
  subtitle = "Please fill out the form below to the best of your ability."
}) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message: string, duration: number = 1000) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), duration);
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields for each step
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.age || !formData.sex || !formData.phoneNumber) {
        showToast("Please fill in all required fields", 2000);
        return;
      }
    }
    
    setStep((s) => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Form submitted successfully!", 2000);
      setTimeout(() => {
        onSubmit(formData);
      }, 1000);
    }, 1000);
  };

  return (
    <div className={`w-full h-full max-w-[100vw] ${className}`}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-pulse z-50">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-violet-100 shadow-lg rounded-2xl border border-blue-200">
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-purple-600 text-center">
            {title}
          </h1>
          <p className="text-center text-sm text-blue-800">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step Indicators */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center py-3 rounded-full mx-1 text-sm font-medium transition-all duration-300 ${
                  step === s
                    ? "bg-purple-600 text-white shadow-lg"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-blue-100 text-purple-600"
                }`}
              >
                {step > s ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  `Step ${s}`
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6 w-full bg-white py-8 px-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Fields */}
                <div>
                  <label className="block font-medium mb-2">
                    First Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2">
                    Last Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block font-medium mb-2">
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
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">Years/Months</span>
                </div>

                {/* Sex */}
                <div>
                  <label className="block font-medium mb-2">
                    Sex <span className="text-red-600">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {["Male", "Female", "Other"].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sex"
                          value={option}
                          checked={formData.sex === option}
                          onChange={handleChange}
                          required
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block font-medium mb-2">Languages Spoken:</label>
                  <input
                    type="text"
                    name="languagesSpoken"
                    placeholder="e.g., English, Spanish, Hindi"
                    value={formData.languagesSpoken}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-medium mb-2">
                    Phone Number (WhatsApp Preferred) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="(000) 000-0000"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <span className="text-xs text-gray-500 mt-1 block">
                    We will send the report to this number
                  </span>
                </div>
              </div>

              {/* Provisional Diagnosis */}
              <div>
                <label className="block font-medium mb-2">
                  Provisional Diagnosis (if any)
                </label>
                <textarea
                  name="provisionalDiagnosis"
                  rows={4}
                  placeholder="Please mention any past findings or diagnoses"
                  value={formData.provisionalDiagnosis}
                  onChange={handleChange}
                  className="border border-gray-300 resize-none rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Brief History */}
              <div>
                <label className="block font-medium mb-2">Brief History</label>
                <textarea
                  name="briefHistory"
                  rows={4}
                  placeholder="Please provide a summary of the child's history"
                  value={formData.briefHistory}
                  onChange={handleChange}
                  className="border border-gray-300 resize-none rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: Medical History */}
          {step === 2 && (
            <div className="space-y-6 w-full bg-white py-8 px-6 rounded-lg shadow-sm">
              {/* Pre-natal History */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Pre-natal History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <label className="block font-medium mb-2">
                      Significant History During Pregnancy:
                    </label>
                    <div className="space-y-2">
                      {["Normal", "Complicated"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pregnancyHistory"
                            value={option}
                            checked={formData.pregnancyHistory === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">
                      If complicated, please specify:
                    </label>
                    <input
                      type="text"
                      name="pregnancyComplications"
                      placeholder="Specify complications"
                      value={formData.pregnancyComplications}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Developmental History */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Developmental History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <label className="block font-medium mb-2">General Development:</label>
                    <div className="space-y-2">
                      {["Adequately Achieved", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="generalDevelopment"
                            value={option}
                            checked={formData.generalDevelopment === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">If delayed, specify:</label>
                    <input
                      type="text"
                      name="delayedDevelopment"
                      placeholder="Specify delays"
                      value={formData.delayedDevelopment}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Post-natal History */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Post-natal History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <label className="block font-medium mb-2">Birth Cry:</label>
                    <div className="space-y-2">
                      {["Present", "Absent", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="birthCry"
                            value={option}
                            checked={formData.birthCry === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Birth Weight (in KGs):</label>
                    <input
                      type="number"
                      name="birthWeight"
                      placeholder="e.g., 3.2"
                      value={formData.birthWeight}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Motor Milestones */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Motor Milestones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Motor */}
                  <div>
                    <label className="block font-medium mb-2">General:</label>
                    <div className="space-y-2">
                      {["Adequately Achieved", "Delayed", "Advanced"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="motorGeneral"
                            value={option}
                            checked={formData.motorGeneral === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Neck Control */}
                  <div>
                    <label className="block font-medium mb-2">Neck Control:</label>
                    <div className="space-y-2">
                      {["Age appropriate", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="motorNeck"
                            value={option}
                            checked={formData.motorNeck === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sitting */}
                  <div>
                    <label className="block font-medium mb-2">Sitting:</label>
                    <div className="space-y-2">
                      {["Age appropriate", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="motorSitting"
                            value={option}
                            checked={formData.motorSitting === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Walking */}
                  <div>
                    <label className="block font-medium mb-2">Walking:</label>
                    <div className="space-y-2">
                      {["Age appropriate", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="motorWalking"
                            value={option}
                            checked={formData.motorWalking === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Speech Milestones */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Speech Milestones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-2">Babbling Age (months):</label>
                    <input
                      type="number"
                      name="babblingAge"
                      placeholder="e.g., 6"
                      value={formData.babblingAge}
                      onChange={handleChange}
                      min="0"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">First Word Age (months):</label>
                    <input
                      type="number"
                      name="firstWordAge"
                      placeholder="e.g., 12"
                      value={formData.firstWordAge}
                      onChange={handleChange}
                      min="0"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">First Sentence Status:</label>
                    <div className="space-y-2">
                      {["Achieved", "Not yet achieved"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="firstSentence"
                            value={option}
                            checked={formData.firstSentence === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.firstSentence === "Achieved" && (
                    <div>
                      <label className="block font-medium mb-2">First Sentence Age (months):</label>
                      <input
                        type="number"
                        name="firstSentenceAge"
                        placeholder="e.g., 24"
                        value={formData.firstSentenceAge}
                        onChange={handleChange}
                        min="0"
                        className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Detailed Assessment */}
          {step === 3 && (
            <div className="space-y-6 w-full bg-white py-8 px-6 rounded-lg shadow-sm">
              {/* Psychological Evaluation */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Psychological Evaluation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attention Span */}
                  <div>
                    <label className="block font-medium mb-2">Attention Span:</label>
                    <div className="space-y-2">
                      {["Adequate", "Inadequate", "Variable"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="attentionSpan"
                            value={option}
                            checked={formData.attentionSpan === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Eye Contact */}
                  <div>
                    <label className="block font-medium mb-2">Eye Contact:</label>
                    <div className="space-y-2">
                      {["Adequate", "Poor", "Avoidant"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="eyeContact"
                            value={option}
                            checked={formData.eyeContact === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Imitation Ability */}
                  <div>
                    <label className="block font-medium mb-2">Imitation Ability:</label>
                    <div className="space-y-2">
                      {["Present", "Absent", "Partial"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="imitationAbility"
                            value={option}
                            checked={formData.imitationAbility === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Social Skills */}
                  <div>
                    <label className="block font-medium mb-2">Social Skills:</label>
                    <div className="space-y-2">
                      {["Adequate", "Withdrawn", "Inappropriate"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="socialSkills"
                            value={option}
                            checked={formData.socialSkills === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Self Help Skills */}
                  <div>
                    <label className="block font-medium mb-2">Self-Help Skills:</label>
                    <div className="space-y-2">
                      {["Independent", "Needs Assistance", "Dependent"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="selfHelpSkills"
                            value={option}
                            checked={formData.selfHelpSkills === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gross Motor Skills */}
                  <div>
                    <label className="block font-medium mb-2">Gross Motor Skills:</label>
                    <div className="space-y-2">
                      {["Adequate", "Clumsy", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="grossMotorSkills"
                            value={option}
                            checked={formData.grossMotorSkills === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Fine Motor Skills */}
                  <div>
                    <label className="block font-medium mb-2">Fine Motor Skills:</label>
                    <div className="space-y-2">
                      {["Adequate", "Poor", "Delayed"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="fineMotorSkills"
                            value={option}
                            checked={formData.fineMotorSkills === option}
                            onChange={handleChange}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Evaluation */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Language Evaluation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-2">Receptive Language Age (months):</label>
                    <input
                      type="text"
                      name="receptiveLanguageAge"
                      placeholder="e.g., 23"
                      value={formData.receptiveLanguageAge}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Expressive Language Age (months):</label>
                    <input
                      type="text"
                      name="expressiveLanguageAge"
                      placeholder="e.g., 23"
                      value={formData.expressiveLanguageAge}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Receptive Vocabulary:</label>
                    <input
                      type="text"
                      name="receptiveVocabulary"
                      placeholder="Understanding level"
                      value={formData.receptiveVocabulary}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Expressive Vocabulary:</label>
                    <input
                      type="text"
                      name="expressiveVocabulary"
                      placeholder="Usage level"
                      value={formData.expressiveVocabulary}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Social Context */}
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-4">Social Context</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-2">Family Type:</label>
                    <input
                      type="text"
                      name="familyType"
                      placeholder="e.g., Joint, Nuclear"
                      value={formData.familyType}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Social Setting:</label>
                    <input
                      type="text"
                      name="socialSetting"
                      placeholder="e.g., Attends school, College, Works"
                      value={formData.socialSetting}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
              >
                ← Back
              </button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Form"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;
export type { FormData };