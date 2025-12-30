import React, { useRef, useState } from 'react';
import { Upload, FileImage, FileType, AlertCircle, Loader2 } from 'lucide-react';

interface StepUploadProps {
  title: string;
  description: string;
  accept: string;
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

const StepUpload: React.FC<StepUploadProps> = ({ title, description, accept, onFileSelect, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-industrial-800 rounded-xl shadow-2xl border border-industrial-700 p-8 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 font-mono">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </div>

      <div
        className={`relative group rounded border-2 border-dashed transition-all duration-300 ease-in-out p-12 flex flex-col items-center justify-center cursor-pointer ${dragActive
            ? 'border-industrial-orange bg-industrial-orange/10'
            : 'border-industrial-700 hover:border-industrial-orange/50 hover:bg-industrial-900'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-industrial-orange animate-spin mb-4" />
            <p className="text-lg font-medium text-industrial-orange font-mono">Processing Document...</p>
            <p className="text-sm text-slate-400 mt-1">Initializing extraction protocols...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-industrial-900 border border-industrial-700 text-industrial-orange rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-industrial-orange transition-all duration-300 shadow-lg">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-slate-200 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500 font-mono">
              Supported files: {accept.replace(/\./g, ' ').toUpperCase()}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <FileImage className="w-4 h-4 text-industrial-orange" />
          <span>High Definition</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileType className="w-4 h-4 text-industrial-orange" />
          <span>Smart Detection</span>
        </div>
      </div>

      {accept.includes('pdf') && (
        <div className="mt-4 p-4 bg-industrial-900 border border-industrial-700 text-slate-300 rounded text-sm flex items-start text-left">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-industrial-orange" />
          <p>Ensure PDF is a <strong>Fillable Form</strong> for extraction protocols to function correctly.</p>
        </div>
      )}
    </div>
  );
};

export default StepUpload;