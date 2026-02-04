import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, Volume2, Home, Phone, Pause, Play } from "lucide-react";
import { useAccessibility } from "@/app/contexts/accessibility-context";

interface EmergencyGuidanceProps {
  onBack: () => void;
}

export function EmergencyGuidance({ onBack }: EmergencyGuidanceProps) {
  const { settings } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on mount
  const [currentStep, setCurrentStep] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const guidanceSteps = [
    "Stay calm. Help is on the way.",
    "Find a safe place. If possible, move to a safe location and sit down.",
    "Stay on the line. Emergency services may call you. Keep your phone nearby.",
    "Breathe deeply. Take slow, deep breaths to stay calm.",
    "Emergency services have been dispatched. Estimated arrival: 8 to 12 minutes."
  ];

  // Auto-play on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speakStep(0);
    }

    return () => {
      // Cleanup: stop speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      // Pause
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Play
      setCurrentStep(0);
      setIsPlaying(true);
      speakStep(0);
    }
  };

  const speakStep = (stepIndex: number) => {
    if (stepIndex >= guidanceSteps.length) {
      setIsPlaying(false);
      setCurrentStep(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(guidanceSteps[stepIndex]);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      // Wait 1 second before next step
      setTimeout(() => {
        if (stepIndex < guidanceSteps.length - 1) {
          setCurrentStep(stepIndex + 1);
          speakStep(stepIndex + 1);
        } else {
          setIsPlaying(false);
          setCurrentStep(0);
        }
      }, 1000);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentStep(0);
    };

    utteranceRef.current = utterance;
    setCurrentStep(stepIndex);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#EDF2F7]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Emergency Guidance</h1>
      </div>

      <div className="max-w-md mx-auto p-4 pb-24">
        {/* Stay Calm Card */}
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-400 mb-4">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-600" fill="#3B82F6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Stay Calm</h2>
          <p className="text-blue-600 font-medium text-center text-sm">Help is on the way</p>
        </div>

        {/* Voice Guidance */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm">Voice Guidance</h3>
            <Volume2 className="w-5 h-5 text-blue-600" />
          </div>

          <button
            onClick={handlePlayPause}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3"
          >
            {isPlaying ? (
              <>
                <div className="flex gap-1">
                  <span className="w-0.5 h-4 bg-white rounded-full"></span>
                  <span className="w-0.5 h-4 bg-white rounded-full"></span>
                  <span className="w-0.5 h-4 bg-white rounded-full"></span>
                </div>
                Pause Voice Guidance
              </>
            ) : (
              <>
                <Play className="w-4 h-4" fill="white" />
                Play Voice Guidance
              </>
            )}
          </button>

          {/* Now Playing */}
          {isPlaying && (
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Now playing:</p>
              <p className="text-sm text-gray-900 font-bold">{guidanceSteps[currentStep]}</p>
            </div>
          )}
        </div>

        {/* Guidance Steps */}
        <div className="space-y-4 mb-6">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-base mb-1">Find a Safe Place</h3>
              <p className="text-sm text-blue-600 mb-2 leading-relaxed">
                If possible, move to a safe location and sit down
              </p>
              <Home className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-base mb-1">Stay on the Line</h3>
              <p className="text-sm text-blue-600 mb-2 leading-relaxed">
                Emergency services may call you. Keep your phone nearby
              </p>
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-base mb-1">Breathe Deeply</h3>
              <p className="text-sm text-blue-600 mb-2 leading-relaxed">
                Take slow, deep breaths to stay calm
              </p>
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Emergency Dispatched */}
        <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-200">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">
            Emergency services have been dispatched
          </h3>
          <p className="text-sm text-gray-600">Estimated arrival: 8-12 minutes</p>
        </div>
      </div>
    </div>
  );
}