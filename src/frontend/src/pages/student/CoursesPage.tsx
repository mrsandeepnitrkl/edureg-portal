import type { CourseView, RegistrationView, StudentView } from "@/backend";
import { CourseSelectionCard } from "@/components/courses/CourseSelectionCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Lock,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Parse schedule string like "09:00-10:30 MWF"
interface ParsedSchedule {
  startMin: number;
  endMin: number;
  days: string;
}

function parseSchedule(schedule: string): ParsedSchedule | null {
  const match = schedule.match(
    /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\s+([A-Za-z]+)$/,
  );
  if (!match) return null;
  const startMin = Number.parseInt(match[1]) * 60 + Number.parseInt(match[2]);
  const endMin = Number.parseInt(match[3]) * 60 + Number.parseInt(match[4]);
  const days = match[5].toUpperCase();
  return { startMin, endMin, days };
}

function schedulesConflict(a: ParsedSchedule, b: ParsedSchedule): boolean {
  // Time overlap
  const timeOverlap = a.startMin < b.endMin && a.endMin > b.startMin;
  if (!timeOverlap) return false;
  // Day overlap — check if any character in a.days appears in b.days
  for (const ch of a.days) {
    if (b.days.includes(ch)) return true;
  }
  return false;
}

function getConflictedCodes(
  selectedCodes: string[],
  allCourses: CourseView[],
): Set<string> {
  const selected = allCourses.filter((c) =>
    selectedCodes.includes(c.courseCode),
  );
  const conflicted = new Set<string>();

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = parseSchedule(selected[i].schedule);
      const b = parseSchedule(selected[j].schedule);
      if (a && b && schedulesConflict(a, b)) {
        conflicted.add(selected[i].courseCode);
        conflicted.add(selected[j].courseCode);
      }
    }
  }
  return conflicted;
}

const MAX_CREDITS = 24;

