export interface ExtractedData {
  // Customer Info
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  
  // Company/Vendor Info (New)
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;

  // Invoice Details
  serviceDate: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  lineItems: LineItem[];
  [key: string]: any; // Allow flexibility for mapping
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PdfField {
  name: string;
  type: string; // 'TextField', 'CheckBox', etc.
}

export interface FieldMapping {
  pdfFieldName: string;
  extractedKey: string; // If '__MANUAL__', use customValue
  customValue?: string;
}

export interface StoredTemplate {
  id: string;
  name: string;
  createdAt: number;
  savedMappings?: FieldMapping[];
  filenamePattern?: string; // New: Custom naming pattern
}

// NEW: For handling multiple selections
export interface SelectedTemplate {
  id: string;
  name: string;
  bytes: Uint8Array;
  savedMappings?: FieldMapping[];
  filenamePattern?: string;
}

export interface TemplateConfig {
  template: SelectedTemplate;
  fields: PdfField[];
  initialMappings: FieldMapping[];
  filenamePattern: string; // Current pattern state
}

export enum AppStep {
  UPLOAD_SOURCE = 'UPLOAD_SOURCE',
  UPLOAD_TEMPLATE = 'UPLOAD_TEMPLATE',
  MAPPING = 'MAPPING',
  PREVIEW = 'PREVIEW',
  TEMPLATE_MANAGER = 'TEMPLATE_MANAGER',
}