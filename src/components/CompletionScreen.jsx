import React, { useState } from 'react';
import { api } from '../api/gemini';
import { CheckCircleIcon, Spinner } from '../utils/icons';
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-10 rounded-3xl shadow-xl text-center w-full max-w-4xl mx-auto transition-all duration-500">
      {/* Success Icon */}
      <div className="flex flex-col items-center">
        <CheckCircleIcon className="w-16 h-16 text-violet-600 mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Screening Complete!
        </h2>
        <p className="text-slate-600 mb-8">
          Your recording has been successfully saved.
        </p>
      </div>

      {/* Buttons & Report Section */}
      <div
        className={`relative transition-all duration-500 ${
          report ? "mb-8" : "mb-0"
        }`}
      >
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: report ? -20 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center mx-auto max-w-3xl"
        >
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`gabify-screening-${new Date().toISOString()}.webm`}
              className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
            >
              ⬇️ Download Recording
            </a>
          )}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300 disabled:from-violet-300 disabled:to-fuchsia-300"
          >
            {isGenerating ? <Spinner /> : "✨ Generate Summary Report"}
          </button>
        </motion.div>

        {/* Animated Report Section */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="mt-10 text-left p-6 border border-violet-200 rounded-2xl bg-white shadow-md"
              dangerouslySetInnerHTML={{ __html: report }}
            ></motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="text-violet-600 hover:underline mt-6 font-medium"
      >
        🔄 Start New Screening
      </button>
    </div>
    );
}

export default CompletionScreen;