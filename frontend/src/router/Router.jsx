import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import UploaderDashboard from "../pages/uploader/Dashboard";
import ReviewerDashboard from "../pages/reviewer/Dashboard";
import ReviewDoc from "../pages/reviewer/ReviewDocument";
import ApproverDashboard from "../pages/approver/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Router() {
  const userRole = localStorage.getItem("role") || "";

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/uploader"
        element={
          <ProtectedRoute role={userRole} allowedRoles={["uploader"]}>
            <UploaderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviewer"
        element={
          <ProtectedRoute role={userRole} allowedRoles={["reviewer"]}>
            <ReviewerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviewer/document/:id"
        element={
          <ProtectedRoute role={userRole} allowedRoles={["reviewer"]}>
            <ReviewDoc />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approver"
        element={
          <ProtectedRoute role={userRole} allowedRoles={["approver"]}>
            <ApproverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role={userRole} allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
