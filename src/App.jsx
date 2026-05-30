import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { PageLoader } from "./components/ui/index";
import AppLayout from "./components/layout/AppLayout";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Onboarding = lazy(() => import("./pages/auth/Onboarding"));
const Home = lazy(() => import("./pages/app/Home"));
const Tasks = lazy(() => import("./pages/app/Tasks"));
const Journal = lazy(() => import("./pages/app/Journal"));
const More = lazy(() => import("./pages/app/More"));
const Settings = lazy(() => import("./pages/app/Settings"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AuthGuard({ children }) {
  const { isAuthenticated, loading, needsOnboarding, session } = useApp();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!isAuthenticated)
    return <Navigate to="/" state={{ from: location }} replace />;
  if (session && !session.user.email_confirmed_at)
    return <Navigate to="/verify-email" replace />;
  if (needsOnboarding && location.pathname !== "/onboarding")
    return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicGuard({ children }) {
  const { isAuthenticated, loading, needsOnboarding } = useApp();
  if (loading) return <PageLoader />;
  if (isAuthenticated && !needsOnboarding)
    return <Navigate to="/app/home" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicGuard>
            <Landing />
          </PublicGuard>
        }
      />
      <Route
        path="/login"
        element={
          <PublicGuard>
            <Login />
          </PublicGuard>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicGuard>
            <Signup />
          </PublicGuard>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/onboarding"
        element={
          <AuthGuard>
            <Onboarding />
          </AuthGuard>
        }
      />
      <Route
        path="/app/*"
        element={
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="journal" element={<Journal />} />
                <Route path="more" element={<More />} />
                <Route path="settings" element={<Settings />} />
                <Route
                  path="timetable"
                  element={<ComingSoon feature="timetable" />}
                />
                <Route path="quiz" element={<ComingSoon feature="quiz" />} />
                <Route
                  path="flashcards"
                  element={<ComingSoon feature="flashcards" />}
                />
                <Route
                  path="documents"
                  element={<ComingSoon feature="documents" />}
                />
                <Route
                  path="peer-chat"
                  element={<ComingSoon feature="peer-chat" />}
                />
                <Route
                  path="counselor"
                  element={<ComingSoon feature="counselor" />}
                />
              </Routes>
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
