import type { CourseView, StudentView } from "@/backend";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface RegistrationPDFData {
  student: StudentView;
  courses: CourseView[];
  registrationId: string;
  enrollmentId: string;
  totalCredits: number;
  lockedAt?: Date;
}

const CBSE_BLUE = "#1a237e";
const CBSE_BLUE_LIGHT = "#3949ab";

async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 120,
    margin: 1,
    color: { dark: "#1a237e", light: "#ffffff" },
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function generateRegistrationPDF(
  data: RegistrationPDFData,
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 14;
  const contentWidth = W - margin * 2;

  // --- Watermark ---
  doc.saveGraphicsState();
  doc.setTextColor(230, 230, 240);
  doc.setFontSize(56);
  doc.setFont("times", "bold");
  doc.text("OFFICIAL", W / 2, 170, {
    align: "center",
    angle: 45,
    renderingMode: "fill",
  });
  doc.restoreGraphicsState();

  // --- Header bar ---
  const [hr, hg, hb] = hexToRgb(CBSE_BLUE);
  doc.setFillColor(hr, hg, hb);
  doc.rect(0, 0, W, 28, "F");

  // Gradient-like secondary bar
  const [lr, lg, lb] = hexToRgb(CBSE_BLUE_LIGHT);
  doc.setFillColor(lr, lg, lb);
  doc.rect(0, 28, W, 4, "F");

  // Institution name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("times", "bold");
  doc.text("UDKNS Academic Portal", W / 2, 13, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("times", "normal");
  doc.text("Digital India | Academic Excellence", W / 2, 22, {
    align: "center",
  });

  // --- Title ---
  doc.setTextColor(hr, hg, hb);
  doc.setFontSize(13);
  doc.setFont("times", "bold");
  doc.text("Course Registration Slip", W / 2, 43, { align: "center" });

  // Underline
  doc.setDrawColor(hr, hg, hb);
  doc.setLineWidth(0.5);
  doc.line(margin, 46, W - margin, 46);

  let y = 52;

  // --- Student Details Section ---
  doc.setFillColor(240, 242, 255);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setTextColor(hr, hg, hb);
  doc.setFontSize(9);
  doc.setFont("times", "bold");
  doc.text("Student Information", margin + 2, y + 5);
  y += 10;

  const details: [string, string][] = [
    ["Name", data.student.name],
    ["Enrollment ID", data.student.enrollmentId],
    ["Department", data.student.department],
    ["Class", data.student.className ?? "-"],
    ["Roll Number", data.student.rollNumber ?? "-"],
    ["Father's Name", data.student.fatherName ?? "-"],
    ["Mother's Name", data.student.motherName ?? "-"],
  ];

  const colW = contentWidth / 2 - 2;
  doc.setFont("times", "normal");
  doc.setFontSize(8);

  details.forEach(([label, value], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = margin + col * (colW + 4);
    const yPos = y + row * 7;

    doc.setTextColor(100, 100, 120);
    doc.setFont("times", "bold");
    doc.text(`${label}:`, xPos, yPos);

    doc.setTextColor(30, 30, 50);
    doc.setFont("times", "normal");
    doc.text(value, xPos + 28, yPos);
  });

  y += Math.ceil(details.length / 2) * 7 + 6;

  // --- Photo placeholder ---
  if (data.student.photoFileId) {
    try {
      const photoData = data.student.photoFileId;
      if (photoData.startsWith("data:image")) {
        doc.addImage(photoData, "JPEG", W - margin - 28, 52, 28, 35);
        doc.setDrawColor(hr, hg, hb);
        doc.setLineWidth(0.3);
        doc.rect(W - margin - 28, 52, 28, 35);
      }
    } catch {
      // Photo embed failed, skip
    }
  }

  // --- Courses Section ---
  doc.setFillColor(240, 242, 255);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setTextColor(hr, hg, hb);
  doc.setFontSize(9);
  doc.setFont("times", "bold");
  doc.text("Selected Courses", margin + 2, y + 5);
  y += 10;

  // Table header
  const colCodes = margin;
  const colName = margin + 22;
  const colFaculty = margin + 90;
  const colSched = margin + 130;
  const colCred = margin + 168;

  doc.setFillColor(hr, hg, hb);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("times", "bold");
  doc.text("Code", colCodes + 1, y + 4);
  doc.text("Course Name", colName + 1, y + 4);
  doc.text("Faculty", colFaculty + 1, y + 4);
  doc.text("Schedule", colSched + 1, y + 4);
  doc.text("Cr", colCred + 1, y + 4);
  y += 6;

  doc.setFont("times", "normal");
  doc.setFontSize(7.5);

  data.courses.forEach((course, idx) => {
    const rowY = y + idx * 6;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 249, 255);
      doc.rect(margin, rowY, contentWidth, 6, "F");
    }
    doc.setTextColor(30, 30, 50);
    doc.text(course.courseCode, colCodes + 1, rowY + 4);
    const nameText =
      course.courseName.length > 30
        ? `${course.courseName.substring(0, 28)}..`
        : course.courseName;
    doc.text(nameText, colName + 1, rowY + 4);
    const facText =
      course.facultyName.length > 18
        ? `${course.facultyName.substring(0, 16)}..`
        : course.facultyName;
    doc.text(facText, colFaculty + 1, rowY + 4);
    doc.text(course.schedule, colSched + 1, rowY + 4);
    doc.text(String(Number(course.credits)), colCred + 3, rowY + 4);
  });

  y += data.courses.length * 6 + 1;

  // Total credits row
  doc.setFillColor(230, 235, 255);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setTextColor(hr, hg, hb);
  doc.setFont("times", "bold");
  doc.setFontSize(8);
  doc.text("Total Credits", W - margin - 30, y + 4, { align: "right" });
  doc.text(String(data.totalCredits), colCred + 3, y + 4);
  y += 12;

  // --- Horizontal divider ---
  doc.setDrawColor(hr, hg, hb);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 6;

  // --- QR Code ---
  const qrData = `REG:${data.registrationId}:${data.enrollmentId}`;
  const qrImage = await generateQRCode(qrData);

  doc.addImage(qrImage, "PNG", W - margin - 26, y, 26, 26);
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.2);
  doc.rect(W - margin - 26, y, 26, 26);

  doc.setTextColor(100, 100, 120);
  doc.setFontSize(7);
  doc.setFont("times", "normal");
  doc.text(`Registration ID: ${data.registrationId}`, margin, y + 5);
  const timestamp = data.lockedAt
    ? data.lockedAt.toLocaleString("en-IN")
    : new Date().toLocaleString("en-IN");
  doc.text(`Submitted: ${timestamp}`, margin, y + 11);
  doc.text(`Enrollment: ${data.enrollmentId}`, margin, y + 17);
  y += 32;

  // --- Signature Boxes ---
  const sigBoxW = (contentWidth - 8) / 3;
  const sigBoxH = 18;
  const sigY = y;

  doc.setDrawColor(hr, hg, hb);
  doc.setLineWidth(0.4);

  const sigLabels = [
    "Student's Signature",
    "Head of Department",
    "Controller of Examinations",
  ];

  sigLabels.forEach((label, i) => {
    const boxX = margin + i * (sigBoxW + 4);
    doc.rect(boxX, sigY, sigBoxW, sigBoxH);
    doc.setTextColor(hr, hg, hb);
    doc.setFont("times", "bold");
    doc.setFontSize(6.5);
    doc.text(label, boxX + sigBoxW / 2, sigY + sigBoxH - 4, {
      align: "center",
    });
  });

  y = sigY + sigBoxH + 6;

  // --- Red disclaimer ---
  doc.setTextColor(220, 0, 0);
  doc.setFont("times", "bold");
  doc.setFontSize(6.5);
  doc.text(
    "This is a computer generated registration slip. Any tampering will be treated as a serious offence.",
    W / 2,
    y,
    { align: "center" },
  );
  doc.setTextColor(0, 0, 0);
  y += 8;

  // Bottom strip
  doc.setFillColor(hr, hg, hb);
  doc.rect(0, y, W, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont("times", "normal");
  doc.text(
    `UDKNS Academic Portal \u2022 ${new Date().getFullYear()} \u2022 Digital India`,
    W / 2,
    y + 4,
    { align: "center" },
  );

  return doc.output("blob");
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
