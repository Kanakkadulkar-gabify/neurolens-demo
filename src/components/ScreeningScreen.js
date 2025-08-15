import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/gemini';
import { getAgeSlab } from '../utils/helpers';
import { Spinner, MicIcon, ArrowRightCircleIcon } from './Icons';

const SCREENING_DURATION = 240; // 4 minutes max

function ScreeningScreen({ age, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(SCREENING_DURATION);
    const [activities, setActivities] = useState([]);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [status, setStatus] = useState('initializing');
    const [imageUrl, setImageUrl] = useState('');
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    useEffect(() => {
        const setup = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
                mediaRecorderRef.current.onstop = () => onComplete(new Blob(recordedChunksRef.current, { type: 'video/webm' }), activities);
                
                setStatus('generating');
                const fetchedActivities = await api.fetchActivities(getAgeSlab(age));
                setActivities(fetchedActivities);
                setStatus('active');
            } catch (err) {
                alert("Could not access camera/microphone. Please check permissions and try again.");
                window.location.reload();
            }
        };
        setup();
        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [age, onComplete]);

    useEffect(() => {
        if (status === 'active' && activities.length > 0) {
            mediaRecorderRef.current.start();
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, activities]);

    useEffect(() => {
        if (status === 'active' && currentActivityIndex < activities.length) {
            const updateActivity = async () => {
                const activity = activities[currentActivityIndex];
                setImageUrl('');
                const newImageUrl = await api.generateImage(activity.image_query);
                setImageUrl(newImageUrl);
                await api.speakText(activity.prompt_text);
            };
            updateActivity();
        }
    }, [status, currentActivityIndex, activities]);
    
    const handleNextTask = () => {
        if (currentActivityIndex < activities.length - 1) {
            setCurrentActivityIndex(prev => prev + 1);
        } else {
            if (mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const currentActivity = activities[currentActivityIndex];
    const isSpeakingTask = currentActivity?.task_type === 'verbal' || currentActivity?.task_type === 'reasoning';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-semibold">REC</span>
                </div>
                <div className="text-lg font-mono bg-slate-100 px-3 py-1 rounded-md text-slate-700">{formatTime(timeLeft)}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 w-full aspect-video bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden border-4 border-slate-200">
                    {status !== 'active' || !imageUrl ? <Spinner /> : <img src={imageUrl} alt="Activity" className="w-full h-full object-contain" />}
                </div>
                <div className="flex flex-col justify-between bg-indigo-50 p-4 rounded-lg">
                    <div>
                        {isSpeakingTask && <div className="flex items-center gap-2 mb-2"><MicIcon /><span className="text-sm font-semibold text-indigo-700">Speaking Task</span></div>}
                        <p className="text-indigo-800 font-medium text-xl flex-1">{currentActivity?.prompt_text || 'Getting ready...'}</p>
                    </div>
                    <div className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden mt-4 shadow-inner">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted></video>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button onClick={handleNextTask} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2">
                    {currentActivityIndex < activities.length - 1 ? 'Next Task' : 'Finish Screening'}
                    <ArrowRightCircleIcon />
                </button>
            </div>
        </div>
    );
}

export default ScreeningScreen;