import React from 'react';
import { Wrench, FileText, CheckCircle, ChevronRight, LayoutGrid } from 'lucide-react';
import { AppStep } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: AppStep;
}

const Layout: React.FC<LayoutProps> = ({ children, currentStep }) => {
  const steps = [
    { id: AppStep.UPLOAD_SOURCE, label: 'Source', icon: FileText },
    { id: AppStep.UPLOAD_TEMPLATE, label: 'Template', icon: FileText },
    { id: AppStep.MAPPING, label: 'Map & Review', icon: Wrench },
    { id: AppStep.PREVIEW, label: 'Finish', icon: CheckCircle },
  ];

  const showProgress = currentStep !== AppStep.TEMPLATE_MANAGER;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TradeFlow Automator</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-blue-200">
            <span>Powered by Gemini</span>
          </div>
        </div>
      </header>

      {/* Progress Bar (Conditional) */}
      {showProgress && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto py-8 px-4">
            <nav aria-label="Progress">
              <ol role="list" className="flex w-full">
                {steps.map((step, stepIdx) => {
                  const isCurrent = step.id === currentStep;
                  const isCompleted = steps.findIndex(s => s.id === currentStep) > stepIdx;
                  
                  return (
                    <li key={step.label} className="relative flex flex-col items-center flex-1">
                      {/* Label above */}
                      <span className={`text-xs font-bold uppercase tracking-wider mb-3 transition-colors duration-200 ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>

                      {/* Line & Circle */}
                      <div className="relative flex items-center justify-center w-full">
                        {/* Connecting Line */}
                        {stepIdx !== steps.length - 1 && (
                          <div className="absolute left-1/2 top-1/2 w-full h-[2px] -translate-y-1/2 bg-slate-200">
                             <div 
                                className={`h-full transition-all duration-500 ease-in-out ${isCompleted ? 'bg-blue-600' : 'bg-transparent'}`} 
                                style={{width: '100%'}} 
                             />
                          </div>
                        )}

                        {/* Step Circle */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                            isCompleted || isCurrent 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-100' 
                              : 'bg-white border-slate-300 text-slate-400 scale-90'
                          }`}
                        >
                          <step.icon className="w-5 h-5" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      )}
      
      {/* Template Manager Header */}
      {!showProgress && (
         <div className="bg-slate-900 text-white border-b border-slate-800">
            <div className="max-w-7xl mx-auto py-4 px-4 flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Template Library</span>
            </div>
         </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} TradeFlow Solutions</p>
          <p>Privacy & Terms</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;