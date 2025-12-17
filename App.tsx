import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import Layout from './components/Layout';
import StepUpload from './components/StepUpload';
import StepMapping from './components/StepMapping';
import StepTemplateSelection from './components/StepTemplateSelection';
import StepPreview from './components/StepPreview';
import { extractDataFromDocument, smartMapFields } from './services/geminiService';
import { getPdfFields, autoMapFields, fillPdf } from './services/pdfService';
import { saveTemplateSettings } from './services/storageService';
import { generateFilename, DEFAULT_PATTERN } from './services/filenameService';
import { AppStep, ExtractedData, SelectedTemplate, TemplateConfig, FieldMapping } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_SOURCE);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMime, setSourceMime] = useState<string>('');
  const [sourceFileName, setSourceFileName] = useState<string>('');
  
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isMapping, setIsMapping] = useState(false);

  // Updated state for multiple templates
  const [templateConfigs, setTemplateConfigs] = useState<TemplateConfig[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<{name: string, url: string}[]>([]);

  // STEP 1: Handle Source Document Upload
  const handleSourceUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSourceImage(base64);
      setSourceMime(file.type);
      setSourceFileName(file.name);
      
      setIsExtracting(true);
      try {
        const data = await extractDataFromDocument(base64, file.type);
        setExtractedData(data);
        setStep(AppStep.UPLOAD_TEMPLATE);
      } catch (error) {
        alert("Failed to extract data. Please ensure the file is clear and legible.");
        console.error(error);
        setSourceImage(null);
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // STEP 2: Handle Multiple Template Selection
  const handleTemplatesSelect = async (templates: SelectedTemplate[]) => {
    setIsMapping(true);

    try {
      const configs: TemplateConfig[] = [];
      const dataKeys = extractedData ? Object.keys(extractedData) : [];

      // Process each template sequentially (could be parallelized but safer sequential for UI/AI rate limits)
      for (const t of templates) {
         // 1. Get Fields
         const fields = await getPdfFields(t.bytes);
         
         // 2. Map Fields
         let mappings: FieldMapping[] = [];
         
         // Check for saved mappings first
         if (t.savedMappings && t.savedMappings.length > 0) {
            mappings = t.savedMappings;
         } else if (extractedData) {
            // Try Smart Match
            mappings = await smartMapFields(fields.map(f => f.name), dataKeys);
            
            // Fallback
            if (!mappings || mappings.length === 0) {
              mappings = autoMapFields(fields, dataKeys);
            }
         }

         configs.push({
           template: t,
           fields: fields,
           initialMappings: mappings,
           filenamePattern: t.filenamePattern || DEFAULT_PATTERN
         });
      }

      setTemplateConfigs(configs);
      setStep(AppStep.MAPPING);
    } catch (error) {
       console.error(error);
       alert("Error processing templates.");
    } finally {
      setIsMapping(false);
    }
  };

  // STEP 3: Handle Generation of Multiple PDFs
  const handleGeneration = async (
      allMappings: Record<string, FieldMapping[]>, 
      finalData: ExtractedData,
      patterns: Record<string, string>
  ) => {
    try {
      // 1. Save Mappings AND Patterns for future use
      const savePromises = Object.entries(allMappings).map(([id, mappings]) => {
          const pattern = patterns[id];
          return saveTemplateSettings(id, mappings, pattern);
      });
      await Promise.all(savePromises);

      // 2. Generate PDFs
      const results: {name: string, url: string}[] = [];

      for (const config of templateConfigs) {
         const mappings = allMappings[config.template.id] || [];
         const pattern = patterns[config.template.id] || DEFAULT_PATTERN;
         
         const filledBytes = await fillPdf(config.template.bytes, finalData, mappings);
         
         const blob = new Blob([filledBytes], { type: 'application/pdf' });
         const url = URL.createObjectURL(blob);
         
         // Generate custom filename
         const filename = generateFilename(pattern, finalData, config.template.name);

         results.push({
            name: filename,
            url: url
         });
      }

      setGeneratedFiles(results);
      setStep(AppStep.PREVIEW);
    } catch (error) {
      console.error(error);
      alert("Error generating PDFs");
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD_SOURCE);
    setSourceImage(null);
    setExtractedData(null);
    setTemplateConfigs([]);
    setGeneratedFiles([]);
  };

  return (
    <Layout currentStep={step}>
      
      {/* STEP 1: SOURCE UPLOAD */}
      {step === AppStep.UPLOAD_SOURCE && (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Paperwork, Solved.</h1>
                <p className="text-lg text-slate-600">
                    Upload your invoice, estimate, or work order. We support images (JPG, PNG) and PDF documents.
                </p>
            </div>
            <StepUpload 
                title="Upload Source Document"
                description="Upload an image or PDF of your estimate or invoice."
                accept="image/*,.pdf"
                onFileSelect={handleSourceUpload}
                isProcessing={isExtracting}
            />
            
            <div className="flex justify-center mt-8">
                <button 
                    onClick={() => setStep(AppStep.TEMPLATE_MANAGER)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm font-medium">Manage Template Library</span>
                </button>
            </div>
        </div>
      )}

      {/* TEMPLATE MANAGER (Independent View) */}
      {step === AppStep.TEMPLATE_MANAGER && (
        <StepTemplateSelection
            mode="manage"
            onBack={() => setStep(AppStep.UPLOAD_SOURCE)}
        />
      )}

      {/* STEP 2: TEMPLATE SELECTION (In Flow) */}
      {step === AppStep.UPLOAD_TEMPLATE && (
        <StepTemplateSelection 
          mode="select"
          onSelect={handleTemplatesSelect} 
          isProcessing={isMapping}
          sourceFileName={sourceFileName}
        />
      )}

      {/* STEP 3: MAPPING */}
      {step === AppStep.MAPPING && extractedData && (
        <StepMapping 
            templateConfigs={templateConfigs}
            extractedData={extractedData}
            onConfirm={handleGeneration}
            onBack={() => setStep(AppStep.UPLOAD_TEMPLATE)}
        />
      )}

      {/* STEP 4: PREVIEW & DOWNLOAD */}
      {step === AppStep.PREVIEW && generatedFiles.length > 0 && (
        <StepPreview 
            files={generatedFiles}
            onReset={handleReset}
        />
      )}
    </Layout>
  );
};

export default App;