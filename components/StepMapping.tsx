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

    if (templateConfigs.length > 0) {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">

      {/* LEFT: Extracted Data Review (4 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-industrial-800 rounded-xl shadow-2xl border border-industrial-700 overflow-hidden">
          <div className="p-4 border-b border-industrial-700 bg-industrial-900/50 flex items-center space-x-2 sticky top-0 z-10">
            <Database className="w-5 h-5 text-industrial-orange" />
            <h3 className="font-semibold text-white font-mono">Source Data</h3>
          </div>

          <div className="p-6 space-y-6">
            {groups.map((group) => (
              <div key={group.title} className="bg-industrial-900/30 rounded p-4 border border-industrial-700">
                <div className="flex items-center space-x-2 mb-3 text-industrial-orange">
                  <group.icon className="w-4 h-4" />
                  <h4 className="font-semibold text-sm font-mono uppercase tracking-wide">{group.title}</h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {group.keys.map(key => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        className="w-full rounded border-industrial-600 shadow-sm focus:border-industrial-orange focus:ring-industrial-orange text-sm py-1.5 px-2 border bg-industrial-900 text-slate-200 font-mono"
                        value={editableData[key] || ''}
                        onChange={(e) => handleDataChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Line Items Read-Only View */}
            <div className="bg-industrial-900/30 rounded p-4 border border-industrial-700">
              <div className="flex items-center space-x-2 mb-3 text-industrial-orange">
                <Receipt className="w-4 h-4" />
                <h4 className="font-semibold text-sm font-mono uppercase tracking-wide">Line Items ({editableData.lineItems.length})</h4>
              </div>
              <div className="bg-industrial-900 border border-industrial-600 rounded p-2 text-xs text-slate-300 font-mono h-24 overflow-y-auto">
                {editableData.lineItems.map((item, idx) => (
                  <div key={idx} className="border-b border-industrial-700 last:border-0 py-1">
                    {item.quantity}x {item.description} - ${item.amount}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: PDF Field Mapping & Settings (8 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-industrial-800 rounded-xl shadow-2xl border border-industrial-700 overflow-hidden sticky top-8">

          {/* Template Tabs */}
          <div className="flex overflow-x-auto border-b border-industrial-700 bg-industrial-900 scrollbar-hide">
            {templateConfigs.map(config => (
              <button
                key={config.template.id}
                onClick={() => setActiveTemplateId(config.template.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap font-mono ${activeTemplateId === config.template.id
                  ? 'border-industrial-orange text-industrial-orange bg-industrial-800'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-industrial-800/50'
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>{config.template.name}</span>
              </button>
            ))}
          </div>

          {/* Filename Config Section */}
          {activeConfig && (
            <div className="p-6 bg-industrial-900/30 border-b border-industrial-700">
              <div className="flex items-center space-x-2 text-xs font-semibold text-industrial-orange mb-3 font-mono">
                <Settings className="w-3 h-3" />
                <span>OUTPUT FILENAME CONFIG</span>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 rounded border-industrial-600 text-sm py-2 px-3 shadow-sm focus:border-industrial-orange focus:ring-industrial-orange bg-industrial-900 text-white font-mono"
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
                      className="px-2 py-1 bg-industrial-800 border border-industrial-600 rounded text-[10px] text-slate-400 hover:border-industrial-orange hover:text-industrial-orange flex items-center transition-colors shadow-sm font-mono"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {ph.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-500 flex items-center pt-1 font-mono">
                  <span className="font-medium mr-2">Preview:</span>
                  <span className="bg-industrial-900 border border-industrial-700 px-2 py-0.5 rounded text-green-400">{currentFilenamePreview}</span>
                </div>
              </div>
            </div>
          )}

          {/* Fields List */}
          <div className="p-6 bg-industrial-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <LayoutTemplate className="w-5 h-5 text-industrial-orange" />
                <h3 className="font-semibold text-white font-mono">Map Fields</h3>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-industrial-900 border border-industrial-700 text-slate-400 rounded-full font-mono">
                {activeConfig?.fields.length || 0} fields detected
              </span>
            </div>

            {!activeConfig || activeConfig.fields.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-mono">
                No form fields found in this PDF. It might not be a fillable form.
              </div>
            ) : (
              <div className="space-y-3">
                {activeConfig.fields.map(field => {
                  const currentMapping = getMappingForField(activeTemplateId, field.name);
                  const isManual = currentMapping?.extractedKey === MANUALLY_ENTERED_KEY;

                  return (
                    <div key={field.name} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded border border-industrial-700 bg-industrial-900/50 hover:border-industrial-orange/50 transition-colors shadow-sm group">
                      <div className="sm:w-1/3 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-300 truncate block font-mono" title={field.name}>{field.name}</span>
                          <span className="text-[10px] bg-industrial-800 border border-industrial-700 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0 font-mono">{field.type}</span>
                        </div>
                      </div>

                      <ArrowRight className="hidden sm:block w-4 h-4 text-industrial-700 flex-shrink-0" />

                      <div className="flex-1 flex space-x-2 min-w-0">
                        <div className="relative flex-1 min-w-0">
                          <select
                            className={`w-full rounded border-industrial-600 text-sm focus:border-industrial-orange focus:ring-industrial-orange py-2 pl-3 pr-8 text-white ${isManual ? 'bg-industrial-800 text-slate-400' : 'bg-industrial-900'}`}
                            value={currentMapping?.extractedKey || ''}
                            onChange={(e) => updateMapping(activeTemplateId, field.name, e.target.value, currentMapping?.customValue)}
                          >
                            <option value="">-- Leave Empty --</option>
                            <optgroup label="Manual Input">
                              <option value={MANUALLY_ENTERED_KEY}>Custom / Manual Entry</option>
                            </optgroup>
                            <optgroup label="Extracted Data">
                              {flatKeys.map(k => (
                                <option key={k} value={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>
                              ))}
                              <option value="lineItems">Line Items (Summary)</option>
                            </optgroup>
                          </select>
                        </div>

                        {isManual && (
                          <div className="flex-1 relative animate-in fade-in slide-in-from-left-2 duration-200 min-w-[120px]">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                              <Pencil className="h-3 w-3 text-industrial-orange" />
                            </div>
                            <input
                              type="text"
                              placeholder="Type value..."
                              className="w-full pl-8 rounded border-industrial-orange/50 focus:border-industrial-orange focus:ring-industrial-orange text-sm py-2 shadow-sm bg-industrial-900 text-white font-mono"
                              value={currentMapping?.customValue || ''}
                              onChange={(e) => updateMapping(activeTemplateId, field.name, MANUALLY_ENTERED_KEY, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-industrial-700 bg-industrial-800/95 flex justify-between items-center sticky bottom-0 z-10 backdrop-blur-sm">
            <button onClick={onBack} className="text-slate-400 hover:text-white font-medium px-4 py-2 font-mono">
              Back
            </button>
            <button
              onClick={() => onConfirm(allMappings, editableData, filenamePatterns)}
              className="bg-industrial-orange hover:bg-orange-600 text-white px-8 py-2.5 rounded font-bold shadow-lg shadow-orange-900/20 flex items-center space-x-2 transition-all active:scale-95 font-mono uppercase tracking-wide"
            >
              <Save className="w-4 h-4" />
              <span>Generate PDF{templateConfigs.length > 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepMapping;