export default function ProtectedRoute({ children, role, allowedRoles, navigate }) {
  if (!allowedRoles.includes(role)) {
    navigate("/"); // redirect manually
    return null;
  }
  return children;
}
