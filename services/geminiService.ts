
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedData, FieldMapping } from "../types";

// Initialize the API using the stable SDK
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Use a model confirmed to be available for this key
const MODEL_NAME = "gemini-2.0-flash";

// Helper to clean JSON string if Markdown code blocks are included
function cleanJsonString(text: string): string {
  return text.replace(/```json\n?|\n?```/g, "").trim();
}

export async function extractDataFromDocument(base64DataUrl: string, mimeType: string): Promise<ExtractedData> {
  // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64," or "data:application/pdf;base64,")
  const base64Data = base64DataUrl.split(',')[1] || base64DataUrl;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = "You are an expert data entry assistant for an HVAC/Plumbing business. Extract all data from this document. Capture the Customer's details AND the Company/Vendor's details explicitly. If a field is missing, leave it as an empty string or 0. Ensure currency values are numbers. Return a valid JSON object matching the schema: { customerName, customerAddress, customerPhone, companyName, companyAddress, companyPhone, companyEmail, serviceDate, invoiceNumber, subtotal, tax, total, notes, lineItems: [{ description, quantity, unitPrice, amount }] }";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No data returned from Gemini");
    }

    const cleanedText = cleanJsonString(text);
    return JSON.parse(cleanedText) as ExtractedData;

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);

    // Bubble up the actual error message
    const message = error.message || error.toString();

    if (message.includes("403")) throw new Error("Access Denied (403): Invalid API Key.");
    if (message.includes("429")) throw new Error("Rate Limited (429): Too many requests.");
    if (message.includes("400")) throw new Error("Bad Request (400): Unsupported file or invalid request.");

    throw new Error(`Extraction Failed: ${message}`);
  }
}

export async function smartMapFields(pdfFields: string[], dataKeys: string[]): Promise<FieldMapping[]> {
  const prompt = `
    You are an expert at mapping PDF form fields to data extracted from invoices/estimates.
    
    Here are the PDF Form Fields found:
    ${JSON.stringify(pdfFields)}

    Here are the Data Keys available from the extraction:
    ${JSON.stringify(dataKeys)}

    Task:
    Create a mapping where each relevant PDF field is assigned one Data Key.
    - Match loosely based on meaning (e.g. "BillTo_Name" -> "customerName", "Vendor_Name" -> "companyName").
    - PRIORITIZE exact matches.
    - If a PDF field asks for "Total", map to "total". If "Subtotal", map to "subtotal".
    - "lineItems" should be mapped to the main description or table area of the PDF.
    - Ignore PDF fields that don't have a corresponding data key.
    
    Return ONLY a valid JSON array of objects with this structure:
    [ { "pdfFieldName": "string", "extractedKey": "string" } ]
  `;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) return [];

    const cleanedText = cleanJsonString(text);
    return JSON.parse(cleanedText) as FieldMapping[];
  } catch (error) {
    console.error("Smart mapping failed", error);
    return [];
  }
}