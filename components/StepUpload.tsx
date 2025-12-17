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
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600">{description}</p>
      </div>

      <div
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 ease-in-out p-12 flex flex-col items-center justify-center cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
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
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-blue-700">Analyzing Document...</p>
            <p className="text-sm text-blue-500 mt-1">Extracting data with Gemini AI</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-slate-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-400">
              Supported files: {accept.replace(/\./g, ' ').toUpperCase()}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <FileImage className="w-4 h-4" />
          <span>High Quality Extraction</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileType className="w-4 h-4" />
          <span>Smart Form Matching</span>
        </div>
      </div>
      
      {accept.includes('pdf') && (
        <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm flex items-start text-left">
           <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
           <p>Make sure your PDF is a <strong>Fillable Form</strong>. Standard "flat" PDFs cannot be automatically filled without advanced OCR overlay.</p>
        </div>
      )}
    </div>
  );
};

export default StepUpload;