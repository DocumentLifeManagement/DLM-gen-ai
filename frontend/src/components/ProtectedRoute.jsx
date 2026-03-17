export default function ProtectedRoute({ children, role, allowedRoles, navigate }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    navigate("/login");
    return null;
  }

  if (!allowedRoles.includes(role?.toLowerCase())) {
    navigate("/"); // redirect manually
    return null;
  }

  return children;
}
