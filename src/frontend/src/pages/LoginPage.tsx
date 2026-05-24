import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

type AdminForm = { password: string };
type StudentForm = { enrollmentId: string; password: string };

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AdminLoginForm() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminForm>();

  const onSubmit = async (data: AdminForm) => {
    setServerError("");
    setLoading(true);
    const result = await adminLogin(data.password);
    setLoading(false);
    if (result.success) {
      void navigate({ to: "/admin/dashboard" });
    } else {
      setServerError(result.error ?? "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      data-ocid="admin_login.form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="admin-email" className="text-sm font-medium">
          Admin Email
        </Label>
        <Input
          id="admin-email"
          type="text"
          placeholder="sandeep@udkns.in"
          defaultValue="sandeep@udkns.in"
          readOnly
          className="bg-muted cursor-not-allowed"
          data-ocid="admin_login.email_input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pr-10"
            data-ocid="admin_login.password_input"
            {...register("password", { required: "Password is required" })}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && (
          <p
            className="text-destructive text-xs mt-1"
            data-ocid="admin_login.password.field_error"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <div
          className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2"
          data-ocid="admin_login.error_state"
        >
          <p className="text-destructive text-sm">{serverError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        data-ocid="admin_login.submit_button"
      >
        {loading ? (
          <>
            <SpinnerIcon />
            <span className="ml-2">Signing in…</span>
          </>
        ) : (
          "Sign In as Admin"
        )}
      </Button>
    </form>
  );
}

function StudentLoginForm() {
  const { studentLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentForm>();

  const onSubmit = async (data: StudentForm) => {
    setServerError("");
    setLoading(true);
    const result = await studentLogin(data.enrollmentId, data.password);
    setLoading(false);
    if (result.success) {
      void navigate({ to: "/student/dashboard" });
    } else {
      setServerError(result.error ?? "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      data-ocid="student_login.form"
    >
      <div className="space-y-1.5">
        <Label htmlFor="student-enrollment" className="text-sm font-medium">
          Enrollment ID
        </Label>
        <Input
          id="student-enrollment"
          type="text"
          placeholder="e.g. UDK2024001"
          data-ocid="student_login.enrollment_input"
          {...register("enrollmentId", {
            required: "Enrollment ID is required",
          })}
        />
        {errors.enrollmentId && (
          <p
            className="text-destructive text-xs mt-1"
            data-ocid="student_login.enrollment.field_error"
          >
            {errors.enrollmentId.message}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="student-password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="student-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pr-10"
            data-ocid="student_login.password_input"
            {...register("password", { required: "Password is required" })}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && (
          <p
            className="text-destructive text-xs mt-1"
            data-ocid="student_login.password.field_error"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <div
          className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2"
          data-ocid="student_login.error_state"
        >
          <p className="text-destructive text-sm">{serverError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
        data-ocid="student_login.submit_button"
      >
        {loading ? (
          <>
            <SpinnerIcon />
            <span className="ml-2">Signing in…</span>
          </>
        ) : (
          "Sign In as Student"
        )}
      </Button>
    </form>
  );
}

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "student">("admin");

  return (
    <div
      className="min-h-screen flex flex-col"
      data-ocid="login.page"
      style={{ backgroundColor: "#1a237e" }}
    >
      {/* Background patterns matching landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px), radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Header branding */}
      <div className="relative z-10 pt-10 pb-6 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg"
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">
          UDKNS Academic Portal
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          Academic Excellence&nbsp;·&nbsp;Digital India
        </p>
      </div>

      {/* Login card */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {/* Tab switcher */}
            <div
              className="flex"
              role="tablist"
              aria-label="Login type"
              style={{ borderBottom: "2px solid #e8eaf6" }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "admin"}
                onClick={() => setActiveTab("admin")}
                className="flex-1 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: activeTab === "admin" ? "#1a237e" : "transparent",
                  color: activeTab === "admin" ? "#fff" : "#6b7280",
                }}
                data-ocid="login.admin.tab"
              >
                Admin Login
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "student"}
                onClick={() => setActiveTab("student")}
                className="flex-1 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background:
                    activeTab === "student" ? "#1a237e" : "transparent",
                  color: activeTab === "student" ? "#fff" : "#6b7280",
                }}
                data-ocid="login.student.tab"
              >
                Student Login
              </button>
            </div>

            {/* Form body */}
            <div className="px-7 py-8">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {activeTab === "admin"
                    ? "Administrator Access"
                    : "Student Portal"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {activeTab === "admin"
                    ? "Sign in to manage students, courses, and registrations."
                    : "Sign in with your enrollment ID to access your courses."}
                </p>
              </div>

              {activeTab === "admin" ? (
                <AdminLoginForm />
              ) : (
                <StudentLoginForm />
              )}
            </div>
          </div>

          <p className="text-center text-xs text-blue-300 mt-6">
            Secure portal powered by UDKNS Academic System
          </p>
        </div>
      </div>

      <footer
        className="relative z-10 px-6 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p className="text-xs text-blue-300/70 text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-blue-200 hover:text-white hover:underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
