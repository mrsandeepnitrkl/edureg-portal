import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Upload, User } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProfileFormValues {
  fatherName: string;
  motherName: string;
  className: string;
  rollNumber: string;
  department: string;
  mobile: string;
  email: string;
}

interface ProfileFormProps {
  enrollmentId: string;
}

export function ProfileForm({ enrollmentId }: ProfileFormProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: ProfileFormValues & { photoFileId?: string }) => {
      if (!actor) throw new Error("Backend not ready");
      const result = await actor.updateStudentProfile(enrollmentId, {
        fatherName: data.fatherName,
        motherName: data.motherName,
        className: data.className,
        rollNumber: data.rollNumber,
        mobile: data.mobile,
        email: data.email,
        photoFileId: data.photoFileId,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(enrollmentId),
      });
      toast.success("Profile completed successfully!");
      navigate({ to: "/student/dashboard" });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save profile.");
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
      setPhotoBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: ProfileFormValues) {
    await mutateAsync({ ...data, photoFileId: photoBase64 ?? undefined });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      data-ocid="profile_form.form"
    >
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <button
          type="button"
          className="h-24 w-24 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/60 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload student photo"
          data-ocid="profile_form.photo_upload"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          data-ocid="profile_form.upload_button"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {photoPreview ? "Change Photo" : "Upload Photo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Student photo file input"
        />
        <p className="text-xs text-muted-foreground">JPG/PNG, max 5MB</p>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fatherName">Father's Name *</Label>
          <Input
            id="fatherName"
            placeholder="Enter father's name"
            data-ocid="profile_form.father_name.input"
            {...register("fatherName", {
              required: "Father's name is required",
            })}
          />
          {errors.fatherName && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.father_name.field_error"
            >
              {errors.fatherName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motherName">Mother's Name *</Label>
          <Input
            id="motherName"
            placeholder="Enter mother's name"
            data-ocid="profile_form.mother_name.input"
            {...register("motherName", {
              required: "Mother's name is required",
            })}
          />
          {errors.motherName && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.mother_name.field_error"
            >
              {errors.motherName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="className">Class / Year *</Label>
          <Input
            id="className"
            placeholder="e.g. B.Tech 2nd Year"
            data-ocid="profile_form.class_name.input"
            {...register("className", { required: "Class/Year is required" })}
          />
          {errors.className && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.class_name.field_error"
            >
              {errors.className.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rollNumber">Roll Number *</Label>
          <Input
            id="rollNumber"
            placeholder="Enter roll number"
            data-ocid="profile_form.roll_number.input"
            {...register("rollNumber", { required: "Roll number is required" })}
          />
          {errors.rollNumber && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.roll_number.field_error"
            >
              {errors.rollNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            placeholder="e.g. Computer Science"
            data-ocid="profile_form.department.input"
            {...register("department", { required: "Department is required" })}
          />
          {errors.department && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.department.field_error"
            >
              {errors.department.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="10-digit mobile number"
            data-ocid="profile_form.mobile.input"
            {...register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Must be a 10-digit number",
              },
            })}
          />
          {errors.mobile && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.mobile.field_error"
            >
              {errors.mobile.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@college.edu"
            data-ocid="profile_form.email.input"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p
              className="text-xs text-destructive"
              data-ocid="profile_form.email.field_error"
            >
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-4 py-2.5 border border-border">
        ⚠️ Once submitted, your profile can only be updated by the admin.
      </p>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isSubmitting}
        data-ocid="profile_form.submit_button"
      >
        {isPending || isSubmitting ? "Saving..." : "Complete Profile"}
      </Button>
    </form>
  );
}
