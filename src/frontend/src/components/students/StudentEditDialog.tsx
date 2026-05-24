import type { StudentView } from "@/backend";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  student: StudentView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditFormValues {
  name: string;
  department: string;
  fatherName: string;
  motherName: string;
  className: string;
  rollNumber: string;
  mobile: string;
  email: string;
}

interface PasswordFormValues {
  newPassword: string;
}

export function StudentEditDialog({ student, open, onOpenChange }: Props) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdResetSuccess, setPwdResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>();

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormValues>();

  useEffect(() => {
    if (open && student) {
      reset({
        name: student.name,
        department: student.department,
        fatherName: student.fatherName ?? "",
        motherName: student.motherName ?? "",
        className: student.className ?? "",
        rollNumber: student.rollNumber ?? "",
        mobile: student.mobile ?? "",
        email: student.email ?? "",
      });
      resetPwd({ newPassword: "" });
    }
  }, [open, student, reset, resetPwd]);

  const currentPasswordQuery = useQuery({
    queryKey: ["student-password", student.enrollmentId, open],
    queryFn: async () => {
      if (!actor) return "";
      const result = await actor.getStudentPassword(student.enrollmentId);
      return result ?? "";
    },
    enabled: !!actor && open,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      if (!actor) throw new Error("Not connected");
      const r1 = await actor.updateStudent(student.enrollmentId, {
        name: data.name || undefined,
        department: data.department || undefined,
      });
      if (r1.__kind__ === "err") throw new Error(r1.err);

      const r2 = await actor.updateStudentProfile(student.enrollmentId, {
        fatherName: data.fatherName || undefined,
        motherName: data.motherName || undefined,
        className: data.className || undefined,
        rollNumber: data.rollNumber || undefined,
        mobile: data.mobile || undefined,
        email: data.email || undefined,
      });
      if (r2.__kind__ === "err") throw new Error(r2.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success("Student updated successfully");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleLockMutation = useMutation({
    mutationFn: async (lock: boolean) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.toggleStudentLock(student.enrollmentId, lock);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (updated, lock) => {
      queryClient.setQueryData<StudentView[]>(queryKeys.students.all, (prev) =>
        prev
          ? prev.map((s) =>
              s.enrollmentId === updated.enrollmentId ? updated : s,
            )
          : prev,
      );
      toast.success(
        lock ? "Account locked successfully" : "Account activated successfully",
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.adminResetPassword(
        student.enrollmentId,
        data.newPassword,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Password reset successfully");
      resetPwd({ newPassword: "" });
      setPwdResetSuccess(true);
      setTimeout(() => setPwdResetSuccess(false), 3000);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="students.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Edit Student — {student.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Enrollment ID:{" "}
            <span className="font-mono text-foreground">
              {student.enrollmentId}
            </span>
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
          className="space-y-5 mt-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                {...register("name", { required: "Name is required" })}
                data-ocid="students.name_input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="students.name_field_error"
                >
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-dept">Department *</Label>
              <Input
                id="edit-dept"
                {...register("department", {
                  required: "Department is required",
                })}
                data-ocid="students.dept_input"
              />
              {errors.department && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="students.dept_field_error"
                >
                  {errors.department.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-father">Father's Name</Label>
              <Input
                id="edit-father"
                {...register("fatherName")}
                data-ocid="students.father_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-mother">Mother's Name</Label>
              <Input
                id="edit-mother"
                {...register("motherName")}
                data-ocid="students.mother_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-class">Class</Label>
              <Input
                id="edit-class"
                {...register("className")}
                data-ocid="students.class_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-roll">Roll Number</Label>
              <Input
                id="edit-roll"
                {...register("rollNumber")}
                data-ocid="students.roll_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-mobile">Mobile</Label>
              <Input
                id="edit-mobile"
                {...register("mobile")}
                data-ocid="students.mobile_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                {...register("email")}
                data-ocid="students.email_input"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            📷 Photo can be uploaded from the student portal
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="students.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              data-ocid="students.save_button"
            >
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>

        <Separator className="my-4" />

        {/* Current Password Section */}
        <div className="space-y-3">
          <div>
            <h3 className="font-display font-semibold text-base text-foreground">
              Current Password
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The student's current login password (admin view only).
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            {currentPasswordQuery.isLoading ? (
              <Skeleton
                className="h-9 w-full"
                data-ocid="students.current_password.loading_state"
              />
            ) : currentPasswordQuery.isError ? (
              <p
                className="text-xs text-destructive"
                data-ocid="students.current_password.error_state"
              >
                Failed to load password
              </p>
            ) : (
              <div className="relative">
                <Input
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPasswordQuery.data ?? ""}
                  readOnly
                  className="pr-10 font-mono bg-background cursor-default"
                  data-ocid="students.current_password_input"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showCurrentPwd
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Account Status Section */}
        <div className="space-y-3">
          <div>
            <h3 className="font-display font-semibold text-base text-foreground">
              Account Status
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lock or activate this student's ability to log in.
            </p>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              {student.isLocked ? (
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </span>
                  <span className="text-xs text-muted-foreground">
                    This account is currently locked
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    <Unlock className="h-3 w-3 mr-1" />
                    Active
                  </span>
                  <span className="text-xs text-muted-foreground">
                    This account is active and can log in
                  </span>
                </>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={toggleLockMutation.isPending}
              onClick={() => toggleLockMutation.mutate(!student.isLocked)}
              className={
                student.isLocked
                  ? "border-green-300 text-green-700 hover:bg-green-50"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }
              data-ocid="students.toggle_lock_button"
            >
              {toggleLockMutation.isPending ? (
                "Updating…"
              ) : student.isLocked ? (
                <>
                  <Unlock className="h-3.5 w-3.5 mr-1.5" />
                  Activate Account
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Lock Account
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Password Reset Section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display font-semibold text-base text-foreground">
              Admin Password Reset
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set a new password for this student's account.
            </p>
          </div>

          {pwdResetSuccess && (
            <div
              className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 font-medium dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
              data-ocid="students.password_reset.success_state"
            >
              ✓ Password updated successfully!
            </div>
          )}

          <form
            onSubmit={handlePwd((d) => passwordMutation.mutate(d))}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <div className="flex gap-3 items-start">
                <div className="flex-1 relative">
                  <Input
                    id="new-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter new password"
                    {...regPwd("newPassword", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                    data-ocid="students.password_input"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  data-ocid="students.reset_password_button"
                  className="shrink-0"
                >
                  {passwordMutation.isPending ? "Updating…" : "Update Password"}
                </Button>
              </div>
              {pwdErrors.newPassword && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="students.password_field_error"
                >
                  {pwdErrors.newPassword.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
