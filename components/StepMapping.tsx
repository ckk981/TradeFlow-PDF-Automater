import React, { useState, useEffect } from 'react';
import { ArrowRight, Save, LayoutTemplate, Database, Edit3, User, Building2, Receipt, Pencil, FileText, Settings, Tag } from 'lucide-react';
import { ExtractedData, PdfField, FieldMapping, TemplateConfig } from '../types';
import { DEFAULT_PATTERN, AVAILABLE_PLACEHOLDERS, generateFilename } from '../services/filenameService';

interface StepMappingProps {
  templateConfigs: TemplateConfig[]; // Changed to accept multiple configs
  extractedData: ExtractedData;
  onConfirm: (
      mappings: Record<string, FieldMapping[]>, 
      updatedData: ExtractedData, 
      patterns: Record<string, string>
  ) => void;
  onBack: () => void;
}

const StepMapping: React.FC<StepMappingProps> = ({ templateConfigs, extractedData, onConfirm, onBack }) => {
  // Map of templateID -> FieldMappings[]
  const [allMappings, setAllMappings] = useState<Record<string, FieldMapping[]>>({});
  // Map of templateID -> filenamePattern
  const [filenamePatterns, setFilenamePatterns] = useState<Record<string, string>>({});
  
  const [editableData, setEditableData] = useState<ExtractedData>(extractedData);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(templateConfigs[0]?.template.id || '');

  // Initialize mappings from props
  useEffect(() => {
    const initialMappings: Record<string, FieldMapping[]> = {};
    const initialPatterns: Record<string, string> = {};
    
    templateConfigs.forEach(config => {
        initialMappings[config.template.id] = config.initialMappings;
        initialPatterns[config.template.id] = config.template.filenamePattern || DEFAULT_PATTERN;
    });
    
    setAllMappings(initialMappings);
    setFilenamePatterns(initialPatterns);
    
    if(templateConfigs.length > 0) {
        setActiveTemplateId(templateConfigs[0].template.id);
    }
  }, [templateConfigs]);

  const updateMapping = (templateId: string, pdfFieldName: string, extractedKey: string, customValue: string = '') => {
    setAllMappings(prev => {
        const currentTemplateMappings = prev[templateId] || [];
        const filtered = currentTemplateMappings.filter(m => m.pdfFieldName !== pdfFieldName);
        
        let newMappings = filtered;
        if (extractedKey !== '') {
            newMappings = [...filtered, { pdfFieldName, extractedKey, customValue }];
        }
        
        return {
            ...prev,
            [templateId]: newMappings
        };
    });
  };

  const updatePattern = (templateId: string, pattern: string) => {
    setFilenamePatterns(prev => ({ ...prev, [templateId]: pattern }));
  };

  const insertPlaceholder = (placeholder: string) => {
     const current = filenamePatterns[activeTemplateId] || '';
     updatePattern(activeTemplateId, current + placeholder);
  };

  const getMappingForField = (templateId: string, pdfFieldName: string) => {
    return allMappings[templateId]?.find(m => m.pdfFieldName === pdfFieldName);
  };

  const handleDataChange = (key: string, value: any) => {
    setEditableData(prev => ({ ...prev, [key]: value }));
  };

  const MANUALLY_ENTERED_KEY = '__MANUAL__';

  const groups = [
    { title: 'Customer Info', icon: User, keys: ['customerName', 'customerAddress', 'customerPhone'] },
    { title: 'Company Info', icon: Building2, keys: ['companyName', 'companyAddress', 'companyPhone', 'companyEmail'] },
    { title: 'Invoice Details', icon: Receipt, keys: ['invoiceNumber', 'serviceDate', 'subtotal', 'tax', 'total', 'notes'] }
  ];

  const flatKeys = groups.flatMap(g => g.keys);
  
  // Get active config
  const activeConfig = templateConfigs.find(c => c.template.id === activeTemplateId);
  const currentFilenamePreview = activeConfig 
    ? generateFilename(
        filenamePatterns[activeTemplateId] || DEFAULT_PATTERN, 
        editableData, 
        activeConfig.template.name
      ) 
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
      
      {/* LEFT: Extracted Data Review */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">Source Data</h3>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {groups.map((group) => (
            <div key={group.title} className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
               <div className="flex items-center space-x-2 mb-3 text-blue-800">
                  <group.icon className="w-4 h-4" />
                  <h4 className="font-semibold text-sm">{group.title}</h4>
               </div>
               <div className="grid grid-cols-1 gap-3">
                 {group.keys.map(key => (
                   <div key={key}>
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                       {key.replace(/([A-Z])/g, ' $1').trim()}
                     </label>
                     <input
                       type="text"
                       className="w-full rounded border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-2 border bg-white"
                       value={editableData[key] || ''}
                       onChange={(e) => handleDataChange(key, e.target.value)}
                     />
                   </div>
                 ))}
               </div>
            </div>
          ))}
          
           {/* Line Items Read-Only View */}
           <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
             <div className="flex items-center space-x-2 mb-3 text-blue-800">
                <Receipt className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Line Items ({editableData.lineItems.length})</h4>
             </div>
              <div className="bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-600 font-mono h-24 overflow-y-auto">
                {editableData.lineItems.map((item, idx) => (
                    <div key={idx} className="border-b border-slate-100 last:border-0 py-1">
                        {item.quantity}x {item.description} - ${item.amount}
                    </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT: PDF Field Mapping & Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        
        {/* Template Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
            {templateConfigs.map(config => (
                <button
                    key={config.template.id}
                    onClick={() => setActiveTemplateId(config.template.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTemplateId === config.template.id
                            ? 'border-purple-600 text-purple-700 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>{config.template.name}</span>
                </button>
            ))}
        </div>
        
        {/* Filename Config Section */}
        {activeConfig && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-2">
                    <Settings className="w-3 h-3" />
                    <span>OUTPUT FILENAME SETTINGS</span>
                </div>
                <div className="flex flex-col space-y-2">
                     <div className="flex space-x-2">
                        <input 
                            type="text" 
                            className="flex-1 rounded-md border-slate-300 text-sm py-1.5 px-3 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            placeholder="e.g. Invoice_{CustomerName}"
                            value={filenamePatterns[activeTemplateId] || ''}
                            onChange={(e) => updatePattern(activeTemplateId, e.target.value)}
                        />
                     </div>
                     <div className="flex flex-wrap gap-2">
                         {AVAILABLE_PLACEHOLDERS.map(ph => (
                             <button
                                key={ph.key}
                                onClick={() => insertPlaceholder(ph.key)}
                                className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:border-purple-300 hover:text-purple-600 flex items-center transition-colors"
                             >
                                <Tag className="w-3 h-3 mr-1" />
                                {ph.label}
                             </button>
                         ))}
                     </div>
                     <div className="text-xs text-slate-500 flex items-center">
                        <span className="font-medium mr-1">Preview:</span>
                        <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">{currentFilenamePreview}</span>
                     </div>
                </div>
            </div>
        )}

        {/* Fields Header */}
        <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between">
             <div className="flex items-center space-x-2">
                <LayoutTemplate className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Map Fields</h3>
             </div>
             <span className="text-xs text-slate-400">
                 {activeConfig?.fields.length || 0} fields
             </span>
        </div>
        
        {/* Fields List */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
            {!activeConfig || activeConfig.fields.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    No form fields found in this PDF. It might not be a fillable form.
                </div>
            ) : (
                <div className="space-y-3">
                    {activeConfig.fields.map(field => {
                        const currentMapping = getMappingForField(activeTemplateId, field.name);
                        const isManual = currentMapping?.extractedKey === MANUALLY_ENTERED_KEY;

                        return (
                        <div key={field.name} className="flex flex-col p-3 rounded-lg border border-slate-200 bg-white hover:border-purple-300 transition-colors shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2 min-w-0">
                                    <span className="text-sm font-medium text-slate-700 truncate" title={field.name}>{field.name}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">{field.type}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            </div>
                            
                            <div className="flex space-x-2">
                                <select 
                                    className={`flex-1 rounded-md border-slate-300 text-sm focus:border-purple-500 focus:ring-purple-500 py-1.5 ${isManual ? 'w-1/3 flex-none' : 'w-full'}`}
                                    value={currentMapping?.extractedKey || ''}
                                    onChange={(e) => updateMapping(activeTemplateId, field.name, e.target.value, currentMapping?.customValue)}
                                >
                                    <option value="">-- Leave Empty --</option>
                                    <optgroup label="Manual Input">
                                       <option value={MANUALLY_ENTERED_KEY}>Custom Text / Manual Entry</option>
                                    </optgroup>
                                    <optgroup label="Extracted Data">
                                        {flatKeys.map(k => (
                                            <option key={k} value={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>
                                        ))}
                                        <option value="lineItems">Line Items (Summary)</option>
                                    </optgroup>
                                </select>
                                
                                {isManual && (
                                    <div className="flex-1 relative animate-in fade-in slide-in-from-left-2 duration-200">
                                       <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                          <Pencil className="h-3 w-3 text-slate-400" />
                                       </div>
                                       <input 
                                          type="text" 
                                          placeholder="Type value..."
                                          className="w-full pl-7 rounded-md border-purple-300 focus:border-purple-500 focus:ring-purple-500 text-sm py-1.5 shadow-sm"
                                          value={currentMapping?.customValue || ''}
                                          onChange={(e) => updateMapping(activeTemplateId, field.name, MANUALLY_ENTERED_KEY, e.target.value)}
                                       />
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
            <button onClick={onBack} className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2">
                Back
            </button>
            <button 
                onClick={() => onConfirm(allMappings, editableData, filenamePatterns)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center space-x-2 transition-transform active:scale-95"
            >
                <Save className="w-4 h-4" />
                <span>Generate {templateConfigs.length} PDF{templateConfigs.length > 1 ? 's' : ''}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default StepMapping;