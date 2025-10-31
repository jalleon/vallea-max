/**
 * PDF reading and text extraction service
 */

const PDFExtract = require('pdf.js-extract').PDFExtract;

class PdfReaderService {
  /**
   * Extract text content from PDF buffer using pdf.js-extract
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const pdfExtract = new PDFExtract();
      const options = {}; // Can add options if needed

      const data = await pdfExtract.extractBuffer(buffer, options);

      // Extract text from all pages
      let fullText = '';
      for (const page of data.pages) {
        for (const item of page.content) {
          if (item.str) {
            fullText += item.str + ' ';
          }
        }
      }

      fullText = fullText.trim();

      // Detailed logging
      console.log(`[PDF Debug] Pages: ${data.pages.length}`);
      console.log(`[PDF Debug] Text length: ${fullText.length}`);
      console.log(`[PDF Debug] First 200 chars: "${fullText.substring(0, 200)}"`);

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
