import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // Kiểm tra nếu token không tồn tại, hoặc bị gán nhầm thành chuỗi "null"/"undefined"
  const isAuthenticated = token && token !== "undefined" && token !== "null";

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;