export function CoursesPage() {
  const { userId } = useAuth();
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch student profile
  const { data: student, isLoading: studentLoading } =
    useQuery<StudentView | null>({
      queryKey: queryKeys.students.detail(userId ?? ""),
      queryFn: async () => {
        if (!actor || !userId) return null;
        return actor.getStudent(userId);
      },
      enabled: !!actor && !isFetching && !!userId,
    });

  // Fetch all courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<
    CourseView[]
  >({
    queryKey: queryKeys.courses.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });

  // Fetch existing registration (to pre-populate)
  const { data: registration } = useQuery<RegistrationView | null>({
    queryKey: queryKeys.registrations.detail(userId ?? ""),
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getRegistration(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });

  // Pre-populate from existing registration
  useEffect(() => {
    if (registration?.courseCodes && registration.courseCodes.length > 0) {
      setSelectedCodes(registration.courseCodes);
    }
  }, [registration?.courseCodes]);

  // Redirect if locked
  useEffect(() => {
    if (registration?.locked) {
      navigate({ to: "/student/registration" });
    }
  }, [registration?.locked, navigate]);

  const conflictedCodes = useMemo(
    () => getConflictedCodes(selectedCodes, courses),
    [selectedCodes, courses],
  );

  const totalCredits = useMemo(() => {
    return courses
      .filter((c) => selectedCodes.includes(c.courseCode))
      .reduce((sum, c) => sum + Number(c.credits), 0);
  }, [courses, selectedCodes]);

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.facultyName.toLowerCase().includes(q),
    );
  }, [courses, search]);

  const selectedCourses = useMemo(
    () => courses.filter((c) => selectedCodes.includes(c.courseCode)),
    [courses, selectedCodes],
  );

  // Save draft mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !userId) throw new Error("Not ready");
      const result = await actor.registerCourses(userId, selectedCodes);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Course selection saved!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.detail(userId ?? ""),
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Final submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !userId) throw new Error("Not ready");
      // Save first
      const saveResult = await actor.registerCourses(userId, selectedCodes);
      if (saveResult.__kind__ === "err") throw new Error(saveResult.err);
      // Then lock
      const submitResult = await actor.finalSubmitRegistration(userId);
      if (submitResult.__kind__ === "err") throw new Error(submitResult.err);
      return submitResult.ok;
    },
    onSuccess: () => {
      toast.success("Registration submitted successfully!", { duration: 5000 });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrations.detail(userId ?? ""),
      });
      navigate({ to: "/student/registration" });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setShowConfirmDialog(false);
    },
  });

  const handleToggle = (code: string) => {
    const course = courses.find((c) => c.courseCode === code);
    if (!course) return;
    const isCurrentlySelected = selectedCodes.includes(code);

    if (!isCurrentlySelected) {
      // Check credit limit
      const newCredits = totalCredits + Number(course.credits);
      if (newCredits > MAX_CREDITS) {
        toast.error(
          `Cannot add: would exceed ${MAX_CREDITS} credit limit (${newCredits} total).`,
        );
        return;
      }
      const newCodes = [...selectedCodes, code];
      // Check for new conflicts
      const newConflicts = getConflictedCodes(newCodes, courses);
      if (newConflicts.has(code)) {
        const conflicting = newCodes
          .filter((c) => c !== code && newConflicts.has(c))
          .map(
            (c) => courses.find((cr) => cr.courseCode === c)?.courseName ?? c,
          )
          .join(", ");
        toast.warning(`Schedule conflict with: ${conflicting}`, {
          duration: 4000,
        });
      }
      setSelectedCodes(newCodes);
    } else {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    }
  };

  const creditColor =
    totalCredits > 22
      ? "text-destructive"
      : totalCredits >= 20
        ? "text-warning-foreground"
        : "text-success";
  const creditBg =
    totalCredits > 22
      ? "bg-destructive/10 border-destructive/30"
      : totalCredits >= 20
        ? "bg-warning/10 border-warning/30"
        : "bg-success/10 border-success/30";

  const isLoading = studentLoading || coursesLoading;
  const profileIncomplete = !student?.profileComplete;
  const hasConflicts = conflictedCodes.size > 0;

  return (
    <div className="space-y-5" data-ocid="courses.page">
      {/* Page header */}
      <div className="flex items-center gap-3 pb-1 border-b border-border">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
          }}
        >
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Course Selection
          </h1>
          <p className="text-xs text-muted-foreground">
            Select courses for this semester
          </p>
        </div>
      </div>

      {/* Profile incomplete warning */}
      {!studentLoading && profileIncomplete && (
        <div
          className="flex items-center gap-3 p-3 rounded-lg border bg-warning/10 border-warning/30"
          data-ocid="courses.profile_incomplete.error_state"
        >
          <AlertTriangle className="w-5 h-5 text-warning-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning-foreground">
              Profile Incomplete
            </p>
            <p className="text-xs text-muted-foreground">
              Complete your profile before selecting courses.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/student/profile" })}
            data-ocid="courses.complete_profile.button"
          >
            Complete Profile
          </Button>
        </div>
      )}

      {/* Credit summary bar */}
      <div
        className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${creditBg}`}
        data-ocid="courses.credit_summary.section"
      >
        <div className="flex-1">
          <p className={`text-sm font-bold ${creditColor} font-display`}>
            {totalCredits} / {MAX_CREDITS} Credits Selected
          </p>
          <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden w-full max-w-xs">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%`,
                background:
                  totalCredits > 22
                    ? "#ef4444"
                    : totalCredits >= 20
                      ? "#f59e0b"
                      : "#1a237e",
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {selectedCodes.length} course{selectedCodes.length !== 1 ? "s" : ""}{" "}
            selected
          </Badge>
          {hasConflicts && (
            <Badge
              variant="destructive"
              className="text-xs flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              Schedule conflicts
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Course grid */}
        <div className="lg:col-span-2 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by course code, name, or faculty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="courses.search_input"
            />
          </div>

          {/* Course cards */}
          {isLoading ? (
            <div className="space-y-3" data-ocid="courses.list.loading_state">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                <Skeleton key={k} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-ocid="courses.list.empty_state"
            >
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-foreground">No courses found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query.
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-ocid="courses.list">
              {filteredCourses.map((course, idx) => (
                <div
                  key={course.courseCode}
                  data-ocid={`courses.item.${idx + 1}`}
                >
                  <CourseSelectionCard
                    course={course}
                    isSelected={selectedCodes.includes(course.courseCode)}
                    isConflicted={conflictedCodes.has(course.courseCode)}
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected courses sidebar */}
        <div className="space-y-3">
          <div className="sticky top-4 space-y-3">
            {/* Selected list */}
            <div className="rounded-xl border border-border bg-card shadow-subtle p-4">
              <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Selected Courses
              </h3>

              {selectedCourses.length === 0 ? (
                <div
                  className="py-6 text-center text-sm text-muted-foreground"
                  data-ocid="courses.selected.empty_state"
                >
                  No courses selected yet.
                </div>
              ) : (
                <div className="space-y-2" data-ocid="courses.selected.list">
                  {selectedCourses.map((course, idx) => (
                    <div
                      key={course.courseCode}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        conflictedCodes.has(course.courseCode)
                          ? "bg-destructive/10 border border-destructive/30"
                          : "bg-muted/40 border border-border"
                      }`}
                      data-ocid={`courses.selected.item.${idx + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-primary truncate">
                          {course.courseCode}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {course.courseName}
                        </p>
                      </div>
                      <span className="font-bold text-foreground shrink-0">
                        {Number(course.credits)} cr
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(course.courseCode)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${course.courseName}`}
                        data-ocid={`courses.selected.remove_button.${idx + 1}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Credit total */}
              {selectedCourses.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs font-bold">
                  <span className="text-foreground">Total</span>
                  <span className={creditColor}>{totalCredits} credits</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => saveMutation.mutate()}
                disabled={
                  saveMutation.isPending ||
                  selectedCodes.length === 0 ||
                  profileIncomplete
                }
                data-ocid="courses.save_button"
              >
                {saveMutation.isPending ? "Saving…" : "Save Selection"}
              </Button>

              <Button
                className="w-full font-semibold"
                onClick={() => setShowConfirmDialog(true)}
                disabled={
                  selectedCodes.length === 0 ||
                  hasConflicts ||
                  totalCredits > MAX_CREDITS ||
                  profileIncomplete ||
                  submitMutation.isPending
                }
                style={{
                  background:
                    "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                }}
                data-ocid="courses.final_submit.button"
              >
                <Lock className="w-4 h-4 mr-2" />
                Final Submit &amp; Lock
              </Button>

              {hasConflicts && (
                <p className="text-xs text-destructive text-center">
                  Resolve schedule conflicts before submitting.
                </p>
              )}
              {totalCredits > MAX_CREDITS && (
                <p className="text-xs text-destructive text-center">
                  Reduce credits to {MAX_CREDITS} or below.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Final Submit Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-ocid="courses.confirm_submit.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <Lock className="w-5 h-5 text-destructive" />
              Confirm Final Submission
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block font-semibold text-foreground">
                Once submitted, you cannot change your course selection. Only an
                admin can modify it after this point.
              </span>
              <span className="block text-sm">
                You are about to submit the following {selectedCodes.length}{" "}
                course
                {selectedCodes.length !== 1 ? "s" : ""} ({totalCredits}{" "}
                credits):
              </span>
              <ul className="text-sm space-y-1 mt-2">
                {selectedCourses.map((c) => (
                  <li key={c.courseCode} className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "#1a237e", color: "#fff" }}
                    >
                      {c.courseCode}
                    </span>
                    <span className="truncate">{c.courseName}</span>
                    <span className="ml-auto text-muted-foreground shrink-0">
                      {Number(c.credits)} cr
                    </span>
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="courses.confirm_submit.cancel_button">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              style={{ background: "#1a237e" }}
              data-ocid="courses.confirm_submit.confirm_button"
            >
              {submitMutation.isPending ? "Submitting…" : "Confirm Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
