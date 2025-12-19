
import React, { useState, useEffect } from 'react';
import { AnalysisResult, ColorInfo, Recommendation } from '../types';
import { ShoppingBag, ChevronRight, Eye, RefreshCw, Loader2, Sparkles, Image as ImageIcon, Layers, Palette, Grid, Zap, Check, Copy, AlertTriangle } from 'lucide-react';
import { visualizeOutfit } from '../services/geminiService';

interface AnalysisViewProps {
  imageSrc: string;
  analysis: AnalysisResult;
  onRestart: () => void;
}

const CopyButton: React.FC<{ value: string; className?: string }> = ({ value, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`group/copy relative flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all active:scale-90 border border-transparent ${className}`}
      title="Copy Hex Code"
    >
      <span className="font-mono uppercase text-[10px] font-bold tracking-tight">{value}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400 group-hover/copy:text-indigo-500" />
      )}
      {copied && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200 z-10 font-bold">
          Copied!
        </span>
      )}
    </button>
  );
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ imageSrc, analysis, onRestart }) => {
  const [displayImage, setDisplayImage] = useState(imageSrc);
  const [visualizingId, setVisualizingId] = useState<string | null>(null);
  const [isOriginal, setIsOriginal] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(analysis.recommendations[0]?.category || '');
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
  const [visError, setVisError] = useState<string | null>(null);

  useEffect(() => {
    if (visualizingId) {
      const heroElement = document.getElementById('hero-section');
      heroElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [visualizingId]);

  const handleVisualize = async (category: string, color: ColorInfo) => {
    const uniqueId = `${category}-${color.name}`;
    setVisualizingId(uniqueId);
    setSelectedColorId(uniqueId);
    setSelectedColor(color);
    setVisError(null);
    
    let colorDetails = color.name;
    if (color.isGradient && color.gradientEndHex) {
      colorDetails = `Ombre Saree transition from ${color.hex} to ${color.gradientEndHex}`;
    } else if (color.tertiaryHex) {
      colorDetails = `Three-color Saree with Body: ${color.hex}, Border: ${color.secondaryHex}, Blouse: ${color.tertiaryHex}`;
    } else if (color.secondaryHex) {
      colorDetails = `Two-color Saree with Body: ${color.hex} and Border: ${color.secondaryHex}`;
    } else {
      colorDetails = `Solid ${color.name} (${color.hex}) Saree`;
    }

    try {
      const editedImage = await visualizeOutfit(imageSrc, colorDetails);
      setDisplayImage(editedImage);
      setIsOriginal(false);
    } catch (error: any) {
      console.error("Visualization failed:", error);
      const isQuota = error.message?.includes('429') || error.status === 429;
      setVisError(isQuota ? "High traffic. Please try again in 1 minute." : "Visualization failed. Please try another color.");
    } finally {
      setVisualizingId(null);
    }
  };

  const toggleOriginal = () => {
    if (isOriginal && displayImage !== imageSrc) {
      setIsOriginal(false);
    } else {
      setIsOriginal(true);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Single')) return <Palette className="w-4 h-4" />;
    if (category.includes('Two')) return <Layers className="w-4 h-4" />;
    if (category.includes('Three')) return <Grid className="w-4 h-4" />;
    if (category.includes('Ombre')) return <Zap className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const activeRecommendation = analysis.recommendations.find(r => r.category === activeTab);

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 pb-40">
      {/* Top Hero Section */}
      <section id="hero-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start bg-white p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative group w-full max-w-md mx-auto lg:max-w-none space-y-4">
          <div className="relative bg-gray-50 p-1 rounded-2xl sm:rounded-3xl overflow-hidden shadow-inner border border-gray-100">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
              <img 
                src={isOriginal ? imageSrc : displayImage} 
                alt="Saree Analysis" 
                className={`w-full h-full object-cover transition-all duration-700 ${visualizingId ? 'opacity-40 scale-105 blur-sm' : 'opacity-100 scale-100'}`}
              />
              
              {visualizingId && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md px-6 text-center">
                  <div className="bg-white/95 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col items-center border border-indigo-50 animate-in zoom-in-95 duration-300 w-full max-w-[280px]">
                    <div className="relative mb-4 sm:mb-6">
                       <Loader2 className="w-10 h-10 sm:w-14 sm:h-14 text-indigo-600 animate-spin" />
                       <Sparkles className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-purple-500 animate-pulse" />
                    </div>
                    <p className="text-base sm:text-lg font-black text-gray-900 tracking-tight">AI Draping...</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">Applying Silk Crepe Texture</p>
                  </div>
                </div>
              )}

              {!visualizingId && displayImage !== imageSrc && (
                <button 
                  onClick={toggleOriginal}
                  className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md border border-gray-200 text-gray-800 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 hover:bg-white active:scale-95 transition-all z-10"
                >
                  {isOriginal ? <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> : <ImageIcon className="w-3.5 h-3.5 text-gray-500" />}
                  {isOriginal ? 'View AI Try-On' : 'View Original'}
                </button>
              )}
            </div>
          </div>

          {visError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4" />
              {visError}
            </div>
          )}

          {!isOriginal && selectedColor && !visError && (
            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Active Pure Silk Palette</span>
                <span className="text-[10px] font-bold text-indigo-600 px-2 py-0.5 bg-white rounded-full border border-indigo-100 shadow-sm">{selectedColor.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-indigo-50 shadow-sm">
                   <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: selectedColor.hex }}></div>
                   <CopyButton value={selectedColor.hex} className="bg-gray-50" />
                </div>
                {selectedColor.gradientEndHex && (
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-indigo-50 shadow-sm">
                    <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: selectedColor.gradientEndHex }}></div>
                    <CopyButton value={selectedColor.gradientEndHex} className="bg-indigo-50 text-indigo-600" />
                  </div>
                )}
                {selectedColor.secondaryHex && (
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-indigo-50 shadow-sm">
                    <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: selectedColor.secondaryHex }}></div>
                    <CopyButton value={selectedColor.secondaryHex} className="bg-purple-50 text-purple-600" />
                  </div>
                )}
                {selectedColor.tertiaryHex && (
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-indigo-50 shadow-sm">
                    <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: selectedColor.tertiaryHex }}></div>
                    <CopyButton value={selectedColor.tertiaryHex} className="bg-pink-50 text-pink-600" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5 sm:space-y-8">
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
              <Sparkles className="w-3 h-3" />
              AI Boutique Analysis
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
              Radiant in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{analysis.seasonalPalette}</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed font-medium italic border-l-0 lg:border-l-4 border-indigo-100 px-2 lg:pl-4 lg:py-1">
              "{analysis.description}"
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
             {[
               { label: 'Skin', color: analysis.skinTone },
               { label: 'Hair', color: analysis.hairColor },
               { label: 'Eyes', color: analysis.eyeColor }
             ].map((item, idx) => (
                <div key={idx} className="bg-gray-50/50 p-2 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 border border-gray-100 shadow-sm transition-transform active:scale-95">
                  <div 
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden" 
                    style={{ backgroundColor: item.color.hex }}
                  />
                  <div className="text-center w-full overflow-hidden">
                    <span className="block text-[9px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">{item.label}</span>
                    <span className="block text-[10px] sm:text-[11px] font-bold text-gray-800 truncate px-1">{item.color.name}</span>
                    <CopyButton value={item.color.hex} className="text-gray-400 bg-white/80 mt-1 mx-auto" />
                  </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Tabs and Collections */}
      <section className="space-y-6 sm:space-y-10">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Saree Collections</h2>
          
          <div className="w-full flex overflow-x-auto pb-4 gap-2 no-scrollbar px-1 snap-x">
            {analysis.recommendations.map((rec) => (
              <button
                key={rec.category}
                onClick={() => setActiveTab(rec.category)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all snap-start shadow-sm active:scale-95 ${
                  activeTab === rec.category 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {getCategoryIcon(rec.category)}
                {rec.category.replace(' Saree', '')}
              </button>
            ))}
          </div>
        </div>

        {activeRecommendation && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  {getCategoryIcon(activeRecommendation.category)}
                </span>
                {activeRecommendation.category}
              </h3>
              <p className="text-gray-500 mt-3 font-medium text-xs sm:text-sm leading-relaxed max-w-2xl">{activeRecommendation.why}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {activeRecommendation.colors.map((color, ci) => {
                const uniqueId = `${activeRecommendation.category}-${color.name}`;
                const isSelected = selectedColorId === uniqueId;
                
                return (
                  <div 
                    key={ci} 
                    className={`bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 border transition-all flex flex-col h-full ${
                      isSelected 
                      ? 'border-indigo-600 ring-4 ring-indigo-600/5 shadow-xl' 
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100'
                    }`}
                  >
                    <div 
                      className="w-full aspect-[4/3] rounded-xl sm:rounded-2xl shadow-inner mb-3 sm:mb-4 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform" 
                      style={color.isGradient ? {
                        background: `linear-gradient(135deg, ${color.hex} 0%, ${color.gradientEndHex || '#ffffff'} 100%)`
                      } : {
                        backgroundColor: color.hex
                      }}
                      onClick={() => handleVisualize(activeRecommendation.category, color)}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white text-indigo-600 p-1 rounded-full shadow-lg animate-in zoom-in duration-300">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <Eye className="text-white w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="flex-grow space-y-3">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-xs sm:text-sm truncate mb-1">{color.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          <CopyButton value={color.hex} className="bg-gray-50 text-gray-500 hover:text-indigo-600" />
                          {color.gradientEndHex && <CopyButton value={color.gradientEndHex} className="bg-indigo-50 text-indigo-600" />}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 leading-snug line-clamp-2 italic font-medium">"{color.description}"</p>
                    </div>

                    <button 
                      onClick={() => handleVisualize(activeRecommendation.category, color)}
                      disabled={!!visualizingId}
                      className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95 ${
                        isSelected 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-gray-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {visualizingId === uniqueId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                      {isSelected ? 'Preview Active' : 'Select & Try'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Fixed Bottom Controls */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200/60 p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] flex justify-between items-center z-50 shadow-2xl shadow-indigo-200/40 safe-bottom-margin ring-1 ring-black/5">
        <button 
          onClick={onRestart}
          className="text-gray-500 font-bold hover:text-indigo-600 transition-colors px-3 sm:px-5 py-3 flex items-center gap-2 rounded-xl sm:rounded-2xl hover:bg-indigo-50 active:scale-90"
        >
          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm">New Saree Scan</span>
        </button>
        
        <div className="h-10 w-[1px] bg-gray-100 mx-1 hidden sm:block"></div>

        <button 
          onClick={() => alert("Redirecting to your personalized Shopify Saree Collection...")}
          className="bg-indigo-600 text-white px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 hover:bg-indigo-700 active:scale-[0.96] transition-all shadow-xl shadow-indigo-600/20"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="whitespace-nowrap">Shop Collection</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default AnalysisView;
