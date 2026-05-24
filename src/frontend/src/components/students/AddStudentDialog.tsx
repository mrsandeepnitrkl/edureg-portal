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
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  name: string;
  enrollmentId: string;
  department: string;
  customPassword: string;
}

/** Mirrors the backend generatePassword formula exactly */
function derivePassword(enrollmentId: string, name: string): string {
  const first4 = name.trim().slice(0, 4);
  return `${enrollmentId}@${first4}123!`;
}

export function AddStudentDialog({ open, onOpenChange }: Props) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCustomPwd, setShowCustomPwd] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      enrollmentId: "",
      department: "",
      customPassword: "",
    },
  });

  const watchedEnrollment = useWatch({ control, name: "enrollmentId" }) ?? "";
  const watchedName = useWatch({ control, name: "name" }) ?? "";
  const watchedCustomPwd = useWatch({ control, name: "customPassword" }) ?? "";

  const previewPassword =
    watchedCustomPwd.trim() !== ""
      ? watchedCustomPwd
      : watchedEnrollment && watchedName
        ? derivePassword(watchedEnrollment, watchedName)
        : null;

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addStudent(
        data.name,
        data.enrollmentId,
        data.department,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      const finalPwd =
        data.customPassword.trim() !== ""
          ? data.customPassword
          : derivePassword(data.enrollmentId, data.name);
      return finalPwd;
    },
    onSuccess: (finalPwd) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      setCreatedPassword(finalPwd);
      setCopied(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCopy = async () => {
    if (!createdPassword) return;
    try {
      await navigator.clipboard.writeText(createdPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      reset();
      setCreatedPassword(null);
      setCopied(false);
      setShowCustomPwd(false);
    }
    onOpenChange(val);
  };

  // ── SUCCESS STATE ──────────────────────────────────────────────────────────
  if (createdPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md" data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                <Check className="h-4 w-4" />
              </span>
              Student Created!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              The student account has been created successfully. Share the
              password below with the student securely.
            </p>

            <div
              className="rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-4 space-y-3"
              data-ocid="students.generated_password.panel"
            >
              <div className="flex items-center gap-2 text-primary">
                <KeyRound className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Generated Password
                </span>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-xl font-bold text-foreground bg-card border border-border rounded-lg px-4 py-2 select-all">
                  {createdPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy password"
                  data-ocid="students.copy_password_button"
                  className={copied ? "border-green-400 text-green-600" : ""}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Copied to clipboard!
                </p>
              )}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
              ⚠️ <strong>Important:</strong> Make sure to share this password
              with the student. It will not be shown again.
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              onClick={() => handleClose(false)}
              data-ocid="students.done_button"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── FORM STATE ─────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-ocid="students.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Add New Student
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a student account. A password will be auto-generated unless
            you specify a custom one.
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 mt-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Student Name *</Label>
            <Input
              id="add-name"
              placeholder="e.g. Arjun Sharma"
              {...register("name", { required: "Student name is required" })}
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
            <Label htmlFor="add-enrollment">Enrollment ID *</Label>
            <Input
              id="add-enrollment"
              placeholder="e.g. 2024CSE001"
              {...register("enrollmentId", {
                required: "Enrollment ID is required",
                pattern: {
                  value: /^[A-Za-z0-9]+$/,
                  message: "Only alphanumeric characters allowed",
                },
              })}
              data-ocid="students.enrollment_input"
            />
            {errors.enrollmentId && (
              <p
                className="text-xs text-destructive"
                data-ocid="students.enrollment_field_error"
              >
                {errors.enrollmentId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-dept">Department *</Label>
            <Input
              id="add-dept"
              placeholder="e.g. Computer Science"
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

          {/* Optional custom password */}
          <div className="space-y-1.5">
            <Label htmlFor="add-custom-pwd">
              Custom Password{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Input
                id="add-custom-pwd"
                type={showCustomPwd ? "text" : "password"}
                placeholder="Leave blank to auto-generate"
                {...register("customPassword")}
                data-ocid="students.custom_password_input"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCustomPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showCustomPwd ? "Hide password" : "Show password"}
              >
                {showCustomPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Live password preview */}
          {previewPassword && (
            <div
              className="rounded-lg bg-muted/60 border border-primary/20 px-4 py-3 space-y-1"
              data-ocid="students.password_preview.panel"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {watchedCustomPwd.trim() !== ""
                  ? "Custom Password Set"
                  : "Auto-Generated Password Preview"}
              </p>
              <p className="font-mono text-sm font-bold text-foreground">
                {previewPassword}
              </p>
              {watchedCustomPwd.trim() === "" && (
                <p className="text-xs text-muted-foreground">
                  Formula: EnrollmentID@First4CharsOfName123!
                </p>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              data-ocid="students.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-ocid="students.submit_button"
            >
              {mutation.isPending ? "Adding…" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
