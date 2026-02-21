// src/router/useRouter.jsx
import { useState, useEffect } from "react";

const routes = {
  "/": "Login",
  "/uploader": "UploaderDashboard",
  "/reviewer": "ReviewerDashboard",
  "/reviewer/document/:id": "ReviewDoc",
  "/admin/document/:id": "AdminDocumentDetail",
  "/approver/document/:id": "ReviewDoc",
  "/approver": "ApproverDashboard",
  "/admin": "AdminDashboard",
  "/admin/users": "UserManagement",
};

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    const pathPart = path.split("?")[0];
    setCurrentPath(pathPart);
  };

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const params = {};
  for (const route of Object.keys(routes)) {
    const routeParts = route.split("/");
    const pathParts = currentPath.split("?")[0].split("/");

    if (routeParts.length === pathParts.length) {
      routeParts.forEach((part, i) => {
        if (part.startsWith(":")) {
          const key = part.slice(1);
          params[key] = pathParts[i];
        }
      });
    }
  }

  // Parse query parameters
  const query = {};
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((value, key) => {
    query[key] = value;
  });

  return { currentPath, navigate, params, query };
}
