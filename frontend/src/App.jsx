import React from "react";
import { useRouter } from "./router/useRouter";
import Login from "./pages/Login";
import UploaderDashboard from "./pages/uploader/Dashboard";
import ReviewerDashboard from "./pages/reviewer/Dashboard";
import ReviewDoc from "./pages/reviewer/ReviewDocument";
import ApproverDashboard from "./pages/approver/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { currentPath, navigate, params } = useRouter();
  const userRole = localStorage.getItem("role") || "uploader";

  switch (currentPath) {
    case "/":
      return <Login navigate={navigate} />;

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

    case `/reviewer/document/${params.id}`:
      return (
        <ProtectedRoute
          role={userRole}
          allowedRoles={["reviewer"]}
          navigate={navigate}
        >
          <ReviewDoc navigate={navigate} id={params.id} />
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
        <h1 className="text-center mt-20 text-red-500">404 - Page Not Found</h1>
      );
  }
}
