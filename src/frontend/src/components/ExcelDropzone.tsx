import type { BulkStudentRow } from "@/backend";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";

export interface ParsedStudentRow extends BulkStudentRow {
  rowIndex: number;
}

export interface ParseResult {
  rows: ParsedStudentRow[];
  errors: string[];
}

interface ExcelDropzoneProps {
  onParsed: (result: ParseResult) => void;
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_EXT = [".xlsx", ".xls"];

function parseWorkbook(wb: XLSX.WorkBook): ParseResult {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  const rows: ParsedStudentRow[] = [];
  const errors: string[] = [];

  raw.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-based, row 1 is header
    const name = (
      row["Student Name"] ||
      row.Name ||
      row.StudentName ||
      ""
    ).trim();
    const enrollmentId = (
      row["Enrollment ID"] ||
      row.EnrollmentID ||
      row["Enrollment Id"] ||
      row.enrollment_id ||
      ""
    ).trim();
    const department = (row.Department || row.Dept || row.dept || "").trim();

    if (!name) {
      errors.push(`Row ${rowNum}: Missing student name.`);
      return;
    }
    if (!enrollmentId) {
      errors.push(`Row ${rowNum}: Missing enrollment ID.`);
      return;
    }
    if (!department) {
      errors.push(`Row ${rowNum}: Missing department.`);
      return;
    }

    rows.push({ name, enrollmentId, department, rowIndex: rowNum });
  });

  return { rows, errors };
}

export function ExcelDropzone({
  onParsed,
  disabled = false,
}: ExcelDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setFileError(null);

      if (!ACCEPTED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        setFileError("Only .xlsx or .xls files are accepted.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setFileError("File exceeds 5 MB limit.");
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: "array" });
          const result = parseWorkbook(wb);
          onParsed(result);
        } catch {
          setFileError("Failed to parse Excel file. Please check the format.");
          setFileName(null);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onParsed],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleClear = () => {
    setFileName(null);
    setFileError(null);
    onParsed({ rows: [], errors: [] });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-label="Drop Excel file here"
        data-ocid="excel_dropzone"
        disabled={disabled}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer select-none w-full text-left",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={handleFileChange}
          disabled={disabled}
        />
        {fileName ? (
          <>
            <FileSpreadsheet className="h-10 w-10 text-primary" />
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">
                {fileName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                File loaded — click to replace
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              aria-label="Remove file"
              data-ocid="excel_dropzone.clear_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground/50" />
            <div className="text-center">
              <p className="font-semibold text-sm text-foreground">
                Drop your Excel file here
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or click to browse — .xlsx only, max 5 MB
              </p>
            </div>
          </>
        )}
      </button>
      {fileError && (
        <p
          className="text-xs text-destructive"
          data-ocid="excel_dropzone.error_state"
        >
          {fileError}
        </p>
      )}
    </div>
  );
}
