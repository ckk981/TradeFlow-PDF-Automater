import * as pdfjsLib from 'pdfjs-dist';

// Handle ESM/CJS interop: esm.sh or bundlers might wrap the module in 'default'
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Configure the worker to handle the heavy lifting of PDF parsing
// We point to the same version as defined in the import map
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

/**
 * Converts the first page of a PDF blob URL to a JPG data URL.
 * @param pdfUrl The blob URL of the PDF
 * @param scale Quality scale (default 2 for high res)
 * @returns Promise resolving to a base64 Data URL of the JPG
 */
export const convertPdfToJpg = async (pdfUrl: string, scale: number = 2): Promise<string> => {
  try {
    // Use the resolved pdfjs object which might be the default export
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    // Fetch the first page
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        throw new Error("Could not create canvas context");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    
    // Convert to JPG with 0.9 quality
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error("Error rendering PDF to JPG:", error);
    throw error;
  }
};