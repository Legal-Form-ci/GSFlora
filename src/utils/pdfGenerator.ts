import jsPDF from 'jspdf';

interface PDFOptions {
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

// Helper function to convert markdown-like content to plain text with formatting
const parseContent = (content: string): { text: string; style: 'normal' | 'bold' | 'italic' | 'h1' | 'h2' | 'h3' }[] => {
  const lines: { text: string; style: 'normal' | 'bold' | 'italic' | 'h1' | 'h2' | 'h3' }[] = [];
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('### ')) {
      lines.push({ text: trimmed.slice(4), style: 'h3' });
    } else if (trimmed.startsWith('## ')) {
      lines.push({ text: trimmed.slice(3), style: 'h2' });
    } else if (trimmed.startsWith('# ')) {
      lines.push({ text: trimmed.slice(2), style: 'h1' });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      lines.push({ text: trimmed.slice(2, -2), style: 'bold' });
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      lines.push({ text: trimmed.slice(1, -1), style: 'italic' });
    } else {
      // Clean up markdown syntax
      const cleaned = trimmed
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      lines.push({ text: cleaned, style: 'normal' });
    }
  });
  
  return lines;
};

export const generatePDF = async (options: PDFOptions): Promise<Blob> => {
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

  // Create A4 PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function for text wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      if (y + index * lineHeight > pageHeight - 30) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
  };

  // Check for new page
  const checkNewPage = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
      addFooter();
    }
  };

  // Add header
  const addHeader = () => {
    // School name - centered
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(schoolName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Divider line
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Info row
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Année scolaire: ${schoolYear}`, margin, yPosition);
    pdf.text(`Classe: ${className}`, pageWidth / 2 - 20, yPosition);
    pdf.text(`Date: ${date}`, pageWidth - margin - 30, yPosition);
    yPosition += 6;

    pdf.text(`Matière: ${subject}`, margin, yPosition);
    pdf.text(`Niveau: ${level}`, pageWidth / 2 - 20, yPosition);
    pdf.text(`Enseignant: ${teacherName}`, pageWidth - margin - 40, yPosition);
    yPosition += 10;

    // Type label
    const typeLabels = {
      course: 'COURS',
      assignment: 'DEVOIR',
      quiz: 'QUIZ',
    };
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(typeLabels[type], pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Title
    pdf.setFontSize(16);
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    // Underline title
    const titleWidth = pdf.getTextWidth(title);
    pdf.setLineWidth(0.3);
    pdf.line((pageWidth - titleWidth) / 2, yPosition, (pageWidth + titleWidth) / 2, yPosition);
    yPosition += 12;
  };

  // Add footer
  const addFooter = () => {
    const currentPage = pdf.internal.pages.length - 1;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `${schoolName} - Page ${currentPage}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Start building PDF
  addHeader();

  // Parse and add content
  const parsedLines = parseContent(content);
  
  for (const line of parsedLines) {
    if (!line.text.trim()) {
      yPosition += 4;
      continue;
    }

    checkNewPage(10);

    switch (line.style) {
      case 'h1':
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(line.text, margin, yPosition, contentWidth, 7);
        yPosition += 4;
        break;
      case 'h2':
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(line.text, margin, yPosition, contentWidth, 6);
        yPosition += 3;
        break;
      case 'h3':
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(line.text, margin, yPosition, contentWidth, 6);
        yPosition += 2;
        break;
      case 'bold':
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        yPosition = addWrappedText(line.text, margin, yPosition, contentWidth, 5);
        break;
      case 'italic':
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        yPosition = addWrappedText(line.text, margin, yPosition, contentWidth, 5);
        break;
      default:
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addWrappedText(line.text, margin, yPosition, contentWidth, 5);
    }

    yPosition += 2;
  }

  // Add footer to all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `${schoolName} - Page ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return pdf.output('blob');
};

export const downloadPDF = async (options: PDFOptions): Promise<void> => {
  const blob = await generatePDF(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.type}_${options.title.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
