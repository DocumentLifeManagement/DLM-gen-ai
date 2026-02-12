import React from "react";
import { useRouter } from "./router/useRouter";

import Home from "./pages/homepage/Home";
import Login from "./pages/homepage/Login";
import About from "./pages/homepage/About";

import UploaderDashboard from "./pages/uploader/Dashboard";
import ReviewerDashboard from "./pages/reviewer/Dashboard";
import ReviewDoc from "./pages/reviewer/ReviewDocument";
import ApproverDashboard from "./pages/approver/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { currentPath, navigate, params } = useRouter();

  // role stored after login (mock RBAC)
  const userRole = localStorage.getItem("role") || "uploader";

  /* ------------------------------
     Dynamic Reviewer Document Route
     ------------------------------ */
  if (currentPath.startsWith("/reviewer/document/")) {
    return (
      <ProtectedRoute
        role={userRole}
        allowedRoles={["reviewer"]}
        navigate={navigate}
      >
        <ReviewDoc navigate={navigate} id={params.id} />
      </ProtectedRoute>
    );
  }

  /* ------------------------------
     Static Routes
     ------------------------------ */
  switch (currentPath) {
    case "/":
      // Public landing page
      return <Home navigate={navigate} />;

    case "/login":
      return <Login navigate={navigate} />;

    case "/about":
      return <About navigate={navigate} />;

    case "/uploader":
      return (
        <ProtectedRoute
          role={userRole}
          allowedRoles={["uploader"]}
          navigate={navigate}
        >
          <UploaderDashboard navigate={navigate} />
        </ProtectedRoute>
      );

    case "/reviewer":
      return (
        <ProtectedRoute
          role={userRole}
          allowedRoles={["reviewer"]}
          navigate={navigate}
        >
          <ReviewerDashboard navigate={navigate} />
        </ProtectedRoute>
      );

    case "/approver":
      return (
        <ProtectedRoute
          role={userRole}
          allowedRoles={["approver"]}
          navigate={navigate}
        >
          <ApproverDashboard navigate={navigate} />
        </ProtectedRoute>
      );

    case "/admin":
      return (
        <ProtectedRoute
          role={userRole}
          allowedRoles={["admin"]}
          navigate={navigate}
        >
          <AdminDashboard navigate={navigate} />
        </ProtectedRoute>
      );

    default:
      return (
        <h1 className="text-center mt-20 text-red-500">
          404 - Page Not Found
        </h1>
      );
  }
}
