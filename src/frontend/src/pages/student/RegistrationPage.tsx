import type { CourseView, RegistrationView, StudentView } from "@/backend";
import { RegistrationSlip } from "@/components/pdf/RegistrationSlip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import {
  blobToBase64,
  downloadPDF,
  generateRegistrationPDF,
} from "@/lib/pdfGenerator";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, Printer, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function RegistrationPage() {
  const { userId } = useAuth();
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const slipRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const { data: student, isLoading: studentLoading } =
    useQuery<StudentView | null>({
      queryKey: queryKeys.students.detail(userId ?? ""),
      queryFn: async () => {
        if (!actor || !userId) return null;
        return actor.getStudent(userId);
      },
      enabled: !!actor && !isFetching && !!userId,
    });

  const { data: registration, isLoading: regLoading } =
    useQuery<RegistrationView | null>({
      queryKey: queryKeys.registrations.detail(userId ?? ""),
      queryFn: async () => {
        if (!actor || !userId) return null;
        return actor.getRegistration(userId);
      },
      enabled: !!actor && !isFetching && !!userId,
    });

  const { data: allCourses = [] } = useQuery<CourseView[]>({
    queryKey: queryKeys.courses.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });

  const registeredCourses = allCourses.filter((c) =>
    registration?.courseCodes.includes(c.courseCode),
  );

  const totalCredits = Number(registration?.totalCredits ?? 0n);
  const lockedAt = registration?.lockTimestamp
    ? new Date(Number(registration.lockTimestamp) / 1_000_000)
    : undefined;

  // Store PDF file id mutation
  const savePdfMutation = useMutation({
    mutationFn: async (base64: string) => {
      if (!actor || !userId) throw new Error("Not ready");
      const result = await actor.updatePdfFileId(userId, base64);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.detail(userId ?? ""),
      });
    },
  });

  const handleDownloadPDF = async () => {
    if (!student || !registration) return;
    setGeneratingPdf(true);
    try {
      const pdfBlob = await generateRegistrationPDF({
        student,
        courses: registeredCourses,
        registrationId: registration.registrationId,
        enrollmentId: student.enrollmentId,
        totalCredits,
        lockedAt,
      });

      downloadPDF(pdfBlob, `registration-slip-${student.enrollmentId}.pdf`);

      // Save PDF reference to backend (as base64)
      if (!registration.pdfFileId) {
        const base64 = await blobToBase64(pdfBlob);
        savePdfMutation.mutate(base64);
      }

      toast.success("PDF downloaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isLoading = studentLoading || regLoading;

  // Not locked → redirect to courses
  if (!isLoading && registration && !registration.locked) {
    navigate({ to: "/student/courses" });
    return null;
  }

  // Not submitted yet
  if (!isLoading && !registration) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
        data-ocid="registration.empty_state"
      >
        <CheckCircle2 className="w-12 h-12 text-muted-foreground/30" />
        <div className="text-center">
          <h2 className="font-display text-lg font-bold text-foreground">
            No Registration Yet
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You haven't submitted your course registration.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/student/courses" })}
          data-ocid="registration.go_to_courses.button"
        >
          Select Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto" data-ocid="registration.page">
      {/* Success header */}
      <div className="flex items-center gap-3 pb-1 border-b border-border">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-success/20">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Registration Submitted
          </h1>
          <p className="text-xs text-muted-foreground">
            Your course registration is locked and confirmed.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleDownloadPDF}
          disabled={generatingPdf || isLoading}
          className="flex items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
          }}
          data-ocid="registration.download_pdf.button"
        >
          {generatingPdf ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {generatingPdf ? "Generating PDF…" : "Download PDF"}
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={isLoading}
          className="flex items-center gap-2"
          data-ocid="registration.print.button"
        >
          <Printer className="w-4 h-4" />
          Print Slip
        </Button>
      </div>

      {/* Registration Slip preview */}
      {isLoading ? (
        <div className="space-y-4" data-ocid="registration.slip.loading_state">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ) : student && registration ? (
        <div
          ref={slipRef}
          className="rounded-xl overflow-hidden shadow-elevated border border-border"
          data-ocid="registration.slip.card"
        >
          <RegistrationSlip
            student={student}
            courses={registeredCourses}
            registrationId={registration.registrationId}
            totalCredits={totalCredits}
            lockedAt={lockedAt}
          />
        </div>
      ) : null}
    </div>
  );
}
