import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractedData, FieldMapping } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DATA_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    // Customer
    customerName: { type: Type.STRING, description: "Full name of the client or business receiving the service" },
    customerAddress: { type: Type.STRING, description: "Full billing or service address of the customer" },
    customerPhone: { type: Type.STRING, description: "Phone number of the customer" },
    
    // Company (Vendor)
    companyName: { type: Type.STRING, description: "Name of the service provider company issuing the document" },
    companyAddress: { type: Type.STRING, description: "Address of the service provider company" },
    companyPhone: { type: Type.STRING, description: "Phone number of the service provider company" },
    companyEmail: { type: Type.STRING, description: "Email address of the service provider company" },

    // Financials
    serviceDate: { type: Type.STRING, description: "Date of service or invoice date (YYYY-MM-DD)" },
    invoiceNumber: { type: Type.STRING, description: "Invoice, estimate, or work order number" },
    subtotal: { type: Type.NUMBER, description: "Subtotal amount before tax" },
    tax: { type: Type.NUMBER, description: "Tax amount" },
    total: { type: Type.NUMBER, description: "Grand total amount" },
    notes: { type: Type.STRING, description: "Any special instructions, notes, or terms" },
    
    // Items
    lineItems: {
      type: Type.ARRAY,
      description: "List of services or parts provided",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          amount: { type: Type.NUMBER },
        }
      }
    }
  },
  required: ["customerName", "total", "lineItems"]
};

export async function extractDataFromDocument(base64DataUrl: string, mimeType: string): Promise<ExtractedData> {
  // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64," or "data:application/pdf;base64,")
  const base64Data = base64DataUrl.split(',')[1] || base64DataUrl;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "You are an expert data entry assistant for an HVAC/Plumbing business. Extract all data from this document. Capture the Customer's details AND the Company/Vendor's details explicitly. If a field is missing, leave it as an empty string or 0. Ensure currency values are numbers."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: DATA_SCHEMA,
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini");
    }

    return JSON.parse(text) as ExtractedData;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to extract data from the document.");
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
    - "lineItems" should be mapped to the main description or table area of the PDF.
    - Ignore PDF fields that don't have a corresponding data key.
    
    Return ONLY a JSON array of objects with this structure:
    [ { "pdfFieldName": "string", "extractedKey": "string" } ]
  `;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pdfFieldName: { type: Type.STRING },
              extractedKey: { type: Type.STRING }
            },
            required: ["pdfFieldName", "extractedKey"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as FieldMapping[];
  } catch (error) {
    console.error("Smart mapping failed", error);
    return [];
  }
}