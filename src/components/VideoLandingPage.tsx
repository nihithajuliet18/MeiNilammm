import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Play, X, Shield, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { INTRO_VIDEO_URL } from '../config';

interface VideoLandingPageProps {
  onEnter: (scenarioId?: number) => void;
  onClose?: () => void;
}

export const VideoLandingPage: React.FC<VideoLandingPageProps> = ({ onEnter, onClose }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
  };

  const handleAction = (action: () => void) => {
    stopVideo();
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold font-tamil">
              மெ
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-tamil">மெய்நிலம் • MeiNilam</h2>
              <p className="text-[11px] text-slate-400">AI-Assisted Land Governance & Geospatial Verification</p>
            </div>
          </div>
          <button
            onClick={() => handleAction(onClose || onEnter)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Stage */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 text-white">
              <AlertCircle className="w-12 h-12 text-rose-500" />
              <p>{t('error_video_load_failed') || 'Unable to load video'}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setHasError(false); setIsLoading(true); videoRef.current?.load(); }}
                  className="px-4 py-2 bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
                <button 
                  onClick={() => handleAction(onEnter)}
                  className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-semibold"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={INTRO_VIDEO_URL}
            autoPlay
            muted
            playsInline
            controls
            className={`w-full h-full object-contain ${hasError ? 'hidden' : ''}`}
            onLoadedData={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
          />
        </div>

        {/* Action bar */}
        <div className="p-4 sm:p-6 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Multi-Department Cadastral Cross-Verification Engine • Govt of Tamil Nadu</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleAction(onEnter)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg transition-all"
            >
              <span>Enter MeiNilam Platform →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
