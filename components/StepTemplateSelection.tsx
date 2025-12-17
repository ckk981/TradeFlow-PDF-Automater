import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FileText, Upload, Calendar, ChevronRight, Loader2, CheckCircle, Check, ArrowLeft, LayoutGrid } from 'lucide-react';
import { StoredTemplate, SelectedTemplate } from '../types';
import { getTemplates, saveTemplate, getTemplateData, deleteTemplate } from '../services/storageService';

interface StepTemplateSelectionProps {
  onSelect?: (templates: SelectedTemplate[]) => void;
  isProcessing?: boolean;
  sourceFileName?: string;
  mode?: 'select' | 'manage';
  onBack?: () => void;
}

const StepTemplateSelection: React.FC<StepTemplateSelectionProps> = ({ 
    onSelect, 
    isProcessing = false, 
    sourceFileName, 
    mode = 'select',
    onBack
}) => {
  const [view, setView] = useState<'list' | 'upload'>('list');
  const [templates, setTemplates] = useState<StoredTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fetchingData, setFetchingData] = useState(false);

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
      if (data.length === 0) {
        setView('upload');
      }
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Auto-fill name if empty
      if (!templateName) {
        setTemplateName(selected.name.replace('.pdf', ''));
      }
    }
  };

  const handleSaveAndAdd = async () => {
    if (!file || !templateName) return;
    setIsSaving(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Save to DB
      const newTemplate = await saveTemplate(templateName, bytes);
      
      // Refresh list
      await loadTemplates();
      
      // Select the new template
      setSelectedIds(prev => new Set(prev).add(newTemplate.id));
      
      // Switch back to list
      setView('list');
      setFile(null);
      setTemplateName('');
    } catch (err) {
      console.error(err);
      alert("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelection = (id: string) => {
    if (isProcessing || fetchingData) return;
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleContinue = async () => {
    if (selectedIds.size === 0 || !onSelect) return;
    setFetchingData(true);
    
    try {
      const selectedTemplates: SelectedTemplate[] = [];
      for (const id of selectedIds) {
        const templateInfo = templates.find(t => t.id === id);
        if (templateInfo) {
          const bytes = await getTemplateData(id);
          selectedTemplates.push({
            id: templateInfo.id,
            name: templateInfo.name,
            bytes,
            savedMappings: templateInfo.savedMappings,
            filenamePattern: templateInfo.filenamePattern
          });
        }
      }
      onSelect(selectedTemplates);
    } catch (err) {
      console.error(err);
      alert("Failed to load template data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate(id);
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      loadTemplates();
    }
  };

  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} templates?`)) {
        for (const id of selectedIds) {
            await deleteTemplate(id);
        }
        setSelectedIds(new Set());
        loadTemplates();
    }
  };

  if (loading || isProcessing || fetchingData) {
    return (
      <div className="flex flex-col justify-center items-center h-80 bg-white rounded-xl shadow-sm border border-slate-200">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-900">
          {isProcessing ? 'Smart Matching...' : 'Loading...'}
        </h3>
        {isProcessing ? (
           <p className="text-sm text-slate-500 mt-2">AI is connecting your data to the form fields.</p>
        ) : (
           <p className="text-sm text-slate-500 mt-2">Accessing your secure library.</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Navigation for Manager Mode */}
      {mode === 'manage' && onBack && (
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-blue-600 transition-colors mb-4 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
        </button>
      )}

      {/* Context Banner (Only if source provided) */}
      {sourceFileName && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full border border-blue-100">
                <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Data Source Ready</p>
                <p className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-md">{sourceFileName}</p>
                </div>
            </div>
            <div className="hidden sm:block text-xs text-blue-400">
                Step 1 Complete
            </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {mode === 'manage' ? 'Template Library' : 'Select Target Templates'}
        </h2>
        <p className="text-slate-600">
            {mode === 'manage' 
                ? 'Upload, organize, and manage your PDF forms.' 
                : 'Select one or more forms to fill with your data.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 p-1 rounded-lg flex space-x-1">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'list' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Templates
          </button>
          <button
            onClick={() => setView('upload')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'upload' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Upload New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
        {view === 'list' ? (
          <div className="space-y-6">
             {templates.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No templates found</h3>
                    <p className="text-slate-500 mb-6">Upload your first PDF template to get started.</p>
                    <button 
                        onClick={() => setView('upload')}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Upload a template
                    </button>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(t => {
                        const isSelected = selectedIds.has(t.id);
                        return (
                        <div 
                            key={t.id} 
                            onClick={() => toggleSelection(t.id)}
                            className={`group relative border rounded-lg p-4 cursor-pointer transition-all select-none ${
                                isSelected 
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-200' : 'bg-slate-100'}`}>
                                        <FileText className={`w-6 h-6 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{t.name}</h3>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <button 
                                        onClick={(e) => handleDelete(e, t.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors z-10"
                                        title="Delete template"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                         isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                     }`}>
                                         {isSelected && <Check className="w-3 h-3 text-white" />}
                                     </div>
                                </div>
                            </div>
                        </div>
                    )})}
                    
                    {/* Add New Card (Small) */}
                    <button 
                        onClick={() => setView('upload')}
                        className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50 transition-all min-h-[100px]"
                    >
                        <Plus className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Add New Template</span>
                    </button>
                </div>
             )}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Template Name
                    </label>
                    <input 
                        type="text" 
                        placeholder="e.g. Residential Invoice"
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        PDF File
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {file ? (
                                <>
                                    <FileText className="w-8 h-8 text-blue-600 mb-2" />
                                    <p className="text-sm text-slate-900 font-medium">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-500">Click to upload PDF</p>
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button 
                        onClick={() => setView('list')}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveAndAdd}
                        disabled={!file || !templateName || isSaving}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm flex items-center space-x-2 ${
                            (!file || !templateName || isSaving) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                    >
                        {isSaving ? <span>Saving...</span> : <span>Save & Add to Library</span>}
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar (Different per mode) */}
      {selectedIds.size > 0 && view === 'list' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-4 z-50 animate-in slide-in-from-bottom-4">
            <span className="font-medium text-sm">{selectedIds.size} selected</span>
            <div className="h-4 w-px bg-slate-700"></div>
            
            {mode === 'select' ? (
                <button 
                    onClick={handleContinue}
                    className="font-bold text-sm flex items-center hover:text-blue-300 transition-colors"
                >
                    Continue to Mapping <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            ) : (
                <button 
                    onClick={handleDeleteSelected}
                    className="font-bold text-sm flex items-center text-red-300 hover:text-red-100 transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                </button>
            )}
        </div>
      )}
    </div>
  );
};

export default StepTemplateSelection;