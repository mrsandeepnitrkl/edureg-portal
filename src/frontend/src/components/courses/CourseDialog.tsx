import type { CourseView } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CourseFormValues {
  courseCode: string;
  courseName: string;
  credits: number;
  facultyName: string;
  schedule: string;
  maxSeats: number;
}

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  editCourse?: CourseView | null;
}

export function CourseDialog({ open, onClose, editCourse }: CourseDialogProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const isEdit = !!editCourse;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    defaultValues: {
      courseCode: "",
      courseName: "",
      credits: 3,
      facultyName: "",
      schedule: "",
      maxSeats: 60,
    },
  });

  useEffect(() => {
    if (editCourse) {
      reset({
        courseCode: editCourse.courseCode,
        courseName: editCourse.courseName,
        credits: Number(editCourse.credits),
        facultyName: editCourse.facultyName,
        schedule: editCourse.schedule,
        maxSeats: Number(editCourse.maxSeats),
      });
    } else {
      reset({
        courseCode: "",
        courseName: "",
        credits: 3,
        facultyName: "",
        schedule: "",
        maxSeats: 60,
      });
    }
  }, [editCourse, reset]);

  const addMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addCourse({
        courseCode: values.courseCode.trim().toUpperCase(),
        courseName: values.courseName.trim(),
        credits: BigInt(values.credits),
        facultyName: values.facultyName.trim(),
        schedule: values.schedule.trim(),
        maxSeats: BigInt(values.maxSeats),
      });
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course added successfully");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateCourse(editCourse!.courseCode, {
        courseName: values.courseName.trim(),
        credits: BigInt(values.credits),
        facultyName: values.facultyName.trim(),
        schedule: values.schedule.trim(),
        maxSeats: BigInt(values.maxSeats),
      });
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course updated successfully");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (values: CourseFormValues) => {
    if (isEdit) editMutation.mutate(values);
    else addMutation.mutate(values);
  };

  const isPending =
    addMutation.isPending || editMutation.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg" data-ocid="course_dialog.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Course" : "Add New Course"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                placeholder="e.g. CSE101, PHY-202"
                disabled={isEdit}
                data-ocid="course_dialog.course_code.input"
                {...register("courseCode", {
                  required: "Course code is required",
                  pattern: {
                    value: /^[A-Za-z0-9][A-Za-z0-9-]{1,14}$/,
                    message: "Alphanumeric with optional hyphens, 2–15 chars",
                  },
                })}
              />
              {errors.courseCode && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="course_dialog.course_code.field_error"
                >
                  {errors.courseCode.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credits">Credits *</Label>
              <Input
                id="credits"
                type="number"
                min={1}
                max={6}
                data-ocid="course_dialog.credits.input"
                {...register("credits", {
                  required: "Credits required",
                  min: { value: 1, message: "Min 1 credit" },
                  max: { value: 6, message: "Max 6 credits" },
                  valueAsNumber: true,
                })}
              />
              {errors.credits && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="course_dialog.credits.field_error"
                >
                  {errors.credits.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="courseName">Course Name *</Label>
            <Input
              id="courseName"
              placeholder="e.g. Introduction to Computer Science"
              data-ocid="course_dialog.course_name.input"
              {...register("courseName", {
                required: "Course name is required",
              })}
            />
            {errors.courseName && (
              <p
                className="text-xs text-destructive"
                data-ocid="course_dialog.course_name.field_error"
              >
                {errors.courseName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="facultyName">Faculty Name *</Label>
            <Input
              id="facultyName"
              placeholder="e.g. Dr. Priya Sharma"
              data-ocid="course_dialog.faculty_name.input"
              {...register("facultyName", {
                required: "Faculty name is required",
              })}
            />
            {errors.facultyName && (
              <p
                className="text-xs text-destructive"
                data-ocid="course_dialog.faculty_name.field_error"
              >
                {errors.facultyName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="schedule">Schedule *</Label>
              <Input
                id="schedule"
                placeholder="10:00-11:30 MWF"
                data-ocid="course_dialog.schedule.input"
                {...register("schedule", { required: "Schedule is required" })}
              />
              {errors.schedule && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="course_dialog.schedule.field_error"
                >
                  {errors.schedule.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxSeats">Max Seats *</Label>
              <Input
                id="maxSeats"
                type="number"
                min={1}
                data-ocid="course_dialog.max_seats.input"
                {...register("maxSeats", {
                  required: "Max seats required",
                  min: { value: 1, message: "At least 1 seat" },
                  valueAsNumber: true,
                })}
              />
              {errors.maxSeats && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="course_dialog.max_seats.field_error"
                >
                  {errors.maxSeats.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-ocid="course_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="course_dialog.submit_button"
            >
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
