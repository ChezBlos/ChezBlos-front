import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AlertProvider } from "./contexts/AlertContext";
import { AlertContainer } from "./components/AlertContainer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./screens/Login";
import { AdminDashboard } from "./screens/AdminDashboard";
import { ServeurDashboard } from "./screens/ServeurDashboard";
import { CuisinierDashboard } from "./screens/CuisinierDashboard";
import { CaissierDashboard } from "./screens/CaissierDashboard";
import { NotFound, Unauthorized } from "./screens/ErrorPages";

const App: React.FC = () => {
  return (
    <AlertProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-10">
              <AlertContainer />
              <Routes>
                {" "}
                {/* Route publique pour le login */}
                <Route path="/login" element={<Login />} />
                {/* Route par défaut - redirige vers login */}
                <Route
                  path="/"
                  element={<Navigate to="/login" replace />}
                />{" "}
                {/* Routes protégées pour admin */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredRoles={["ADMIN"]}>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route
                          path="dashboard/:section"
                          element={<AdminDashboard />}
                        />
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
                    <ProtectedRoute requiredRoles={["SERVEUR"]}>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<ServeurDashboard />}
                        />
                        <Route
                          path=""
                          element={<Navigate to="dashboard" replace />}
                        />
                      </Routes>
                    </ProtectedRoute>
                  }
                />{" "}
                {/* Routes protégées pour caissier */}
                <Route
                  path="/caissier/*"
                  element={
                    <ProtectedRoute requiredRoles={["CAISSIER"]}>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<CaissierDashboard />}
                        />
                        <Route
                          path=""
                          element={<Navigate to="dashboard" replace />}
                        />
                      </Routes>
                    </ProtectedRoute>
                  }
                />{" "}
                {/* Routes protégées pour cuisine */}
                <Route
                  path="/cuisine/*"
                  element={
                    <ProtectedRoute requiredRoles={["CUISINIER"]}>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<CuisinierDashboard />}
                        />
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
    </AlertProvider>
  );
};

export default App;
