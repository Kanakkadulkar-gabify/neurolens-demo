// src/App.js
import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import ScreeningScreen from './components/ScreeningScreen';
import CompletionScreen from './components/CompletionScreen';

export default function App() {
    const [screen, setScreen] = useState('start'); // start, screening, completion
    const [age, setAge] = useState(null);
    const [screeningData, setScreeningData] = useState(null);

    const handleStartScreening = (selectedAge) => {
        setAge(selectedAge);
        setScreen('screening');
    };

    const handleScreeningComplete = (blob, activities) => {
        setScreeningData({ blob, activities });
        setScreen('completion');
    };
    
    const handleRestart = () => {
        setScreen('start');
        setAge(null);
        setScreeningData(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex items-center justify-center min-h-screen">
            {screen === 'start' && <StartScreen onStart={handleStartScreening} />}
            {screen === 'screening' && <ScreeningScreen age={age} onComplete={handleScreeningComplete} />}
            {screen === 'completion' && <CompletionScreen {...screeningData} age={age} onRestart={handleRestart} />}
        </div>
    );
}
