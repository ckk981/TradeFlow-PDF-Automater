import React, { useState } from 'react';
import { Download, Printer, FileText, Image as ImageIcon, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { convertPdfToJpg } from '../services/renderService';

interface GeneratedFile {
  name: string;
  url: string;
}

interface StepPreviewProps {
  files: GeneratedFile[];
  onReset: () => void;
}

const StepPreview: React.FC<StepPreviewProps> = ({ files, onReset }) => {
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  const handlePrint = (file: GeneratedFile) => {
    // Open PDF in new tab - this is the most reliable way to trigger browser print for PDFs
    const printWindow = window.open(file.url, '_blank');
    if (printWindow) {
      // Attempt to print automatically if not blocked
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleDownloadPdf = (file: GeneratedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJpg = async (file: GeneratedFile) => {
    setProcessingFile(file.name);
    try {
      const jpgDataUrl = await convertPdfToJpg(file.url);
      const link = document.createElement('a');
      link.href = jpgDataUrl;
      link.download = file.name.replace('.pdf', '.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to convert PDF to Image. Please try downloading the PDF instead.");
    } finally {
      setProcessingFile(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="bg-industrial-800 border border-industrial-700 p-4 rounded-full inline-block mb-4 shadow-xl">
          <CheckCircle className="w-12 h-12 text-industrial-orange" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-tight">Documents Ready!</h2>
        <p className="text-slate-400 font-mono">
          Your extracted data has been successfully applied to {files.length} document{files.length !== 1 && 's'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {files.map((file, idx) => (
          <div key={idx} className="bg-industrial-900 rounded-xl shadow-2xl border border-industrial-700 overflow-hidden hover:border-industrial-orange/50 transition-colors group">
            <div className="bg-industrial-800 p-4 border-b border-industrial-700 flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="bg-industrial-700 p-2 rounded shrink-0">
                  <FileText className="w-5 h-5 text-industrial-orange" />
                </div>
                <span className="font-semibold text-white truncate font-mono" title={file.name}>{file.name}</span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => handlePrint(file)}
                className="w-full flex items-center justify-center space-x-2 bg-industrial-orange hover:bg-orange-600 text-white py-2.5 rounded font-medium transition-colors font-mono uppercase tracking-wide shadow-lg shadow-orange-900/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownloadPdf(file)}
                  className="flex items-center justify-center space-x-2 border border-industrial-600 hover:border-industrial-orange hover:bg-industrial-800 text-slate-300 hover:text-white py-2 rounded text-sm font-medium transition-all font-mono"
                >
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-red-400 decoration-slice" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDownloadJpg(file)}
                  disabled={processingFile === file.name}
                  className="flex items-center justify-center space-x-2 border border-industrial-600 hover:border-industrial-orange hover:bg-industrial-800 text-slate-300 hover:text-white py-2 rounded text-sm font-medium transition-all font-mono"
                >
                  {processingFile === file.name ? (
                    <Loader2 className="w-4 h-4 animate-spin text-industrial-orange" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                  )}
                  <span>JPG</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-500 hover:text-white px-6 py-3 rounded font-medium transition-colors font-mono"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Process New Documents</span>
        </button>
      </div>
    </div>
  );
};

export default StepPreview;