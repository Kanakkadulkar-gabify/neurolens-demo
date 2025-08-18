import React, { useState } from "react";

export default function EvaluationForm({ onSuccess }) {
  const [step, setStep] = useState(1);
   const [toastMsg, setToastMsg] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    // Psychological Evaluation
    attentionSpan: "",
    eyeContact: "",
    imitationAbility: "",
    socialSkills: "",
    selfHelpSkills: "",
    grossMotorSkills: "",
    fineMotorSkills: "",

    // Language Evaluation
    receptiveLanguageAge: "",
    expressiveLanguageAge: "",
    receptiveVocabulary: "",
    expressiveVocabulary: "",

    // Social Context
    familyType: "",
    socialSetting: "",
  });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   const showToast = (message, duration = 1000) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), duration);
  };

  const nextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStep((s) => Math.min(s + 1, 3));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Submitted Data:", formData);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Form submitted! Check console for data.",2000);
     setTimeout(() => {
      if (onSuccess) {
        onSuccess(formData.age);
      }
    }, 2000);
    }, 1000);
  };

  return (
   <div className="w-full h-full max-w-[100vw] ">
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
        <div className="flex justify-between  mb-8">
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
              {/* First & Last Name */}
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

              {/* Age */}
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

              {/* Sex */}
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

              {/* Languages Spoken */}
              <div className="flex flex-col">
                <label className="font-medium mb-1">Languages Spoken :</label>
                <input
                  type="text"
                  name="languagesSpoken"
                  placeholder="Languages Spoken"
                  value={formData.languagesSpoken}
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                />
              </div>

              {/* Phone Number */}
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
                  pattern="^\+?[0-9]{10,15}$"
                  className="border rounded-lg p-2 w-full"
                />
                <span className="text-xs text-gray-500">
                  We will be sending the report on this number
                </span>
              </div>
            </div>

            {/* Provisional Diagnosis */}
            <div>
              <label className="block font-medium">
                Provisional Diagnosis (if any)
              </label>
              <textarea
                name="provisionalDiagnosis"
                rows="4"
                placeholder=""
                value={formData.provisionalDiagnosis}
                onChange={handleChange}
                className="border resize-none rounded-lg p-2 w-full"
              />
              <span className="text-xs text-gray-500">
                Please mention the past findings if any
              </span>
            </div>

            {/* Brief History */}
            <div>
              <label className="block font-medium">Brief History</label>
              <textarea
                name="briefHistory"
                rows="4"
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
          <div className="space-y-6   w-full bg-white  py-8 px-5 rounded-lg">
            {/* Pre-natal History */}
            <h2 className="text-xl font-semibold text-blue-700">
              Pre-natal History
            </h2>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block font-medium ">
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

            {/* Developmental History */}
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
                      checked={
                        formData.generalDevelopment === "Adequately Achieved"
                      }
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

            {/* Post-natal History */}
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

            {/* Motor Milestones */}
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

            {/* Speech Milestones */}
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
          <div className="space-y-6 w-full bg-white  py-8 px-5 rounded-lg">
            {/* Psychological Evaluation */}
            <h2 className="text-lg font-semibold text-blue-700">
              Psychological Evaluation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Attention Span */}
              <div>
                <label className="font-medium">Attention Span:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="attentionSpan"
                      value="Adequate"
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
                      onChange={handleChange}
                    />{" "}
                    Variable
                  </label>
                </div>
              </div>

              {/* Eye Contact */}
              <div>
                <label className="font-medium">Eye Contact:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="eyeContact"
                      value="Adequate"
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
                      onChange={handleChange}
                    />{" "}
                    Avoidant
                  </label>
                </div>
              </div>

              {/* Imitation Ability */}
              <div>
                <label className="font-medium">Imitation Ability:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="imitationAbility"
                      value="Present"
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
                      onChange={handleChange}
                    />{" "}
                    Partial
                  </label>
                </div>
              </div>

              {/* Social Skills */}
              <div>
                <label className="font-medium">Social Skills:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="socialSkills"
                      value="Adequate"
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
                      onChange={handleChange}
                    />{" "}
                    Inappropriate
                  </label>
                </div>
              </div>

              {/* Self Help Skills */}
              <div>
                <label className="font-medium">Self-Help Skills:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="selfHelpSkills"
                      value="Independent"
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
                      onChange={handleChange}
                    />{" "}
                    Dependent
                  </label>
                </div>
              </div>

              {/* Gross Motor Skills */}
              <div>
                <label className="font-medium">Gross Motor Skills:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="grossMotorSkills"
                      value="Adequate"
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
                      onChange={handleChange}
                    />{" "}
                    Delayed
                  </label>
                </div>
              </div>

              {/* Fine Motor Skills */}
              <div>
                <label className="font-medium">Fine Motor Skills:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="fineMotorSkills"
                      value="Adequate"
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
                      onChange={handleChange}
                    />{" "}
                    Delayed
                  </label>
                </div>
              </div>
            </div>

            {/* Language Evaluation */}
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

            {/* Social Context */}
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
              className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {isSubmitting ? "Submitting.." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
   </div>
  );
}
