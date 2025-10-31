/**
 * PDF reading and text extraction service using pdfjs-dist
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Disable worker for Node.js environment
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

class PdfReaderService {
  /**
   * Extract text content from PDF buffer using pdfjs-dist
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        standardFontDataUrl: undefined,
      });

      const pdfDocument = await loadingTask.promise;

      let fullText = '';
      const numPages = pdfDocument.numPages;

      console.log(`[PDF Debug] Total pages: ${numPages}`);

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine all text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        fullText += pageText + ' ';
      }

      fullText = fullText.trim();

      console.log(`[PDF Debug] Total characters extracted: ${fullText.length}`);
      console.log(`[PDF Debug] First 300 chars: "${fullText.substring(0, 300)}"`);

      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from File object (browser upload)
   */
  async extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return this.extractText(buffer);
  }
}

// Export singleton instance
export const pdfReaderService = new PdfReaderService();
