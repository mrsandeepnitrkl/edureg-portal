import { AdminLayout, StudentLayout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { CoursesPage as AdminCoursesPage } from "@/pages/admin/CoursesPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { ExcelUploadPage } from "@/pages/admin/ExcelUploadPage";
import { PasswordResetsPage } from "@/pages/admin/PasswordResetsPage";
import { RegistrationsPage } from "@/pages/admin/RegistrationsPage";
import { StudentsPage } from "@/pages/admin/StudentsPage";
import { CoursesPage as StudentCoursesPage } from "@/pages/student/CoursesPage";
import { ProfilePage } from "@/pages/student/ProfilePage";
import { RegistrationPage } from "@/pages/student/RegistrationPage";
import { StudentDashboardPage } from "@/pages/student/StudentDashboardPage";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// --- Route components ---
function AdminWrapper() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function StudentWrapper() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentLayout>
        <Outlet />
      </StudentLayout>
    </ProtectedRoute>
  );
}

// --- Routes ---
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// --- Admin routes ---
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminWrapper,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  component: () => <Navigate to="/admin/dashboard" />,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/students",
  component: StudentsPage,
});

const adminStudentsUploadRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/students/upload",
  component: ExcelUploadPage,
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/courses",
  component: AdminCoursesPage,
});

const adminRegistrationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/registrations",
  component: RegistrationsPage,
});

const adminPasswordResetsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/password-resets",
  component: PasswordResetsPage,
});

// --- Student routes ---
const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student",
  component: StudentWrapper,
});

const studentIndexRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: "/",
  component: () => <Navigate to="/student/dashboard" />,
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: "/dashboard",
  component: StudentDashboardPage,
});

const studentProfileRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: "/profile",
  component: ProfilePage,
});

const studentCoursesRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: "/courses",
  component: StudentCoursesPage,
});

const studentRegistrationRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: "/registration",
  component: RegistrationPage,
});

// --- Router ---
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminDashboardRoute,
    adminStudentsRoute,
    adminStudentsUploadRoute,
    adminCoursesRoute,
    adminRegistrationsRoute,
    adminPasswordResetsRoute,
  ]),
  studentRoute.addChildren([
    studentIndexRoute,
    studentDashboardRoute,
    studentProfileRoute,
    studentCoursesRoute,
    studentRegistrationRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
