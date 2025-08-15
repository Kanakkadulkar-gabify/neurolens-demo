import React, { useState } from 'react';
import { api } from '../api/gemini';
import { CheckCircleIcon, Spinner } from './Icons';

function CompletionScreen({ blob, activities, age, onRestart }) {
    const [report, setReport] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const downloadUrl = blob ? URL.createObjectURL(blob) : null;

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        const markdownReport = await api.generateReport(age, activities);
        const htmlReport = markdownReport
            .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
            .replace(/(\n- .*)+/g, (match) => `<ul>${match.replace(/\n- /g, '<li>')}</ul>`)
            .replace(/\n/g, '<br />');
        setReport(htmlReport);
        setIsGenerating(false);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full">
            <CheckCircleIcon />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Screening Complete!</h2>
            <p className="text-slate-600 mb-6">Your recording has been successfully saved.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                {downloadUrl && <a href={downloadUrl} download={`gabify-screening-${new Date().toISOString()}.webm`} className="inline-block bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-700">Download Recording</a>}
                <button onClick={handleGenerateReport} disabled={isGenerating} className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                    {isGenerating ? <Spinner /> : '✨ Generate Summary Report'}
                </button>
            </div>
             <button onClick={onRestart} className="text-indigo-600 hover:underline mt-4">Start New Screening</button>
            {report && (
                <div className="mt-6 text-left p-6 border border-slate-200 rounded-lg bg-slate-50" dangerouslySetInnerHTML={{ __html: report }}></div>
            )}
        </div>
    );
}

export default CompletionScreen;