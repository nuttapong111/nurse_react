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

import "./index.css";
import "flatpickr/dist/themes/material_blue.css";
import "antd/dist/reset.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<App />} /> {/* path="/" */}
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="manage-ward" element={<ManageWard />} />
          <Route path="manage-staff" element={<ManageStaff />} />
          <Route path="manage-request" element={<ManageRequest />} />
          <Route path="manage-rule" element={<ManageRule />} />
          <Route path="manage-schedule" element={<ManageSchedule />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
