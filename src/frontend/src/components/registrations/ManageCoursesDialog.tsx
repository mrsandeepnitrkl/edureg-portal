import type { CourseView, RegistrationView, StudentView } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ManageCoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: RegistrationView;
  student: StudentView | undefined;
  allCourses: CourseView[];
}

export function ManageCoursesDialog({
  open,
  onOpenChange,
  registration,
  student,
  allCourses,
}: ManageCoursesDialogProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const availableCourses = allCourses.filter(
    (c) => !registration.courseCodes.includes(c.courseCode),
  );

  const addCourseMutation = useMutation({
    mutationFn: async (courseCode: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.adminAddCourseToStudent(
        registration.enrollmentId,
        courseCode,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all });
      setSelectedCourse("");
      toast.success("Course added successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeCourseMutation = useMutation({
    mutationFn: async (courseCode: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.adminRemoveCourseFromStudent(
        registration.enrollmentId,
        courseCode,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all });
      toast.success("Course removed successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getCourseInfo = (code: string) =>
    allCourses.find((c) => c.courseCode === code);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-ocid="manage_courses.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Manage Courses
          </DialogTitle>
        </DialogHeader>

        {/* Student info */}
        <div className="rounded-lg bg-muted/50 px-4 py-3 mb-2">
          <p className="font-medium text-foreground text-sm">
            {student?.name ?? registration.enrollmentId}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {registration.enrollmentId} &bull;{" "}
            {Number(registration.totalCredits)} credits
          </p>
        </div>

        {/* Current courses */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Enrolled Courses ({registration.courseCodes.length})
          </p>
          {registration.courseCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              No courses enrolled yet.
            </p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {registration.courseCodes.map((code) => {
                const info = getCourseInfo(code);
                return (
                  <li
                    key={code}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {code}
                      </span>
                      {info && (
                        <span className="text-xs text-muted-foreground truncate">
                          {info.courseName}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeCourseMutation.mutate(code)}
                      disabled={removeCourseMutation.isPending}
                      aria-label={`Remove ${code}`}
                      data-ocid="manage_courses.delete_button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add course */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Add Course
          </p>
          <div className="flex gap-2">
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              disabled={availableCourses.length === 0}
            >
              <SelectTrigger
                className="flex-1 text-sm"
                data-ocid="manage_courses.select"
              >
                <SelectValue
                  placeholder={
                    availableCourses.length === 0
                      ? "All courses enrolled"
                      : "Select a course…"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((c) => (
                  <SelectItem key={c.courseCode} value={c.courseCode}>
                    <span className="font-mono text-xs mr-2">
                      {c.courseCode}
                    </span>
                    <span className="text-sm">{c.courseName}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {Number(c.credits)} cr
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              disabled={
                !selectedCourse ||
                addCourseMutation.isPending ||
                availableCourses.length === 0
              }
              onClick={() => addCourseMutation.mutate(selectedCourse)}
              data-ocid="manage_courses.submit_button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            data-ocid="manage_courses.close_button"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
