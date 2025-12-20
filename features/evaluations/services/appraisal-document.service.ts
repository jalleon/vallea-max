/**
 * Professional Appraisal Document Generator
 * Creates beautifully formatted Word documents using docx.js
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
  PageBreak,
  Footer,
  Header
} from 'docx';
import { saveAs } from 'file-saver';

interface AppraisalDocumentData {
  templateType: string;
  sections: any;
  appraisalData: any;
}

export class AppraisalDocumentService {
  /**
   * Generate a professional Word document from appraisal data
   */
  static async generateDocument(data: AppraisalDocumentData): Promise<Document> {
    const { templateType, sections, appraisalData } = data;

    const doc = new Document({
      creator: 'Valea Max',
      title: `Appraisal Report - ${appraisalData.address || 'Property'}`,
      description: 'Professional Real Estate Appraisal Report',
      styles: {
        default: {
          document: {
            run: {
              font: 'Times New Roman',
              size: 24 // 12pt
            },
            paragraph: {
              spacing: {
                line: 360, // 1.5 line spacing
                before: 120,
                after: 120
              }
            }
          },
          heading1: {
            run: {
              font: 'Times New Roman',
              size: 32, // 16pt
              bold: true,
              color: '1a1a1a'
            },
            paragraph: {
              spacing: {
                before: 480,
                after: 240
              }
            }
          },
          heading2: {
            run: {
              font: 'Times New Roman',
              size: 28, // 14pt
              bold: true,
              color: '2c2c2c'
            },
            paragraph: {
              spacing: {
                before: 360,
                after: 180
              }
            }
          },
          heading3: {
            run: {
              font: 'Times New Roman',
              size: 26, // 13pt
              bold: true,
              color: '404040'
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120
              }
            }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1)
              }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'APPRAISAL REPORT',
                      font: 'Times New Roman',
                      size: 20,
                      color: '666666'
                    })
                  ],
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 120 }
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Confidential Report - Valea Max',
                      font: 'Times New Roman',
                      size: 18,
                      color: '999999'
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120 }
                })
              ]
            })
          },
          children: this.generateDocumentContent(data)
        }
      ]
    });

    return doc;
  }

  /**
   * Generate document content based on template type
   */
  private static generateDocumentContent(data: AppraisalDocumentData): (Paragraph | Table)[] {
    const { templateType, sections, appraisalData } = data;
    const content: (Paragraph | Table)[] = [];

    // Title Page
    const presentationData = sections.presentation || {};

    content.push(
      new Paragraph({
        text: presentationData.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 400 }
      })
    );

    content.push(
      new Paragraph({
        text: presentationData.fullAddress || appraisalData.address || '',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        run: {
          font: 'Times New Roman',
          size: 28,
          bold: true
        }
      })
    );

    const cityProvince = [
      presentationData.city || appraisalData.city || '',
      presentationData.province || '',
      presentationData.postalCode || ''
    ].filter(Boolean).join(', ');

    if (cityProvince) {
      content.push(
        new Paragraph({
          text: cityProvince,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          run: {
            font: 'Times New Roman',
            size: 24
          }
        })
      );
    }

    content.push(
      new Paragraph({
        text: `Date: ${new Date().toLocaleDateString('fr-CA')}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    content.push(
      new Paragraph({
        text: `File Number: ${presentationData.fileNumber || appraisalData.file_number || 'N/A'}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Client/Borrower
    if (presentationData.clientName) {
      content.push(
        new Paragraph({
          text: 'Client / Borrower',
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          run: {
            font: 'Times New Roman',
            size: 24,
            bold: true
          }
        })
      );
      content.push(
        new Paragraph({
          text: presentationData.clientName,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Appraiser Information
    if (presentationData.appraiserName || presentationData.appraiserTitle) {
      content.push(
        new Paragraph({
          text: 'Appraiser',
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          run: {
            font: 'Times New Roman',
            size: 24,
            bold: true
          }
        })
      );
      if (presentationData.appraiserName) {
        content.push(
          new Paragraph({
            text: presentationData.appraiserName,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          })
        );
      }
      if (presentationData.appraiserTitle) {
        content.push(
          new Paragraph({
            text: presentationData.appraiserTitle,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            run: {
              font: 'Times New Roman',
              size: 22,
              italics: true
            }
          })
        );
      }
    }

    // Company Information
    if (presentationData.companyName) {
      content.push(
        new Paragraph({
          text: presentationData.companyName,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          run: {
            font: 'Times New Roman',
            size: 26,
            bold: true
          }
        })
      );
      if (presentationData.companyAddress) {
        content.push(
          new Paragraph({
            text: presentationData.companyAddress,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          })
        );
      }
      if (presentationData.companyPhone) {
        content.push(
          new Paragraph({
            text: `Tel: ${presentationData.companyPhone}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          })
        );
      }
      if (presentationData.companyWebsite) {
        content.push(
          new Paragraph({
            text: presentationData.companyWebsite,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        );
      }
    }

    // Page break after title
    content.push(new Paragraph({ children: [new PageBreak()] }));

    // Generate sections based on template type
    Object.entries(sections).forEach(([sectionId, sectionData]: [string, any]) => {
      if (!sectionData || Object.keys(sectionData).length === 0) return;

      // Section title
      content.push(
        new Paragraph({
          text: this.getSectionTitle(sectionId),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      // Section content
      const sectionContent = this.generateSectionContent(sectionId, sectionData);
      content.push(...sectionContent);
    });

    return content;
  }

  /**
   * Generate content for a specific section
   */
  private static generateSectionContent(sectionId: string, sectionData: any): (Paragraph | Table)[] {
    const content: (Paragraph | Table)[] = [];

    // Special handling for Direct Comparison (Méthode de Parité) section
    if (sectionId === 'methode_parite' && sectionData.subject && sectionData.comparables) {
      const tableContent = this.generateDirectComparisonTable(sectionData);
      content.push(...tableContent);
      return content;
    }

    // Handle narrative sections (HTML content)
    if (sectionData.description && typeof sectionData.description === 'string') {
      // Strip HTML tags and create paragraphs
      const text = sectionData.description.replace(/<[^>]*>/g, '');
      const paragraphs = text.split('\n').filter((p: string) => p.trim());

      paragraphs.forEach((para: string) => {
        content.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED
          })
        );
      });
    }

    // Handle structured data fields
    Object.entries(sectionData).forEach(([key, value]) => {
      if (key === 'description' || key === 'completed' || !value) return;

      if (typeof value === 'string' || typeof value === 'number') {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${this.formatFieldName(key)}: `,
                bold: true
              }),
              new TextRun({
                text: String(value)
              })
            ],
            spacing: { after: 120 }
          })
        );
      }
    });

    // Add spacing after section
    content.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 }
      })
    );

    return content;
  }

  /**
   * Generate Direct Comparison table for Word document
   */
  private static generateDirectComparisonTable(data: any): (Paragraph | Table)[] {
    const content: (Paragraph | Table)[] = [];
    const { subject, comparables = [] } = data;

    if (!subject || comparables.length === 0) {
      content.push(
        new Paragraph({
          text: 'No comparison data available.',
          spacing: { after: 200 }
        })
      );
      return content;
    }

    // Define row fields to display
    const fields = [
      { key: 'address', label: 'Address' },
      { key: 'dataSource', label: 'Data Source' },
      { key: 'saleDate', label: 'Sale Date' },
      { key: 'salePrice', label: 'Sale Price', format: 'currency' },
      { key: 'daysOnMarket', label: 'Days on Market' },
      { key: 'location', label: 'Location' },
      { key: 'lotSize', label: 'Lot Size' },
      { key: 'buildingType', label: 'Building Type' },
      { key: 'designStyle', label: 'Design Style' },
      { key: 'age', label: 'Age' },
      { key: 'condition', label: 'Condition' },
      { key: 'livingArea', label: 'Living Area' },
      { key: 'roomsTotal', label: 'Total Rooms' },
      { key: 'roomsBedrooms', label: 'Bedrooms' },
      { key: 'roomsBathrooms', label: 'Bathrooms' },
      { key: 'basement', label: 'Basement' },
      { key: 'parking', label: 'Parking' },
      { key: 'quality', label: 'Quality' },
      { key: 'extras', label: 'Extras' }
    ];

    // Summary rows
    const summaryFields = [
      { key: 'totalAdjustment', label: 'Total Adjustment', format: 'currency' },
      { key: 'adjustedValue', label: 'Adjusted Value', format: 'currency' },
      { key: 'grossAdjustmentPercent', label: 'Gross Adjustment %', format: 'percent' },
      { key: 'netAdjustmentPercent', label: 'Net Adjustment %', format: 'percent' }
    ];

    // Create table rows
    const tableRows: TableRow[] = [];

    // Header row
    const headerCells: TableCell[] = [
      new TableCell({
        children: [new Paragraph({ text: 'Elements of Comparison', alignment: AlignmentType.CENTER })],
        shading: { fill: '1976D2' },
        width: { size: 20, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ text: 'Subject', alignment: AlignmentType.CENTER })],
        shading: { fill: '2196F3' },
        width: { size: 15, type: WidthType.PERCENTAGE }
      })
    ];

    // Add comparable headers
    comparables.forEach((_: any, index: number) => {
      headerCells.push(
        new TableCell({
          children: [new Paragraph({ text: `Comp ${index + 1}`, alignment: AlignmentType.CENTER })],
          shading: { fill: 'FF9800' },
          columnSpan: 2,
          width: { size: 65 / comparables.length, type: WidthType.PERCENTAGE }
        })
      );
    });

    tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

    // Data rows
    fields.forEach(field => {
      const cells: TableCell[] = [];

      // Label cell
      cells.push(
        new TableCell({
          children: [new Paragraph({ text: field.label, run: { bold: true, size: 18 } })],
          shading: { fill: 'f5f5f5' }
        })
      );

      // Subject data cell
      const subjectValue = subject[field.key] || '';
      cells.push(
        new TableCell({
          children: [new Paragraph({
            text: this.formatCellValue(subjectValue, field.format),
            alignment: AlignmentType.LEFT,
            run: { size: 18 }
          })]
        })
      );

      // Comparable cells (Data + Adjustment)
      comparables.forEach((comp: any) => {
        const compValue = comp[field.key] || '';
        const adjKey = `adjustment${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const adjValue = comp[adjKey] || 0;

        // Data cell
        cells.push(
          new TableCell({
            children: [new Paragraph({
              text: this.formatCellValue(compValue, field.format),
              alignment: AlignmentType.LEFT,
              run: { size: 18 }
            })]
          })
        );

        // Adjustment cell
        cells.push(
          new TableCell({
            children: [new Paragraph({
              text: adjValue !== 0 ? this.formatCellValue(adjValue, 'adjustment') : '',
              alignment: AlignmentType.RIGHT,
              run: { size: 18 }
            })],
            shading: { fill: 'fff5f8' }
          })
        );
      });

      tableRows.push(new TableRow({ children: cells }));
    });

    // Summary rows
    summaryFields.forEach(field => {
      const cells: TableCell[] = [];

      // Label cell
      cells.push(
        new TableCell({
          children: [new Paragraph({ text: field.label, run: { bold: true, size: 20 } })],
          shading: { fill: 'e3f2fd' }
        })
      );

      // Subject cell (empty for summary rows)
      cells.push(
        new TableCell({
          children: [new Paragraph({ text: '' })],
          shading: { fill: 'e3f2fd' }
        })
      );

      // Comparable cells
      comparables.forEach((comp: any) => {
        const value = comp[field.key] || 0;

        // Merged cell for summary value
        cells.push(
          new TableCell({
            children: [new Paragraph({
              text: this.formatCellValue(value, field.format),
              alignment: AlignmentType.RIGHT,
              run: { bold: true, size: 20 }
            })],
            columnSpan: 2,
            shading: { fill: 'e8eaf6' }
          })
        );
      });

      tableRows.push(new TableRow({ children: cells }));
    });

    // Create the table
    const table = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' }
      }
    });

    // Add spacing before table
    content.push(
      new Paragraph({
        text: '',
        spacing: { before: 200, after: 100 }
      })
    );

    // Add the table
    content.push(table);

    // Add spacing after table
    content.push(
      new Paragraph({
        text: '',
        spacing: { before: 100, after: 400 }
      })
    );

    return content;
  }

  /**
   * Format cell value based on type
   */
  private static formatCellValue(value: any, format?: string): string {
    if (!value && value !== 0) return '';

    if (format === 'currency') {
      const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (isNaN(num)) return '';
      return `$${num.toLocaleString()}`;
    }

    if (format === 'adjustment') {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(num) || num === 0) return '';
      return num > 0 ? `+$${num.toLocaleString()}` : `-$${Math.abs(num).toLocaleString()}`;
    }

    if (format === 'percent') {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(num)) return '';
      return `${num.toFixed(2)}%`;
    }

    return String(value);
  }

  /**
   * Format section ID to readable title
   */
  private static getSectionTitle(sectionId: string): string {
    const titles: Record<string, string> = {
      presentation: 'PRÉSENTATION',
      fiche_reference: 'FICHE DE RÉFÉRENCE',
      quartier: 'QUARTIER',
      site: 'SITE',
      ameliorations: 'AMÉLIORATIONS',
      methode_parite: 'MÉTHODE DE PARITÉ',
      conciliation: 'CONCILIATION',
      general: 'GÉNÉRALITÉS',
      description: 'DESCRIPTION',
      conclusion_comparaison: 'CONCLUSION',
      voisinage: 'VOISINAGE',
      emplacement: 'EMPLACEMENT',
      utilisation_optimale: 'UTILISATION OPTIMALE',
      historique_ventes: 'HISTORIQUE DES VENTES',
      duree_exposition: 'DURÉE D\'EXPOSITION',
      conciliation_estimation: 'CONCILIATION DE L\'ESTIMATION'
    };

    return titles[sectionId] || sectionId.replace(/_/g, ' ').toUpperCase();
  }

  /**
   * Format field name to readable label
   */
  private static formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  /**
   * Export document as Word file
   */
  static async exportToWord(data: AppraisalDocumentData, filename?: string): Promise<void> {
    const Packer = (await import('docx')).Packer;

    const doc = await this.generateDocument(data);

    const blob = await Packer.toBlob(doc);

    const fileName = filename || `Appraisal_${data.appraisalData.address}_${new Date().toISOString().split('T')[0]}.docx`;

    saveAs(blob, fileName);
  }

  /**
   * Generate HTML preview with professional styling
   */
  static generateHTMLPreview(data: AppraisalDocumentData): string {
    const { sections, appraisalData } = data;

    let html = `
      <div class="appraisal-document">
        <style>
          .appraisal-document {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #1a1a1a;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }

          .appraisal-document h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin: 2em 0 1em 0;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .appraisal-document h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 1.5em 0 0.5em 0;
            color: #2c2c2c;
            border-bottom: 2px solid #333;
            padding-bottom: 0.3em;
          }

          .appraisal-document h3 {
            font-size: 13pt;
            font-weight: bold;
            margin: 1em 0 0.5em 0;
            color: #404040;
          }

          .appraisal-document p {
            margin: 0.5em 0;
            text-align: justify;
            text-indent: 0.5in;
          }

          .appraisal-document .field-label {
            font-weight: bold;
            display: inline-block;
            min-width: 150px;
          }

          .appraisal-document .title-page {
            text-align: center;
            padding: 4in 0 2in 0;
          }

          .appraisal-document .title-page h1 {
            font-size: 20pt;
            margin-bottom: 1em;
          }

          .appraisal-document .title-page .address {
            font-size: 16pt;
            font-weight: bold;
            margin: 1em 0;
          }

          .appraisal-document .title-page .city {
            font-size: 14pt;
            margin: 0.5em 0;
          }

          .appraisal-document .title-page .metadata {
            font-size: 12pt;
            margin: 0.5em 0;
            color: #666;
          }

          .appraisal-document table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
          }

          .appraisal-document table th,
          .appraisal-document table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }

          .appraisal-document table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }

          .appraisal-document .header {
            text-align: right;
            font-size: 10pt;
            color: #666;
            margin-bottom: 2em;
          }

          .appraisal-document .footer {
            text-align: center;
            font-size: 9pt;
            color: #999;
            margin-top: 2em;
            padding-top: 1em;
            border-top: 1px solid #ddd;
          }
        </style>

        <div class="header">APPRAISAL REPORT</div>

        <div class="title-page">
          <h1>${sections.presentation?.reportTitle || 'RAPPORT D\'ÉVALUATION IMMOBILIÈRE'}</h1>

          ${sections.presentation?.propertyPhotoUrl ? `
            <div style="margin: 2em auto; max-width: 400px;">
              <img src="${sections.presentation.propertyPhotoUrl}" alt="Property" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
            </div>
          ` : ''}

          <div class="address">${sections.presentation?.fullAddress || appraisalData.address || ''}</div>
          <div class="city">${sections.presentation?.city || appraisalData.city || ''}${sections.presentation?.province ? ', ' + sections.presentation.province : ''} ${sections.presentation?.postalCode || ''}</div>
          <div class="metadata">Date: ${new Date().toLocaleDateString('fr-CA')}</div>
          <div class="metadata">File Number: ${sections.presentation?.fileNumber || appraisalData.file_number || 'N/A'}</div>

          ${sections.presentation?.clientName ? `
            <div style="margin-top: 2em;">
              <div class="metadata" style="font-size: 13pt; color: #333; font-weight: 600;">Client / Borrower</div>
              <div class="metadata" style="font-size: 12pt; color: #555;">${sections.presentation.clientName}</div>
            </div>
          ` : ''}

          ${sections.presentation?.appraiserName || sections.presentation?.appraiserTitle ? `
            <div style="margin-top: 2em;">
              <div class="metadata" style="font-size: 13pt; color: #333; font-weight: 600;">Appraiser</div>
              <div class="metadata" style="font-size: 12pt; color: #555;">${sections.presentation?.appraiserName || ''}</div>
              ${sections.presentation?.appraiserTitle ? `<div class="metadata" style="font-size: 11pt; color: #666; font-style: italic;">${sections.presentation.appraiserTitle}</div>` : ''}
            </div>
          ` : ''}

          ${sections.presentation?.companyLogoUrl ? `
            <div style="margin: 2em auto; max-width: 200px;">
              <img src="${sections.presentation.companyLogoUrl}" alt="Company Logo" style="width: 100%; height: auto; max-height: 80px; object-fit: contain;" />
            </div>
          ` : ''}

          ${sections.presentation?.companyName ? `
            <div style="margin-top: 2em;">
              <div class="metadata" style="font-size: 14pt; color: #333; font-weight: 700;">${sections.presentation.companyName}</div>
              ${sections.presentation?.companyAddress ? `<div class="metadata" style="font-size: 11pt; color: #666;">${sections.presentation.companyAddress}</div>` : ''}
              ${sections.presentation?.companyPhone ? `<div class="metadata" style="font-size: 11pt; color: #666;">Tel: ${sections.presentation.companyPhone}</div>` : ''}
              ${sections.presentation?.companyWebsite ? `<div class="metadata" style="font-size: 11pt; color: #666;">${sections.presentation.companyWebsite}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <div style="page-break-after: always;"></div>
    `;

    // Generate sections
    Object.entries(sections).forEach(([sectionId, sectionData]: [string, any]) => {
      if (!sectionData || Object.keys(sectionData).length === 0) return;

      html += `<h2>${this.getSectionTitle(sectionId)}</h2>`;

      // Special handling for Direct Comparison section
      if (sectionId === 'methode_parite' && sectionData.subject && sectionData.comparables) {
        html += this.generateDirectComparisonTableHTML(sectionData);
        return;
      }

      // Handle narrative content
      if (sectionData.description) {
        html += `<div class="narrative-content">${sectionData.description}</div>`;
      }

      // Handle structured fields
      Object.entries(sectionData).forEach(([key, value]) => {
        if (key === 'description' || key === 'completed' || !value) return;

        if (typeof value === 'string' || typeof value === 'number') {
          html += `<p><span class="field-label">${this.formatFieldName(key)}:</span> ${value}</p>`;
        }
      });
    });

    html += `
        <div class="footer">Confidential Report - Valea Max</div>
      </div>
    `;

    return html;
  }

  /**
   * Generate HTML table for Direct Comparison section
   */
  private static generateDirectComparisonTableHTML(data: any): string {
    const { subject, comparables = [] } = data;

    if (!subject || comparables.length === 0) {
      return '<p>No comparison data available.</p>';
    }

    // Define row fields to display
    const fields = [
      { key: 'address', label: 'Address' },
      { key: 'dataSource', label: 'Data Source' },
      { key: 'saleDate', label: 'Sale Date' },
      { key: 'salePrice', label: 'Sale Price', format: 'currency' },
      { key: 'daysOnMarket', label: 'Days on Market' },
      { key: 'location', label: 'Location' },
      { key: 'lotSize', label: 'Lot Size' },
      { key: 'buildingType', label: 'Building Type' },
      { key: 'designStyle', label: 'Design Style' },
      { key: 'age', label: 'Age' },
      { key: 'condition', label: 'Condition' },
      { key: 'livingArea', label: 'Living Area' },
      { key: 'roomsTotal', label: 'Total Rooms' },
      { key: 'roomsBedrooms', label: 'Bedrooms' },
      { key: 'roomsBathrooms', label: 'Bathrooms' },
      { key: 'basement', label: 'Basement' },
      { key: 'parking', label: 'Parking' },
      { key: 'quality', label: 'Quality' },
      { key: 'extras', label: 'Extras' }
    ];

    // Summary rows
    const summaryFields = [
      { key: 'totalAdjustment', label: 'Total Adjustment', format: 'currency' },
      { key: 'adjustedValue', label: 'Adjusted Value', format: 'currency' },
      { key: 'grossAdjustmentPercent', label: 'Gross Adjustment %', format: 'percent' },
      { key: 'netAdjustmentPercent', label: 'Net Adjustment %', format: 'percent' }
    ];

    let html = '<table class="comparison-table" style="font-size: 9pt; margin: 1.5em 0;">';

    // Header row
    html += '<thead><tr>';
    html += '<th style="background: #1976D2; color: white; padding: 6px 8px; text-align: center; font-weight: 600; font-size: 10pt;">Elements of Comparison</th>';
    html += '<th style="background: #2196F3; color: white; padding: 6px 8px; text-align: center; font-weight: 600; font-size: 10pt;">Subject</th>';

    comparables.forEach((_: any, index: number) => {
      html += `<th colspan="2" style="background: #FF9800; color: white; padding: 6px 8px; text-align: center; font-weight: 600; font-size: 10pt;">Comparable ${index + 1}</th>`;
    });

    html += '</tr>';

    // Sub-header for comparables (Data / Adj columns)
    html += '<tr>';
    html += '<th style="background: #f5f5f5; padding: 4px 6px;"></th>';
    html += '<th style="background: #f5f5f5; padding: 4px 6px;"></th>';

    comparables.forEach(() => {
      html += '<th style="background: #fff9f5; padding: 4px 6px; text-align: center; font-size: 8pt; font-weight: 600;">Description</th>';
      html += '<th style="background: #fff5f8; padding: 4px 6px; text-align: center; font-size: 8pt; font-weight: 600;">Adj. ($)</th>';
    });

    html += '</tr></thead><tbody>';

    // Data rows
    fields.forEach(field => {
      html += '<tr>';

      // Label cell
      html += `<td style="background: #fafafa; padding: 4px 6px; font-weight: 600; border-right: 2px solid #e0e0e0; font-size: 9pt;">${field.label}</td>`;

      // Subject data cell
      const subjectValue = subject[field.key] || '';
      html += `<td style="background: #f5f9ff; padding: 4px 6px; font-size: 9pt;">${this.formatCellValue(subjectValue, field.format)}</td>`;

      // Comparable cells
      comparables.forEach((comp: any) => {
        const compValue = comp[field.key] || '';
        const adjKey = `adjustment${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const adjValue = comp[adjKey] || 0;

        // Data cell
        html += `<td style="background: #fff9f5; padding: 4px 6px; font-size: 9pt;">${this.formatCellValue(compValue, field.format)}</td>`;

        // Adjustment cell
        const adjText = adjValue !== 0 ? this.formatCellValue(adjValue, 'adjustment') : '';
        const adjColor = adjValue > 0 ? '#2e7d32' : (adjValue < 0 ? '#c62828' : 'inherit');
        html += `<td style="background: #fff5f8; padding: 4px 6px; text-align: right; color: ${adjColor}; font-weight: ${adjValue !== 0 ? '600' : 'normal'}; font-size: 9pt;">${adjText}</td>`;
      });

      html += '</tr>';
    });

    // Summary rows
    summaryFields.forEach(field => {
      const isTotalAdj = field.key === 'totalAdjustment';
      const isAdjValue = field.key === 'adjustedValue';
      const isGross = field.key === 'grossAdjustmentPercent';
      const isNet = field.key === 'netAdjustmentPercent';

      const borderColor = isTotalAdj ? '#1976D2' : (isAdjValue ? '#4CAF50' : (isGross ? '#FF9800' : '#9C27B0'));
      const borderStyle = `border-top: 2px solid ${borderColor}; border-bottom: 2px solid ${borderColor};`;

      html += '<tr>';

      // Label cell
      html += `<td style="background: #e3f2fd; padding: 6px 8px; font-weight: 700; font-size: 10pt; ${borderStyle}">${field.label}</td>`;

      // Subject cell (empty for summary)
      html += `<td style="background: #e3f2fd; padding: 6px 8px; ${borderStyle}"></td>`;

      // Comparable cells
      comparables.forEach((comp: any) => {
        const value = comp[field.key] || 0;
        const formattedValue = this.formatCellValue(value, field.format);
        const textColor = isTotalAdj ? (value > 0 ? '#2e7d32' : '#c62828') : (isAdjValue ? '#2e7d32' : borderColor);

        html += `<td colspan="2" style="background: #e8eaf6; padding: 6px 8px; text-align: right; font-weight: 700; font-size: 10pt; color: ${textColor}; ${borderStyle}">${formattedValue}</td>`;
      });

      html += '</tr>';
    });

    html += '</tbody></table>';

    return html;
  }
}
