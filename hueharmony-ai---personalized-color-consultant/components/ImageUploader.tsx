
import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelected(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1024 },
          height: { ideal: 1024 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      
      onImageSelected(dataUrl);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      {!showCamera ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={startCamera}
            className="flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-[2rem] hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group active:scale-[0.97] bg-white"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
            <span className="text-lg font-black text-gray-900 tracking-tight">Take a Selfie</span>
            <span className="text-xs text-gray-400 mt-2 text-center font-medium leading-relaxed">Use your camera for a<br/>real-time color match</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-[2rem] hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group active:scale-[0.97] bg-white"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <span className="text-lg font-black text-gray-900 tracking-tight">Upload Photo</span>
            <span className="text-xs text-gray-400 mt-2 text-center font-medium leading-relaxed">Select a portrait from<br/>your photo library</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </button>
        </div>
      ) : (
        <div className="relative bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-square sm:aspect-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
            <button
              onClick={closeCamera}
              className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 active:scale-90 transition-all border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-full hover:scale-105 active:scale-90 transition-all flex items-center justify-center shadow-2xl"
            >
              <div className="w-full h-full border-4 border-gray-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-full shadow-inner"></div>
              </div>
            </button>
            <div className="w-14"></div>
          </div>
        </div>
      )}
      <div className="mt-8 text-center px-4">
        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-[0.15em] mb-1">Photography Tip</p>
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">For best results, face a natural light source (like a window). Avoid harsh overhead lights or filters.</p>
      </div>
    </div>
  );
};

export default ImageUploader;
