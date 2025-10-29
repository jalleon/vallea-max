/**
 * PDF reading and text extraction service
 */

import { PdfReader } from 'pdfreader';

class PdfReaderService {
  /**
   * Extract text content from PDF buffer
   */
  async extractText(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new PdfReader();
      let textContent = '';

      reader.parseBuffer(buffer, (err, item) => {
        if (err) {
          return reject(err);
        }

        if (!item) {
          // End of file
          resolve(textContent.trim());
          return;
        }

        // Accumulate text
        if (item.text) {
          textContent += item.text + ' ';
        }
      });
    });
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
