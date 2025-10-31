/**
 * PDF reading and text extraction service
 */

const pdfParse = require('pdf-parse');

class PdfReaderService {
  /**
   * Extract text content from PDF buffer using pdf-parse
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);

      // Detailed logging
      console.log(`[PDF Debug] Pages: ${data.numpages}, Info:`, data.info);
      console.log(`[PDF Debug] Text length: ${data.text?.length || 0}`);
      console.log(`[PDF Debug] First 200 chars: "${data.text?.substring(0, 200)}"`);

      return data.text;
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
