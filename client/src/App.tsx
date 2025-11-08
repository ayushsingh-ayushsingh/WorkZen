import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "@/components/pages/login";
import SignupPage from "@/components/pages/signup";
import ProfilePage from "@/components/pages/profile";
import ProtectedRoute from "@/protectedRoutes";
import ForgotPassword from "@/components/pages/forgot-password";
import ResetPassword from "@/components/pages/reset-password";
import PaymentTest from "@/components/layouts/payment";
import LogoutButton from "@/components/layouts/logout-button";
import Home from "@/components/pages/home";
import FileUploader from "@/components/pages/fileUploader";
import Dashboard from "@/components/pages/dashboard";
import { Counter } from "@/components/pages/counter";
import DashboardHome from "@/components/pages/dashboard-home";
import { useEffect } from "react";
import TestForm from "@/components/pages/form";
import CreateOrganization from "@/components/pages/createOrganization";

const routeTitles: Record<string, string> = {
  "/": "Home - MyApp",
  "/login": "Login - MyApp",
  "/signup": "Sign Up - MyApp",
  "/forgot-password": "Forgot Password - MyApp",
  "/reset-password": "Reset Password - MyApp",
  "/dashboard": "Dashboard - MyApp",
  "/dashboard/profile": "Profile - MyApp",
  "/payment": "Payment - MyApp",
  "/upload": "Upload File - MyApp",
  "/counter": "Counter - MyApp",
};

function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const title = routeTitles[location.pathname] || "MyApp";
    document.title = title;
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <TitleManager />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="payment" element={<PaymentTest />} />
            <Route path="logout" element={<LogoutButton />} />
            <Route path="upload" element={<FileUploader />} />
            <Route path="form" element={<TestForm />} />
          </Route>
          <Route path="/create-organization" element={<CreateOrganization />} />
        </Route>

        <Route path="/counter" element={<Counter />} />
      </Routes>
    </>
  );
}
