import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';
import { PdfField, ExtractedData, FieldMapping } from '../types';

export async function getPdfFields(pdfBytes: Uint8Array): Promise<PdfField[]> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map(field => {
    let type = 'Unknown';
    if (field instanceof PDFTextField) type = 'TextField';
    else if (field instanceof PDFCheckBox) type = 'CheckBox';
    
    return {
      name: field.getName(),
      type
    };
  });
}

export async function fillPdf(
  pdfBytes: Uint8Array, 
  data: ExtractedData, 
  mapping: FieldMapping[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  mapping.forEach(map => {
    const field = form.getFieldMaybe(map.pdfFieldName);
    if (!field) return;

    let valueToFill = '';
    
    // HANDLE MANUAL ENTRY
    if (map.extractedKey === '__MANUAL__') {
      valueToFill = map.customValue || '';
    } 
    // HANDLE LINE ITEMS SPECIAL CASE
    else if (map.extractedKey === 'lineItems') {
      valueToFill = data.lineItems
        .map(i => `${i.quantity}x ${i.description} ($${i.amount})`)
        .join('\n');
    } 
    // HANDLE STANDARD DATA MAPPING
    else {
      const val = data[map.extractedKey as keyof ExtractedData];
      valueToFill = val !== undefined && val !== null ? String(val) : '';
    }

    if (field instanceof PDFTextField) {
      // Check for maxLength constraints and truncate if necessary
      const maxLength = field.getMaxLength();
      if (maxLength !== undefined && valueToFill.length > maxLength) {
        valueToFill = valueToFill.substring(0, maxLength);
      }
      field.setText(valueToFill);
    } else if (field instanceof PDFCheckBox) {
      if (valueToFill.toLowerCase() === 'true' || valueToFill === '1' || valueToFill.toLowerCase() === 'yes') {
        field.check();
      }
    }
  });

  return pdfDoc.save();
}

export function autoMapFields(pdfFields: PdfField[], extractedDataKeys: string[]): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  pdfFields.forEach(field => {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fieldNameNorm = normalize(field.name);

    // Heuristics
    let match = extractedDataKeys.find(key => normalize(key) === fieldNameNorm);
    
    // Fuzzy match common terms
    if (!match) {
        // Customer
        if (fieldNameNorm.includes('customer') || fieldNameNorm.includes('client') || fieldNameNorm.includes('billto')) {
             if (fieldNameNorm.includes('name')) match = 'customerName';
             if (fieldNameNorm.includes('address')) match = 'customerAddress';
             if (fieldNameNorm.includes('phone')) match = 'customerPhone';
        }
        // Company/Vendor
        if (fieldNameNorm.includes('company') || fieldNameNorm.includes('vendor') || fieldNameNorm.includes('provider')) {
             if (fieldNameNorm.includes('name')) match = 'companyName';
             if (fieldNameNorm.includes('address')) match = 'companyAddress';
             if (fieldNameNorm.includes('phone')) match = 'companyPhone';
             if (fieldNameNorm.includes('email')) match = 'companyEmail';
        }
        // Financials
        if (fieldNameNorm.includes('date')) match = 'serviceDate';
        if (fieldNameNorm.includes('invoice') || fieldNameNorm.includes('est')) match = 'invoiceNumber';
        if (fieldNameNorm === 'total' || fieldNameNorm === 'grandtotal') match = 'total';
        if (fieldNameNorm === 'subtotal') match = 'subtotal';
        if (fieldNameNorm === 'tax') match = 'tax';
        if (fieldNameNorm === 'notes' || fieldNameNorm === 'comments') match = 'notes';
        if (fieldNameNorm.includes('desc') || fieldNameNorm.includes('items')) match = 'lineItems';
    }

    if (match) {
      mappings.push({ pdfFieldName: field.name, extractedKey: match });
    }
  });

  return mappings;
}