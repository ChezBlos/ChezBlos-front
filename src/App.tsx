import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./screens/Login";
import { AdminDashboard } from "./screens/AdminDashboard";
import { ServeurDashboard } from "./screens/ServeurDashboard";
import { NotFound, Unauthorized } from "./screens/ErrorPages";

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {" "}
            <Routes>
              {" "}
              {/* Route publique pour le login */}
              <Route path="/login" element={<Login />} />
              {/* Route par défaut - redirige vers login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              {/* Routes protégées pour admin */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />
              {/* Routes protégées pour serveur */}
              <Route
                path="/serveur/*"
                element={
                  <ProtectedRoute requiredRoles={["serveur"]}>
                    <Routes>
                      <Route path="dashboard" element={<ServeurDashboard />} />
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />
              {/* Routes protégées pour cuisine */}
              <Route
                path="/cuisine/*"
                element={
                  <ProtectedRoute requiredRoles={["cuisine"]}>
                    <Routes>
                      <Route path="dashboard" element={<ServeurDashboard />} />
                      <Route
                        path=""
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />{" "}
              {/* Pages d'erreur */}
              <Route path="/403" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
