import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Download,
  FileText,
  QrCode,
  Shield,
  Users,
} from "lucide-react";

const STATS = [
  { value: "10K+", label: "STUDENTS" },
  { value: "200+", label: "COURSES" },
  { value: "99.9%", label: "UPTIME" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Student Onboarding",
    description:
      "Upload Excel files to create student accounts instantly with auto-generated secure passwords.",
    accent: "text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Add, edit, and manage courses with credits, faculty, schedules, and seat limits.",
    accent: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    icon: FileText,
    title: "PDF Registration Slip",
    description:
      "Auto-generate official registration slips with QR codes, student photo, and full course details.",
    accent: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Shield,
    title: "Role-based Security",
    description:
      "Separate admin and student portals with JWT-secured routes and session management.",
    accent: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-body">
      {/* ── HEADER ── */}
      <header
        data-ocid="landing.header"
        className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border shadow-subtle"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-sm shrink-0"
              style={{ backgroundColor: "#1a237e" }}
            >
              UN
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight text-foreground">
                UDKNS Institute
              </p>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Academic Excellence&nbsp;·&nbsp;Digital India
              </p>
            </div>
          </div>
          {/* Nav */}
          <nav className="flex items-center gap-4">
            <a
              href="#features"
              data-ocid="landing.nav_home_link"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </a>
            <Button
              data-ocid="landing.nav_login_button"
              size="sm"
              className="font-semibold"
              style={{ backgroundColor: "#1a237e" }}
              onClick={() => navigate({ to: "/login" })}
            >
              Login →
            </Button>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        data-ocid="landing.hero_section"
        className="relative overflow-hidden flex-1"
        style={{ backgroundColor: "#1a237e" }}
      >
        {/* Cross/plus pattern overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px), radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 20px 20px",
          }}
        />
        {/* Larger cross pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div className="space-y-7">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-tight">
                <span className="text-white">The official portal for</span>
                <br />
                <span style={{ color: "#f59e0b" }}>Course Registration</span>
              </h1>

              <p className="text-blue-200 text-base sm:text-lg leading-relaxed max-w-lg">
                Streamlined course enrollment, profile management, and
                registration slips for academic institutions across India.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  data-ocid="landing.hero_login_button"
                  size="lg"
                  className="font-semibold text-gray-900"
                  style={{ backgroundColor: "#f59e0b" }}
                  onClick={() => navigate({ to: "/login" })}
                >
                  Student / Admin Login →
                </Button>
                <Button
                  data-ocid="landing.hero_explore_button"
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white/60 hover:bg-white/10 font-semibold"
                  onClick={() => {
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore Features
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-display font-bold text-2xl text-white">
                      {s.value}
                    </p>
                    <p className="text-[11px] tracking-widest text-blue-300 uppercase">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Registration card */}
            <div className="flex justify-center lg:justify-end">
              <Card
                data-ocid="landing.hero_card"
                className="w-full max-w-sm shadow-2xl border-0 overflow-hidden"
              >
                <CardHeader
                  className="py-4 px-5 flex-row items-center justify-between"
                  style={{ backgroundColor: "#1a237e" }}
                >
                  <span className="text-white font-display font-semibold text-sm">
                    UDKNS · Spring 2026
                  </span>
                  <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    VERIFIED ✓
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <p className="font-display font-bold text-lg text-foreground">
                    Registration Slip
                  </p>
                  {[
                    { label: "Enrollment", value: "UDK2026A042" },
                    { label: "Department", value: "Computer Science" },
                    { label: "Courses", value: "5" },
                    { label: "Total Credits", value: "22" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center text-sm border-b border-border pb-2"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground">
                        {row.value}
                      </span>
                    </div>
                  ))}

                  <Button
                    data-ocid="landing.card_download_button"
                    className="w-full font-semibold"
                    style={{ backgroundColor: "#1a237e" }}
                    onClick={() => navigate({ to: "/login" })}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>

                  {/* QR code placeholder */}
                  <div className="flex justify-center pt-1">
                    <div className="w-16 h-16 border-2 border-border rounded flex items-center justify-center bg-muted/40">
                      <QrCode className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        data-ocid="landing.features_section"
        className="bg-white dark:bg-background py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Everything an institution needs, end-to-end
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Built for scale. Designed for simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                data-ocid={`landing.feature_card.${f.title.toLowerCase().replace(/\s+/g, "_")}`}
                className="rounded-xl border border-border p-6 hover:shadow-elevated transition-smooth"
              >
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${f.bg}`}
                >
                  <f.icon className={`w-5 h-5 ${f.accent}`} />
                </div>
                <h3 className="font-display font-semibold text-base text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        data-ocid="landing.cta_section"
        className="py-20"
        style={{ backgroundColor: "#f4f4f4" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center space-y-5">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
            Ready to begin the registration session?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of students already registered on the platform.
          </p>
          <Button
            data-ocid="landing.cta_login_button"
            size="lg"
            className="font-semibold px-10 py-6 text-base"
            style={{ backgroundColor: "#1a237e" }}
            onClick={() => navigate({ to: "/login" })}
          >
            Proceed to Login →
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        data-ocid="landing.footer"
        className="py-6 text-center"
        style={{ backgroundColor: "#1a237e" }}
      >
        <p className="text-blue-200 text-sm">
          © {new Date().getFullYear()} UDKNS Institute. All rights reserved. |
          Academic Excellence | Digital India
        </p>
        <p className="text-blue-300/60 text-xs mt-1">
          Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-200 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
