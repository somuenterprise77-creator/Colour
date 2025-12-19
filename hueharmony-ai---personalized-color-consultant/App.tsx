
import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageCropper from './components/ImageCropper';
import AnalysisView from './components/AnalysisView';
import { analyzeImage } from './services/geminiService';
import { AppStep, AnalysisResult } from './types';
import { Loader2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (dataUrl: string) => {
    setRawImage(dataUrl);
    setStep(AppStep.CROP);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCropped = async (dataUrl: string) => {
    setCroppedImage(dataUrl);
    setStep(AppStep.ANALYZE);
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const result = await analyzeImage(dataUrl);
      setAnalysis(result);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setError("AI Analysis encountered an issue. Please try a clearer photo.");
      setStep(AppStep.UPLOAD);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(AppStep.UPLOAD);
    setRawImage(null);
    setCroppedImage(null);
    setAnalysis(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFF]">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6 lg:p-10">
        {step === AppStep.UPLOAD && (
          <div className="text-center w-full max-w-3xl mx-auto py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">
              Perfect Saree <br className="hidden sm:block"/> <span className="text-indigo-600">Color Finder</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mb-10 max-w-lg mx-auto font-medium leading-relaxed px-4">
              Upload a selfie to instantly discover pure silk crepe saree shades tailored to your unique skin tone and features.
            </p>
            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 max-w-md mx-auto text-sm font-bold animate-pulse">
                {error}
              </div>
            )}
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>
        )}

        {step === AppStep.CROP && rawImage && (
          <div className="w-full animate-in fade-in zoom-in duration-500">
            <ImageCropper 
              imageSrc={rawImage} 
              onCropped={handleCropped} 
              onCancel={reset} 
            />
          </div>
        )}

        {step === AppStep.ANALYZE && (
          <div className="text-center py-20 px-6 max-w-md mx-auto w-full">
            <div className="mb-10 relative inline-block">
               <div className="absolute -inset-6 bg-indigo-500/10 rounded-full animate-pulse"></div>
               <div className="absolute -inset-10 bg-indigo-500/5 rounded-full animate-ping duration-1000"></div>
               <div className="relative bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-gray-100">
                 <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600 animate-spin" />
               </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 tracking-tight">AI Stylist at Work</h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed">
              Analyzing your features to curate a bespoke collection of pure silk crepe sarees...
            </p>
            {croppedImage && (
              <div className="mt-12 max-w-[200px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl opacity-60 grayscale ring-4 ring-white transition-all duration-1000">
                <img src={croppedImage} alt="Analyzing" className="w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {step === AppStep.RESULT && analysis && croppedImage && (
          <div className="w-full animate-in fade-in duration-1000">
            <AnalysisView 
              imageSrc={croppedImage} 
              analysis={analysis} 
              onRestart={reset} 
            />
          </div>
        )}
      </main>

      <footer className="py-8 text-center border-t bg-white safe-bottom">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} HueHarmony AI Boutique
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-300">
            <span>PRIVACY FIRST</span>
            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
            <span>PURE SILK CREPE CATALOG</span>
            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
            <span>SHOPIFY COMPATIBLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
