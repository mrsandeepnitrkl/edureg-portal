import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function GraduationCapIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function Header() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    void navigate({ to: "/login" });
  };

  const adminNavLinks = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/courses", label: "Courses" },
    { to: "/admin/registrations", label: "Registrations" },
  ];

  const studentNavLinks = [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/student/courses", label: "Courses" },
    { to: "/student/registration", label: "Registration" },
    { to: "/student/profile", label: "Profile" },
    {
      to: "/student/profile",
      label: "Password Change Request",
      mobileOnly: true,
    },
  ];

  const navLinks: Array<{ to: string; label: string; mobileOnly?: boolean }> =
    role === "admin"
      ? adminNavLinks
      : role === "student"
        ? studentNavLinks
        : [];

  // For desktop nav we exclude the mobile-only item
  const desktopNavLinks = navLinks.filter(
    (l) => !("mobileOnly" in l && l.mobileOnly),
  );

  return (
    <header
      className="bg-card border-b border-border shadow-header sticky top-0 z-40"
      data-ocid="header.panel"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 min-w-0"
            data-ocid="header.link"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-subtle">
              <GraduationCapIcon />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="font-display font-bold text-base text-foreground leading-tight truncate">
                UDKNS Academic Portal
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Digital India | Academic Excellence
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          {navLinks.length > 0 && (
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
                  activeProps={{
                    className:
                      "px-3 py-1.5 rounded-md text-sm font-medium text-primary bg-accent",
                  }}
                  data-ocid={`header.${link.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {role ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-ocid="header.logout_button"
                className="hidden sm:inline-flex"
              >
                Logout
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => navigate({ to: "/login" })}
                data-ocid="header.login_button"
                className="hidden sm:inline-flex"
              >
                Login
              </Button>
            )}

            {/* Mobile hamburger */}
            {navLinks.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                data-ocid="header.menu_toggle"
              >
                {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && navLinks.length > 0 && (
          <nav
            className="lg:hidden pb-4 flex flex-col gap-1 border-t border-border pt-3"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth flex items-center gap-2"
                activeProps={{
                  className:
                    "px-3 py-2 rounded-md text-sm font-medium text-primary bg-accent flex items-center gap-2",
                }}
                onClick={() => setMobileMenuOpen(false)}
                data-ocid={`header.mobile.${link.label.toLowerCase().replace(/\s+/g, "_")}.link`}
              >
                {link.label === "Password Change Request" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                {link.label}
              </Link>
            ))}
            {role && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 self-start"
                data-ocid="header.mobile.logout_button"
              >
                Logout
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
