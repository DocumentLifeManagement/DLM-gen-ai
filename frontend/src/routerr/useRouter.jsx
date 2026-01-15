// src/routerr/useRouter.jsx
import { useState, useEffect } from "react";

const routes = {
  "/": "Login",
  "/uploader": "UploaderDashboard",
  "/reviewer": "ReviewerDashboard",
  "/reviewer/document/:id": "ReviewDoc",
  "/approver": "ApproverDashboard",
  "/admin": "AdminDashboard",
};

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const params = {};
  for (const route of Object.keys(routes)) {
    const routeParts = route.split("/");
    const pathParts = currentPath.split("/");

    if (routeParts.length === pathParts.length) {
      routeParts.forEach((part, i) => {
        if (part.startsWith(":")) {
          const key = part.slice(1);
          params[key] = pathParts[i];
        }
      });
    }
  }

  return { currentPath, navigate, params };
}
