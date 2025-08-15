import React, { useState } from 'react';
import { PlayCircleIcon } from './Icons';

function StartScreen({ onStart }) {
    const [age, setAge] = useState('');
    const [error, setError] = useState('');

    const handleStart = () => {
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 0) {
            setError("Please enter a valid age.");
        } else {
            setError('');
            onStart(ageNum);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gabify Screening</h1>
            <p className="text-slate-600 mb-6">A 4-minute interactive screening with real images and voice prompts.</p>
            <div className="space-y-4">
                <label htmlFor="age-input" className="block text-sm font-medium text-slate-700">Please enter the patient's age:</label>
                <input type="number" id="age-input" value={age} onChange={e => setAge(e.target.value)} min="0" max="120" placeholder="e.g., 4" className="w-full max-w-xs mx-auto px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                <button onClick={handleStart} className="w-full max-w-xs mx-auto bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
                    <PlayCircleIcon /> Start Screening
                </button>
            </div>
            {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
        </div>
    );
}

export default StartScreen;
