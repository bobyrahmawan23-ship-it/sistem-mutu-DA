import { CriterionDefinition, EvaluationRecord, TeacherProfile } from '../types/competency';
import { QUALITY_CATEGORIES } from '../data/criteriaData';

// 1. Export SVG or HTML element as PNG image
export async function exportElementAsPng(
  elementId: string,
  filename: string
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  // If element is an SVG element
  if (element instanceof SVGSVGElement || element.tagName.toLowerCase() === 'svg') {
    const svgData = new XMLSerializer().serializeToString(element);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      img.onload = () => {
        // High resolution 2x
        canvas.width = (element.clientWidth || 600) * 2;
        canvas.height = (element.clientHeight || 450) * 2;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `${filename}.png`;
              link.href = URL.createObjectURL(blob);
              link.click();
              resolve(true);
            } else {
              resolve(false);
            }
          }, 'image/png');
        }
      };
      img.src = url;
    });
  }

  // Fallback: simple trigger
  window.print();
  return true;
}

// 2. Export Parameter evaluation as MS Word document (.doc/.docx readable)
export function exportParameterToWordDoc({
  criterion,
  teacher,
  evaluation,
  score,
  notes,
}: {
  criterion: CriterionDefinition;
  teacher: TeacherProfile;
  evaluation: EvaluationRecord;
  score: number;
  notes?: string;
}): void {
  const cat =
    score >= 89
      ? QUALITY_CATEGORIES.MUMTAZ
      : score >= 76
      ? QUALITY_CATEGORIES.JAYYID_JIDDAN
      : score >= 60
      ? QUALITY_CATEGORIES.JAYYID
      : QUALITY_CATEGORIES.MAQBUL;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Laporan Mutu - ${criterion.name}</title>
      <style>
        body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 3px double #047857; padding-bottom: 12px; margin-bottom: 24px; }
        .header h1 { color: #047857; margin: 0; font-size: 22px; text-transform: uppercase; }
        .header p { color: #64748b; font-size: 13px; margin: 3px 0; }
        .title-badge { background-color: #f0fdf4; color: #166534; font-weight: bold; padding: 6px 12px; border: 1px solid #bbf7d0; display: inline-block; margin-top: 10px; border-radius: 4px; }
        table.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        table.meta-table td { padding: 6px 10px; border: 1px solid #e2e8f0; }
        table.meta-table td.label { font-weight: bold; background-color: #f8fafc; width: 30%; color: #475569; }
        .score-box { background-color: #ecfdf5; border-left: 6px solid #059669; padding: 14px 20px; margin: 20px 0; }
        .score-box .num { font-size: 32px; font-weight: bold; color: #047857; margin: 0; }
        .sub-aspects { margin: 20px 0; }
        .sub-aspects ul { padding-left: 20px; font-size: 13px; line-height: 1.6; }
        .recommendation { background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 5px solid #d97706; padding: 12px 16px; margin: 20px 0; font-size: 13px; }
        .signature { margin-top: 50px; width: 100%; text-align: center; font-size: 13px; }
        .signature td { width: 50%; padding-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MTQ DARUL ABIDIN</h1>
        <p>Lembaga Penjaminan Mutu & Manajemen Pendidikan Al-Qur'an</p>
        <p>Kota Depok, Jawa Barat | Website: darulabidin.sch.id</p>
        <div class="title-badge">LAPORAN MUTU PARAMETER ${criterion.code}: ${criterion.name.toUpperCase()}</div>
      </div>

      <table class="meta-table">
        <tr>
          <td class="label">Nama Guru Al-Qur'an</td>
          <td><strong>${teacher.name}, ${teacher.title}</strong></td>
        </tr>
        <tr>
          <td class="label">NIP / ID Guru</td>
          <td>${teacher.nip}</td>
        </tr>
        <tr>
          <td class="label">Unit & Kelas Binaan</td>
          <td>${teacher.unit} (${teacher.teachingClass})</td>
        </tr>
        <tr>
          <td class="label">Periode Penilaian</td>
          <td>${evaluation.periodName}</td>
        </tr>
        <tr>
          <td class="label">Tanggal Supervisi</td>
          <td>${evaluation.evaluationDate}</td>
        </tr>
        <tr>
          <td class="label">Supervisor Penilai</td>
          <td>${evaluation.evaluatorName} (${evaluation.evaluatorRole})</td>
        </tr>
      </table>

      <div class="score-box">
        <p style="margin:0; font-size: 12px; color: #64748b; text-transform: uppercase;">Perolehan Nilai Indikator (Bobot ${criterion.weight}%)</p>
        <p class="num">${score} / 100</p>
        <p style="margin:4px 0 0 0; font-weight: bold; color: #166534;">Predikat: ${cat.label} (${cat.arabicLabel})</p>
        <p style="margin:4px 0 0 0; font-size: 12px; color: #475569;">${cat.description}</p>
      </div>

      <div class="sub-aspects">
        <h3 style="color: #047857; margin-bottom: 6px; font-size: 15px;">Sub-Sub Aspek yang Dinilai:</h3>
        <ul>
          ${criterion.focusAspects.map((asp) => `<li><strong>${asp}</strong></li>`).join('')}
        </ul>
      </div>

      <div style="margin: 20px 0; font-size: 13px;">
        <h3 style="color: #047857; margin-bottom: 6px; font-size: 15px;">Catatan Kualitatif Supervisor:</h3>
        <p style="background: #f8fafc; padding: 10px; border-left: 3px solid #047857; font-style: italic;">
          "${notes || 'Kompetensi telah dinilai sesuai panduan standarisasi MTQ Darul Abidin.'}"
        </p>
      </div>

      <div class="recommendation">
        <strong style="color: #92400e; display: block; margin-bottom: 4px;">Rekomendasi Tindak Lanjut Mutu:</strong>
        <strong>${criterion.defaultRecommendation.title}</strong><br>
        Tindakan: ${criterion.defaultRecommendation.action}<br>
        Durasi: ${criterion.defaultRecommendation.duration} | Target: ${criterion.defaultRecommendation.targetMilestone}
      </div>

      <table class="signature">
        <tr>
          <td>
            Guru Yang Dinilai,<br><br><br><br>
            <strong>${teacher.name}, ${teacher.title}</strong><br>
            NIP. ${teacher.nip}
          </td>
          <td>
            Depok, ${evaluation.evaluationDate}<br>
            Supervisor / Penguji MTQ,<br><br><br><br>
            <strong>${evaluation.evaluatorName}</strong><br>
            NIP. DA-MTQ-SUP-001
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `Raport_MTQ_${teacher.name.replace(/\s+/g, '_')}_${criterion.code}.doc`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 3. Web Share API helper (for mobile phone sharing)
export async function shareParameterReport({
  title,
  text,
  url = window.location.href,
}: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Web Share failed', err);
      }
      return false;
    }
  }
  return false;
}
