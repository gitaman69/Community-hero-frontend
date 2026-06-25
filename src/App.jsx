import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import Report from './pages/Report.jsx';
import IssueDetail from './pages/IssueDetail.jsx';
import MyReports from './pages/MyReports.jsx';
import Standings from './pages/Standings.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './lib/AuthContext.jsx';
import { useGeolocation } from './lib/useGeolocation.js';
import { areaCode } from './lib/format.js';

export default function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { coords } = useGeolocation({ auto: true });
  const ward = coords ? areaCode(coords.lat, coords.lng) : 'CH·00·00';

  // Login / register render their own full-screen chrome.
  const bareRoute = location.pathname === '/login' || location.pathname === '/register';

  if (bareRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // The map page fills the viewport; everything else scrolls with a footer.
  const isMap = location.pathname === '/map';

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar areaCode={ward} />
      <main className="flex-1">
        <Routes>
          {/* Guests get the landing page; signed-in users go straight to the app. */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/map" replace /> : <Landing />}
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <IssueDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/standings"
            element={
              <ProtectedRoute>
                <Standings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isMap ? <Footer /> : null}
    </div>
  );
}
