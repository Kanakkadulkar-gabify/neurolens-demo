// src/App.js
import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import ScreeningScreen from './components/ScreeningScreen';
import CompletionScreen from './components/CompletionScreen';

import Options from './components/UserOptions';
import EvaluationForm from './components/Form';

export default function App() {
    const [screen, setScreen] = useState("form"); // start, screening, completion
    const [age, setAge] = useState(null);
    const [screeningData, setScreeningData] = useState(null);
    
    const handleFormSubmit = (selectedAge) => {
        setAge(selectedAge);
        setScreen("options");
  };

    const handleStartScreening = (selectedAge) => {
        setAge(selectedAge);
        setScreen('screening');
    };

    const handleScreeningComplete = (blob, activities) => {
        setScreeningData({ blob, activities });

        setScreen('completion');
    };
    
    const handleRestart = () => {
        setScreen('form');
        setAge(null);
        setScreeningData(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex items-center justify-center min-h-screen">
            {/* {screen === 'start' && <StartScreen onStart={handleStartScreening} />}
            {screen === 'screening' && <ScreeningScreen age={age} onComplete={handleScreeningComplete} />}
            {screen === 'completion' && <CompletionScreen {...screeningData} age={age} onRestart={handleRestart} />}
          */}
        { screen ==="form"&&  <EvaluationForm  onSuccess={handleFormSubmit}/>}
        {screen ==="options" && <Options setScreen={setScreen}/>}
        {screen === 'screening' && <ScreeningScreen age={age} onComplete={handleScreeningComplete} />}
        {screen === 'completion' && <CompletionScreen {...screeningData} age={age} onRestart={handleRestart} />}
        </div>
    );
}
