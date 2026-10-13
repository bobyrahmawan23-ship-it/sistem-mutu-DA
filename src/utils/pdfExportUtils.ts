import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CriterionDefinition, EvaluationRecord, TeacherProfile, CriterionScore } from '../types/competency';
import { CRITERIA_DEFINITIONS, QUALITY_CATEGORIES } from '../data/criteriaData';
import { getStoredReportConfig } from '../types/reportConfig';

export interface PdfExportOptions {
  includeRadar?: boolean;
  includeBar?: boolean;
  includeTable?: boolean;
  includeRecommendations?: boolean;
  includeSignatures?: boolean;
  orientation?: 'portrait' | 'landscape';
  customTitle?: string;
}

/**
 * Capture an HTML or SVG element and return an image data URL with high crispness.
 */
export async function captureElementAsImage(
  element: HTMLElement,
  options: { scale?: number; backgroundColor?: string } = {}
): Promise<{ dataUrl: string; width: number; height: number }> {
  const scale = options.scale ?? 2.5;
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: options.backgroundColor ?? '#ffffff',
    useCORS: true,
    logging: false,
    allowTaint: true,
  });

  return {
    dataUrl: canvas.toDataURL('image/png', 1.0),
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Generates and downloads a complete, professional PDF report containing
 * Radar and Bar charts for any teacher profile using jsPDF and html2canvas.
 */
export async function generateTeacherChartsPdf({
  teacher,
  evaluation,
  benchmarkScores,
  containerElement,
  radarElementId,
  barElementId,
  options = {},
  onProgress,
}: {
  teacher: TeacherProfile;
  evaluation: EvaluationRecord;
  benchmarkScores?: CriterionScore[];
  containerElement?: HTMLElement | null;
  radarElementId?: string;
  barElementId?: string;
  options?: PdfExportOptions;
  onProgress?: (status: string) => void;
}): Promise<void> {
  const {
    includeRadar = true,
    includeBar = true,
    includeTable = true,
    includeRecommendations = true,
    includeSignatures = true,
    orientation = 'portrait',
  } = options;

  onProgress?.('Menyiapkan dokumen PDF...');

  const config = getStoredReportConfig();
  const categoryMeta = QUALITY_CATEGORIES[evaluation.qualityCategory];

  // If a dedicated printable container is passed, we can capture it directly
  if (containerElement) {
    onProgress?.('Merender grafik ke kanvas resolusi tinggi...');
    const { dataUrl, width, height } = await captureElementAsImage(containerElement, {
      scale: 2.5,
      backgroundColor: '#ffffff',
    });

    onProgress?.('Menyusun halaman PDF...');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printableWidth = pageWidth - margin * 2;
    const renderedHeight = (height * printableWidth) / width;

    if (renderedHeight <= pageHeight - margin * 2) {
      pdf.addImage(dataUrl, 'PNG', margin, margin, printableWidth, renderedHeight, undefined, 'FAST');
    } else {
      // Multi-page slicing
      let positionY = 0;
      let remainingHeight = renderedHeight;
      const contentHeightPerPage = pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addImage(
          dataUrl,
          'PNG',
          margin,
          margin - positionY,
          printableWidth,
          renderedHeight,
          undefined,
          'FAST'
        );

        remainingHeight -= contentHeightPerPage;
        positionY += contentHeightPerPage;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    const safeFilename = `Laporan_Grafik_${teacher.name.replace(/\s+/g, '_')}_${evaluation.periodName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    onProgress?.('Mengunduh file PDF...');
    pdf.save(safeFilename);
    return;
  }

  // Fallback programmatic generation with jsPDF and element capture
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  let cursorY = 15;

  // Header
  pdf.setFillColor(4, 120, 87); // Emerald 700
  pdf.rect(12, cursorY, 14, 14, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(config.logoInitials, 19, cursorY + 9, { align: 'center' });

  pdf.setTextColor(6, 78, 59); // Emerald 950
  pdf.setFontSize(14);
  pdf.text(config.institutionName, 30, cursorY + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(config.institutionSub, 30, cursorY + 9.5);
  pdf.text(config.institutionContact, 30, cursorY + 13.5);

  cursorY += 18;
  pdf.setDrawColor(4, 120, 87);
  pdf.setLineWidth(0.8);
  pdf.line(12, cursorY, pageWidth - 12, cursorY);

  cursorY += 6;
  pdf.setFillColor(236, 253, 245);
  pdf.roundedRect(12, cursorY, pageWidth - 24, 8, 2, 2, 'F');
  pdf.setTextColor(6, 95, 70);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('LAPORAN GRAFIK MUTU & KOMPETENSI GURU AL-QUR\'AN (RADAR & BAR)', pageWidth / 2, cursorY + 5.5, {
    align: 'center',
  });

  cursorY += 12;

  // Teacher Info Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(12, cursorY, pageWidth - 24, 22, 2, 2, 'FD');

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Nama Guru: ${teacher.name}, ${teacher.title}`, 16, cursorY + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`NIP: ${teacher.nip}`, 16, cursorY + 11);
  pdf.text(`Unit/Kelas: ${teacher.unit} (${teacher.teachingClass})`, 16, cursorY + 16);

  pdf.text(`Periode: ${evaluation.periodName}`, 110, cursorY + 6);
  pdf.text(`Tanggal Asesmen: ${evaluation.evaluationDate}`, 110, cursorY + 11);
  pdf.text(
    `Hafalan: ${teacher.hafalanCountJuz} Juz Mutqin | ${teacher.certifiedMaqdis ? 'Tersertifikasi Maqdis' : 'Belum Sertifikasi'}`,
    110,
    cursorY + 16
  );

  // Score badge
  pdf.setFillColor(4, 120, 87);
  pdf.roundedRect(pageWidth - 38, cursorY + 3, 22, 16, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(`${evaluation.overallScore}`, pageWidth - 27, cursorY + 10, { align: 'center' });
  pdf.setFontSize(6.5);
  pdf.text(categoryMeta.label, pageWidth - 27, cursorY + 15, { align: 'center' });

  cursorY += 26;

  // 1. Radar Chart Capture
  if (includeRadar && radarElementId) {
    onProgress?.('Mengonversi Grafik Radar Spider...');
    const radarEl = document.getElementById(radarElementId);
    if (radarEl) {
      const { dataUrl } = await captureElementAsImage(radarEl, { scale: 2.5 });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('1. Poligon Radar 9 Parameter Kompetensi Guru', 12, cursorY + 4);
      cursorY += 6;

      const chartWidth = 95;
      const chartHeight = 85;
      pdf.addImage(dataUrl, 'PNG', 12, cursorY, chartWidth, chartHeight, undefined, 'FAST');
    }
  }

  // 2. Bar Chart Capture
  if (includeBar && barElementId) {
    onProgress?.('Mengonversi Grafik Bar & Benchmark...');
    const barEl = document.getElementById(barElementId);
    if (barEl) {
      const { dataUrl } = await captureElementAsImage(barEl, { scale: 2.5 });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text('2. Perbandingan Nilai Guru vs Benchmark Lembaga', 110, cursorY - 2);

      const chartWidth = 88;
      const chartHeight = 85;
      pdf.addImage(dataUrl, 'PNG', 110, cursorY, chartWidth, chartHeight, undefined, 'FAST');
    }
  }

  cursorY += 92;

  // 3. Table of 9 Criteria
  if (includeTable) {
    onProgress?.('Menyusun tabel rincian nilai 9 indikator...');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('3. Rincian Skor Objektif 9 Indikator Mutu', 12, cursorY + 2);
    cursorY += 5;

    // Table Header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(12, cursorY, pageWidth - 24, 6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text('KODE', 15, cursorY + 4.2);
    pdf.text('PARAMETER KOMPETENSI', 30, cursorY + 4.2);
    pdf.text('BOBOT', 115, cursorY + 4.2);
    pdf.text('SKOR', 135, cursorY + 4.2);
    pdf.text('STATUS & MUTU', 155, cursorY + 4.2);
    cursorY += 6;

    CRITERIA_DEFINITIONS.forEach((crit, index) => {
      const scoreObj = evaluation.scores.find((s) => s.criterionId === crit.id);
      const score = scoreObj ? scoreObj.score : 0;
      const isAlt = index % 2 === 1;

      if (isAlt) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(12, cursorY, pageWidth - 24, 5.5, 'F');
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(4, 120, 87);
      pdf.text(crit.code, 15, cursorY + 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      pdf.text(crit.name, 30, cursorY + 4);

      pdf.text(`${crit.weight}%`, 117, cursorY + 4);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${score}`, 137, cursorY + 4);

      const statusText = score >= 89 ? 'Mumtaz' : score >= 76 ? 'Jayyid Jiddan' : score >= 60 ? 'Jayyid' : 'Perlu Pembinaan';
      pdf.setFont('helvetica', 'normal');
      pdf.text(statusText, 155, cursorY + 4);

      cursorY += 5.5;
    });
  }

  // 4. Recommendations & Strengths
  if (includeRecommendations && cursorY < 235) {
    cursorY += 4;
    pdf.setFillColor(236, 253, 245);
    pdf.roundedRect(12, cursorY, (pageWidth - 28) / 2, 20, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(6, 95, 70);
    pdf.text('Pilar Keunggulan:', 15, cursorY + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(7);
    evaluation.strengths.slice(0, 2).forEach((s, idx) => {
      pdf.text(`• ${s.slice(0, 50)}`, 15, cursorY + 10 + idx * 4.5);
    });

    const col2X = 12 + (pageWidth - 28) / 2 + 4;
    pdf.setFillColor(254, 243, 199);
    pdf.roundedRect(col2X, cursorY, (pageWidth - 28) / 2, 20, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(146, 64, 14);
    pdf.text('Rekomendasi Mutu:', col2X + 3, cursorY + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(7);
    evaluation.recommendedPrograms.slice(0, 2).forEach((r, idx) => {
      pdf.text(`• ${r.slice(0, 50)}`, col2X + 3, cursorY + 10 + idx * 4.5);
    });

    cursorY += 24;
  }

  // 5. Signatures
  if (includeSignatures && cursorY < 265) {
    cursorY += 3;
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);

    const sigColWidth = (pageWidth - 24) / 3;

    // Guru
    pdf.text(config.teacherSignHeading, 12 + sigColWidth * 0.5, cursorY, { align: 'center' });
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${teacher.name}, ${teacher.title}`, 12 + sigColWidth * 0.5, cursorY + 15, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(`NIP: ${teacher.nip}`, 12 + sigColWidth * 0.5, cursorY + 18.5, { align: 'center' });

    // Supervisor
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${config.cityLocation}, ${evaluation.evaluationDate}`, 12 + sigColWidth * 1.5, cursorY - 3, { align: 'center' });
    pdf.text(config.supervisorTitle, 12 + sigColWidth * 1.5, cursorY, { align: 'center' });
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(config.supervisorName || evaluation.evaluatorName, 12 + sigColWidth * 1.5, cursorY + 15, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(config.supervisorNip, 12 + sigColWidth * 1.5, cursorY + 18.5, { align: 'center' });

    // Mudir
    if (config.showMudirSignature) {
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(config.mudirSignHeading, 12 + sigColWidth * 2.5, cursorY - 3, { align: 'center' });
      pdf.text(config.mudirTitle, 12 + sigColWidth * 2.5, cursorY, { align: 'center' });
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(6, 78, 59);
      pdf.text(config.mudirName, 12 + sigColWidth * 2.5, cursorY + 15, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.text(config.mudirNip, 12 + sigColWidth * 2.5, cursorY + 18.5, { align: 'center' });
    }
  }

  // Footer note
  pdf.setFontSize(6);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Dokumen Laporan Resmi MTQ Darul Abidin • Dicetak otomatis pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • Halaman 1 dari 1`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const safeFilename = `Laporan_Grafik_${teacher.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`;
  onProgress?.('Mengunduh dokumen PDF...');
  pdf.save(safeFilename);
}
