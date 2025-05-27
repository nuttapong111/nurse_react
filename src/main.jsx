// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Register from "./features/auth/RegisterPage";
import LoginPage from "./features/auth/LoginPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import AppLayout from "./components/layout";
import SchedulePage from "./features/dashboard/SchedulePage";
import ManageWard from "./features/dashboard/ManageWard";
import ManageStaff from "./features/dashboard/ManageStaff";
import ManageRequest from "./features/dashboard/ManageRequest";
import ManageRule from "./features/dashboard/ManageRule";
import ManageSchedule from "./features/dashboard/ManageSchedule";
import ProfilePage from "./features/dashboard/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLogin from "./pages/adminLogin";
import AdminDashboard from "./pages/adminDashboard";
import AdminUsers from "./pages/adminUsers";
import ManageShiftConfig from "./features/dashboard/ManageShiftConfig";
import PaymentHistory from "./features/dashboard/PaymentHistory";
import PackageList from "./features/dashboard/PackageList";
import AdminPackage from "./pages/ManagePackage";
import PavementApprove from "./pages/PaymentApproval";

import "./index.css";
import "flatpickr/dist/themes/material_blue.css";
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<App />} /> {/* path="/" */}
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="manage-ward" element={<ManageWard />} />
            <Route path="manage-staff" element={<ManageStaff />} />
            <Route path="manage-request" element={<ManageRequest />} />
            <Route path="manage-rule" element={<ManageRule />} />
            <Route path="manage-schedule" element={<ManageSchedule />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="manage-shift-config" element={<ManageShiftConfig />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/package-list" element={<PackageList />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/package" element={<AdminPackage />} />
        <Route path="/admin/payment-approve" element={<PavementApprove />} />
        <Route
          path="*"
          element={<div style={{ color: "red", fontSize: 40 }}>NOT FOUND</div>}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
