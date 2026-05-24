import type { CourseView, StudentView } from "@/backend";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

interface RegistrationSlipProps {
  student: StudentView;
  courses: CourseView[];
  registrationId: string;
  totalCredits: number;
  lockedAt?: Date;
}

const TNR: React.CSSProperties = {
  fontFamily: "'Times New Roman', Times, serif",
};

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <tr>
      <td
        style={{
          ...TNR,
          fontWeight: 700,
          fontSize: 11,
          color: "#1a237e",
          padding: "3px 8px",
          border: "1px solid #c5cae9",
          whiteSpace: "nowrap",
          background: "#f0f2ff",
          width: "38%",
        }}
      >
        {label}
      </td>
      <td
        style={{
          ...TNR,
          fontSize: 11,
          padding: "3px 8px",
          border: "1px solid #c5cae9",
          color: "#1a1a2e",
        }}
      >
        {value || <span style={{ color: "#aaa", fontStyle: "italic" }}>—</span>}
      </td>
    </tr>
  );
}

export function RegistrationSlip({
  student,
  courses,
  registrationId,
  totalCredits,
  lockedAt,
}: RegistrationSlipProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qrData = `REG:${registrationId}:${student.enrollmentId}`;
    QRCode.toDataURL(qrData, {
      width: 80,
      margin: 1,
      color: { dark: "#1a237e", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [registrationId, student.enrollmentId]);

  const timestamp = lockedAt
    ? lockedAt.toLocaleString("en-IN")
    : new Date().toLocaleString("en-IN");
  const dateOnly = lockedAt
    ? lockedAt.toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  return (
    <div
      ref={slipRef}
      style={{
        ...TNR,
        background: "#fff",
        color: "#1a1a2e",
        position: "relative",
        overflow: "hidden",
        border: "2px solid #1a237e",
        maxWidth: 680,
        margin: "0 auto",
      }}
      data-ocid="registration_slip.container"
    >
      {/* Watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <span
          style={{
            ...TNR,
            fontSize: 96,
            fontWeight: 900,
            color: "rgba(26,35,126,0.04)",
            transform: "rotate(-35deg)",
            userSelect: "none",
            whiteSpace: "nowrap",
            letterSpacing: "0.15em",
          }}
        >
          OFFICIAL
        </span>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── HEADER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
            padding: "14px 20px 10px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Logo circle */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 22 }}>🎓</span>
          </div>

          {/* Institution name */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <h1
              style={{
                ...TNR,
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              UDKNS Academic Portal
            </h1>
            <p
              style={{
                ...TNR,
                fontSize: 10,
                color: "#c5cae9",
                margin: "2px 0 0",
                letterSpacing: "0.06em",
              }}
            >
              Digital India | Academic Excellence
            </p>
          </div>

          {/* Reg ID + date right block */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ ...TNR, fontSize: 9, color: "#c5cae9", margin: 0 }}>
              Registration ID
            </p>
            <p
              style={{
                ...TNR,
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                margin: "1px 0 0",
                fontStyle: "italic",
              }}
            >
              {registrationId}
            </p>
            <p
              style={{
                ...TNR,
                fontSize: 9,
                color: "#c5cae9",
                margin: "4px 0 0",
              }}
            >
              {dateOnly}
            </p>
          </div>
        </div>

        {/* Accent bar */}
        <div style={{ height: 4, background: "#3949ab" }} />

        {/* ── TITLE ── */}
        <div
          style={{
            textAlign: "center",
            padding: "10px 20px 8px",
            borderBottom: "1px solid #c5cae9",
          }}
        >
          <h2
            style={{
              ...TNR,
              fontSize: 14,
              fontWeight: 700,
              color: "#1a237e",
              margin: 0,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Course Registration Slip
          </h2>
        </div>

        {/* ── STUDENT DETAILS + PHOTO ── */}
        <div
          style={{
            display: "flex",
            gap: 0,
            padding: "12px 16px",
            borderBottom: "1px solid #c5cae9",
          }}
        >
          {/* Two-column details table */}
          <div style={{ flex: 1, paddingRight: 12 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                ...TNR,
              }}
            >
              <tbody>
                <DetailRow label="Name" value={student.name} />
                <DetailRow label="Father's Name" value={student.fatherName} />
                <DetailRow label="Enrollment ID" value={student.enrollmentId} />
                <DetailRow
                  label="Class"
                  value={student.className ?? undefined}
                />
                <DetailRow
                  label="Roll Number"
                  value={student.rollNumber ?? undefined}
                />
                <DetailRow label="Department" value={student.department} />
                <DetailRow label="Mobile" value={student.mobile ?? undefined} />
              </tbody>
            </table>
          </div>

          {/* Passport photo (100x120) */}
          <div
            style={{
              width: 100,
              height: 120,
              border: "2px solid #1a237e",
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f0f2ff",
            }}
          >
            {student.photoFileId?.startsWith("data:image") ? (
              <img
                src={student.photoFileId}
                alt="Student"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#1a237e",
                    margin: "0 auto 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                    ...TNR,
                  }}
                >
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <p
                  style={{
                    ...TNR,
                    fontSize: 9,
                    color: "#9fa8da",
                    margin: 0,
                  }}
                >
                  Affix Photo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── COURSES TABLE ── */}
        <div style={{ padding: "12px 16px" }}>
          {/* Section heading */}
          <div
            style={{
              background: "#e8eaf6",
              color: "#1a237e",
              ...TNR,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "4px 8px",
              marginBottom: 6,
            }}
          >
            Selected Courses
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              ...TNR,
              fontSize: 11,
            }}
          >
            <thead>
              <tr style={{ background: "#1a237e", color: "#fff" }}>
                <th
                  style={{
                    ...TNR,
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "left",
                    border: "1px solid #1a237e",
                    whiteSpace: "nowrap",
                    width: "16%",
                  }}
                >
                  Sub Code
                </th>
                <th
                  style={{
                    ...TNR,
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "left",
                    border: "1px solid #1a237e",
                  }}
                >
                  Course Name
                </th>
                <th
                  style={{
                    ...TNR,
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "center",
                    border: "1px solid #1a237e",
                    whiteSpace: "nowrap",
                    width: "10%",
                  }}
                >
                  Credits
                </th>
                <th
                  style={{
                    ...TNR,
                    padding: "5px 8px",
                    fontWeight: 700,
                    textAlign: "left",
                    border: "1px solid #1a237e",
                    width: "22%",
                  }}
                >
                  Schedule
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <tr
                  key={course.courseCode}
                  style={{
                    background: idx % 2 === 0 ? "#fff" : "#eef0fb",
                  }}
                >
                  <td
                    style={{
                      ...TNR,
                      padding: "4px 8px",
                      border: "1px solid #c5cae9",
                      fontWeight: 700,
                      color: "#1a237e",
                    }}
                  >
                    {course.courseCode}
                  </td>
                  <td
                    style={{
                      ...TNR,
                      padding: "4px 8px",
                      border: "1px solid #c5cae9",
                    }}
                  >
                    {course.courseName}
                  </td>
                  <td
                    style={{
                      ...TNR,
                      padding: "4px 8px",
                      border: "1px solid #c5cae9",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {Number(course.credits)}
                  </td>
                  <td
                    style={{
                      ...TNR,
                      padding: "4px 8px",
                      border: "1px solid #c5cae9",
                      color: "#555",
                    }}
                  >
                    {course.schedule}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ background: "#e8eaf6" }}>
                <td
                  colSpan={2}
                  style={{
                    ...TNR,
                    padding: "4px 8px",
                    border: "1px solid #c5cae9",
                    fontWeight: 700,
                    color: "#1a237e",
                    textAlign: "right",
                  }}
                >
                  Total Credits
                </td>
                <td
                  style={{
                    ...TNR,
                    padding: "4px 8px",
                    border: "1px solid #c5cae9",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#1a237e",
                  }}
                >
                  {totalCredits}
                </td>
                <td
                  style={{
                    ...TNR,
                    padding: "4px 8px",
                    border: "1px solid #c5cae9",
                  }}
                />
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── QR + REG INFO ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "8px 16px 10px",
            borderTop: "1px solid #c5cae9",
            background: "#f8f9ff",
          }}
        >
          <div style={{ ...TNR, fontSize: 10 }}>
            <p style={{ margin: "0 0 3px", color: "#5c6bc0" }}>
              <span style={{ fontWeight: 700 }}>Registration ID:</span>{" "}
              <span style={{ fontStyle: "italic" }}>{registrationId}</span>
            </p>
            <p style={{ margin: "0 0 3px", color: "#5c6bc0" }}>
              <span style={{ fontWeight: 700 }}>Submitted:</span> {timestamp}
            </p>
            <p style={{ margin: 0, color: "#5c6bc0" }}>
              <span style={{ fontWeight: 700 }}>Enrollment:</span>{" "}
              {student.enrollmentId}
            </p>
          </div>
          {qrDataUrl && (
            <div style={{ textAlign: "center" }}>
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{
                  width: 64,
                  height: 64,
                  border: "1px solid #c5cae9",
                  padding: 2,
                  display: "block",
                }}
              />
              <p
                style={{
                  ...TNR,
                  fontSize: 8,
                  color: "#9fa8da",
                  margin: "2px 0 0",
                  textAlign: "center",
                }}
              >
                Verify QR
              </p>
            </div>
          )}
        </div>

        {/* ── SIGNATURE SECTION ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0,
            borderTop: "2px solid #1a237e",
            margin: "0 16px",
          }}
        >
          {[
            "Student's Signature",
            "Head of Department",
            "Controller of Examinations",
          ].map((label, i) => (
            <div
              key={label}
              style={{
                borderRight: i < 2 ? "1px solid #c5cae9" : "none",
                padding: "28px 10px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  borderTop: "1px solid #555",
                  marginBottom: 4,
                }}
              />
              <p
                style={{
                  ...TNR,
                  fontSize: 9,
                  color: "#1a237e",
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── RED DISCLAIMER ── */}
        <div
          style={{
            padding: "6px 16px 10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              ...TNR,
              fontSize: 9,
              color: "#cc0000",
              fontWeight: 600,
              margin: 0,
            }}
          >
            This is a computer generated registration slip. Any tampering will
            be treated as a serious offence.
          </p>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div
          style={{
            background: "#1a237e",
            color: "#e8eaf6",
            textAlign: "center",
            padding: "6px 0",
            ...TNR,
            fontSize: 9,
            letterSpacing: "0.06em",
          }}
        >
          UDKNS Academic Portal &bull; {new Date().getFullYear()} &bull; Digital
          India
        </div>
      </div>
    </div>
  );
}
