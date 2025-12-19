
import React, { useState, useRef, useEffect } from 'react';
import { Check, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropped: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropped, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Simplified "Cropper" - In this version we just show the image 
  // and allow the user to confirm they want to use this image.
  // Real cropping with drag/resize can be very complex; 
  // here we ensure the image is fit into a square aspect ratio for Gemini.
  
  const handleConfirm = () => {
    if (!canvasRef.current || !imgRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We take a central square from the image
    const size = Math.min(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
    const startX = (imgRef.current.naturalWidth - size) / 2;
    const startY = (imgRef.current.naturalHeight - size) / 2;

    canvas.width = 512;
    canvas.height = 512;
    ctx.drawImage(imgRef.current, startX, startY, size, size, 0, 0, 512, 512);
    
    onCropped(canvas.toDataURL('image/jpeg', 0.8));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Your Photo</h2>
      <p className="text-gray-500 mb-6 text-center">We'll use a centered square of this photo for the analysis.</p>
      
      <div className="relative border-4 border-indigo-100 rounded-2xl overflow-hidden shadow-lg bg-gray-100 mb-8">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Original"
          onLoad={() => setIsReady(true)}
          className="max-h-[60vh] object-contain"
        />
        {/* Simple square overlay to show what will be analyzed */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-white border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] w-full max-w-xs aspect-square"></div>
        </div>
      </div>

      <div className="flex gap-4 w-full justify-center">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Retry
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isReady}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <Check className="w-5 h-5" />
          Analyze My Colors
        </button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
