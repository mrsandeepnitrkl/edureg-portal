import type { BulkStudentRow } from "@/backend";
import { ExcelDropzone } from "@/components/ExcelDropzone";
import type { ParseResult } from "@/components/ExcelDropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  Info,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function generatePassword(enrollmentId: string): string {
  return `${enrollmentId}@${enrollmentId.slice(0, 4)}123!`;
}

interface UploadResult {
  imported: number;
  backendErrors: string[];
  passwords: Array<{ enrollmentId: string; password: string }>;
}

export function ExcelUploadPage() {
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (rows: BulkStudentRow[]) => {
      if (!actor) throw new Error("Backend not ready");
      const result = await actor.bulkUploadStudents(rows);
      return result;
    },
    onSuccess: (data, rows) => {
      const passwords = rows.map((r) => ({
        enrollmentId: r.enrollmentId,
        password: generatePassword(r.enrollmentId),
      }));
      setUploadResult({
        imported: Number(data.imported),
        backendErrors: data.errors,
        passwords,
      });
      toast.success(
        `Successfully imported ${Number(data.imported)} student${Number(data.imported) !== 1 ? "s" : ""}.`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Upload failed. Please try again.");
    },
  });

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
    setUploadResult(null);
  };

  const handleUpload = () => {
    if (!parseResult || parseResult.rows.length === 0) return;
    const rows: BulkStudentRow[] = parseResult.rows.map((r) => ({
      name: r.name,
      enrollmentId: r.enrollmentId,
      department: r.department,
    }));
    uploadMutation.mutate(rows);
  };

  const previewRows = parseResult?.rows.slice(0, 5) ?? [];
  const totalRows = parseResult?.rows.length ?? 0;
  const parseErrors = parseResult?.errors ?? [];
  const isReady = !!actor && !isFetching;

  return (
    <div className="space-y-6" data-ocid="excel_upload.page">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Upload Student Database
        </h1>
        <p className="text-sm text-muted-foreground">
          Import students in bulk from an Excel spreadsheet (.xlsx).
          Auto-generated passwords will be created for each student.
        </p>
      </div>

      {/* Instructions */}
      <Card className="shadow-subtle border-primary/20 bg-primary/5">
        <CardContent className="flex gap-3 p-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              Excel Format Requirements
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li>
                Required columns:{" "}
                <span className="font-mono text-foreground">Student Name</span>{" "}
                (or &nbsp;
                <span className="font-mono text-foreground">Name</span>),{" "}
                <span className="font-mono text-foreground">Enrollment ID</span>
                , <span className="font-mono text-foreground">Department</span>
              </li>
              <li>First row must be the header row.</li>
              <li>File size limit: 5 MB. Format: .xlsx or .xls</li>
              <li>Passwords are auto-generated — no password column needed.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dropzone */}
      <Card className="shadow-subtle">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold font-display">
            Select File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExcelDropzone
            onParsed={handleParsed}
            disabled={uploadMutation.isPending}
          />

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-1"
              data-ocid="excel_upload.parse_errors.error_state"
            >
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {parseErrors.length} row{parseErrors.length !== 1 ? "s" : ""}{" "}
                with issues
              </p>
              <ul className="text-xs text-destructive/80 list-disc list-inside space-y-0.5">
                {parseErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table */}
          {totalRows > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Preview — {totalRows} student{totalRows !== 1 ? "s" : ""} found
                {totalRows > 5 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    (showing first 5)
                  </span>
                )}
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrollment ID</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row) => (
                      <TableRow
                        key={row.rowIndex}
                        data-ocid={`excel_upload.preview.item.${row.rowIndex}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {row.rowIndex}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {row.enrollmentId}
                        </TableCell>
                        <TableCell>{row.department}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                type="button"
                onClick={handleUpload}
                disabled={
                  !isReady || uploadMutation.isPending || totalRows === 0
                }
                className="gap-2"
                data-ocid="excel_upload.upload_button"
              >
                <Upload className="h-4 w-4" />
                {uploadMutation.isPending
                  ? "Uploading…"
                  : `Upload ${totalRows} Student${totalRows !== 1 ? "s" : ""}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results panel */}
      {uploadResult && (
        <Card
          className="shadow-subtle border-success/30"
          data-ocid="excel_upload.results.success_state"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold font-display flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              Upload Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">
                {uploadResult.imported}
              </span>{" "}
              student
              {uploadResult.imported !== 1 ? "s" : ""} imported successfully.
            </p>

            {uploadResult.backendErrors.length > 0 && (
              <div
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-1"
                data-ocid="excel_upload.backend_errors.error_state"
              >
                <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {uploadResult.backendErrors.length} error
                  {uploadResult.backendErrors.length !== 1 ? "s" : ""} reported
                  by server
                </p>
                <ul className="text-xs text-destructive/80 list-disc list-inside space-y-0.5">
                  {uploadResult.backendErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Generated passwords */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Generated Passwords
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  data-ocid="excel_upload.copy_all_passwords_button"
                  onClick={() => {
                    const text = uploadResult.passwords
                      .map((p) => `${p.enrollmentId}\t${p.password}`)
                      .join("\n");
                    navigator.clipboard
                      .writeText(text)
                      .then(() => {
                        toast.success("All passwords copied to clipboard!");
                      })
                      .catch(() => {
                        toast.error("Could not copy — try selecting manually");
                      });
                  }}
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  Copy All
                </Button>
              </div>
              <div className="rounded-lg border border-border overflow-auto max-h-72">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Enrollment ID</TableHead>
                      <TableHead>Auto-Generated Password</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResult.passwords.map((p, idx) => (
                      <TableRow
                        key={p.enrollmentId}
                        data-ocid={`excel_upload.passwords.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-sm">
                          {p.enrollmentId}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-bold">
                          {p.password}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                            aria-label="Copy password"
                            onClick={() =>
                              navigator.clipboard
                                .writeText(p.password)
                                .then(() =>
                                  toast.success(
                                    `Copied password for ${p.enrollmentId}`,
                                  ),
                                )
                                .catch(() => toast.error("Could not copy"))
                            }
                          >
                            <ClipboardCopy className="h-3.5 w-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Share these credentials securely with students. Passwords follow
                the pattern:{" "}
                <span className="font-mono">EnrollmentID@First4Chars123!</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
