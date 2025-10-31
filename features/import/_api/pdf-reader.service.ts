/**
 * PDF reading and text extraction service
 */

const PDFParser = require('pdf2json');

class PdfReaderService {
  /**
   * Extract text content from PDF buffer using pdf2json
   */
  async extractText(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF extraction error:', errData.parserError);
        reject(new Error('Failed to extract text from PDF'));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          let fullText = '';

          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const text of page.Texts) {
                  if (text.R) {
                    for (const run of text.R) {
                      if (run.T) {
                        // Decode URI component (pdf2json encodes text)
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
              }
            }
          }

          fullText = fullText.trim();

          // Detailed logging
          console.log(`[PDF Debug] Pages: ${pdfData.Pages?.length || 0}`);
          console.log(`[PDF Debug] Text length: ${fullText.length}`);
          console.log(`[PDF Debug] First 200 chars: "${fullText.substring(0, 200)}"`);

          resolve(fullText);
        } catch (error) {
          console.error('PDF parsing error:', error);
          reject(new Error('Failed to parse PDF data'));
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
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
