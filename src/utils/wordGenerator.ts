import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, NumberFormat, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface WordOptions {
  title: string;
  subject: string;
  className: string;
  level: string;
  teacherName: string;
  schoolName: string;
  content: string;
  type: 'course' | 'assignment' | 'quiz';
  schoolYear?: string;
  date?: string;
}

// Convert markdown-like content to docx paragraphs
const parseContentToDocx = (content: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    
    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
      return;
    }
    
    if (trimmed.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: trimmed.slice(4), bold: true, size: 24 })],
        spacing: { before: 200, after: 100 },
      }));
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: trimmed.slice(3), bold: true, size: 28 })],
        spacing: { before: 300, after: 150 },
      }));
    } else if (trimmed.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: trimmed.slice(2), bold: true, size: 32 })],
        spacing: { before: 400, after: 200 },
      }));
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      paragraphs.push(new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: trimmed.slice(2), size: 22 })],
        spacing: { after: 50 },
      }));
    } else {
      // Clean up markdown syntax
      const cleaned = trimmed
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: cleaned, size: 22 })],
        spacing: { after: 100 },
        alignment: AlignmentType.JUSTIFIED,
      }));
    }
  });
  
  return paragraphs;
};

export const generateWord = async (options: WordOptions): Promise<Blob> => {
  const {
    title,
    subject,
    className,
    level,
    teacherName,
    schoolName,
    content,
    type,
    schoolYear = '2024-2025',
    date = new Date().toLocaleDateString('fr-FR'),
  } = options;

  const typeLabels = {
    course: 'COURS',
    assignment: 'DEVOIR',
    quiz: 'QUIZ',
  };

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch = 1440 twips
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: schoolName, bold: true, size: 28 }),
              ],
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
              },
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Année scolaire: ${schoolYear}`, size: 18 }),
                new TextRun({ text: '    |    ', size: 18 }),
                new TextRun({ text: `Classe: ${className}`, size: 18 }),
                new TextRun({ text: '    |    ', size: 18 }),
                new TextRun({ text: `Date: ${date}`, size: 18 }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Matière: ${subject}`, size: 18 }),
                new TextRun({ text: '    |    ', size: 18 }),
                new TextRun({ text: `Niveau: ${level}`, size: 18 }),
                new TextRun({ text: '    |    ', size: 18 }),
                new TextRun({ text: `Enseignant: ${teacherName}`, size: 18 }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${schoolName} - Page `, size: 16 }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                }),
                new TextRun({ text: ' / ', size: 16 }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Type label
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({ text: typeLabels[type], bold: true, size: 26 }),
          ],
        }),
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: title, bold: true, size: 36 }),
          ],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 3, color: '000000' },
          },
        }),
        // Content
        ...parseContentToDocx(content),
      ],
    }],
  });

  return await Packer.toBlob(doc);
};

export const downloadWord = async (options: WordOptions): Promise<void> => {
  const blob = await generateWord(options);
  saveAs(blob, `${options.type}_${options.title.replace(/\s+/g, '_')}.docx`);
};
