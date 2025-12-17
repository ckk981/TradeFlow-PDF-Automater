import { ExtractedData } from "../types";

export const DEFAULT_PATTERN = "{TemplateName}_{CustomerName}_{Date}";

export const AVAILABLE_PLACEHOLDERS = [
  { label: 'Customer Name', key: '{CustomerName}' },
  { label: 'Date', key: '{Date}' },
  { label: 'Invoice #', key: '{InvoiceNumber}' },
  { label: 'Template Name', key: '{TemplateName}' },
];

export function generateFilename(
    pattern: string, 
    data: ExtractedData, 
    templateName: string
): string {
    let filename = pattern || DEFAULT_PATTERN;
    
    // Helper to safe string
    const safe = (str: any) => {
        if (!str) return 'Unknown';
        return String(str).replace(/[^a-zA-Z0-9-_]/g, '');
    };

    filename = filename.replace(/{CustomerName}/g, safe(data.customerName));
    filename = filename.replace(/{Date}/g, safe(data.serviceDate));
    filename = filename.replace(/{InvoiceNumber}/g, safe(data.invoiceNumber));
    filename = filename.replace(/{TemplateName}/g, safe(templateName));
    
    return filename + ".pdf";
}