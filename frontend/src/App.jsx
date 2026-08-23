import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import CommandPalette from "./components/CommandPalette/CommandPalette";

import Dashboard from "./pages/Dashboard/Dashboard";
import Groups from "./pages/Groups/Groups";
import Students from "./pages/Students/Students";
import Attendance from "./pages/Attendance/Attendance";
import Payments from "./pages/Payments/Payments";
import Teachers from "./pages/Teachers/Teachers";
import Exams from "./pages/Exams/Exams";
import Homework from "./pages/Homework/Homework";
import Certificates from "./pages/Certificates/Certificates";
import Rooms from "./pages/Rooms/Rooms";
import Leads from "./pages/Leads/Leads";
import Reviews from "./pages/Reviews/Reviews";
import TrialLessons from "./pages/TrialLessons/TrialLessons";
import TelegramBot from "./pages/TelegramBot/TelegramBot";
import Login from "./pages/Login/Login";

import { EduAuthProvider, useEduAuth } from "./context/EduAuthContext";
import "./App.css";

function ProtectedApp() {
  const { isAuthenticated } = useEduAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="crm-app-layout">
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
      />

      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="crm-main-wrap">
        <Header
          onToggleMobileMenu={() =>
            setIsMobileSidebarOpen(!isMobileSidebarOpen)
          }
          onOpenCmdPalette={() => setIsCmdPaletteOpen(true)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/trial-lessons" element={<TrialLessons />} />
            <Route path="/telegram-bot" element={<TelegramBot />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function MainRoutes() {
  const { isAuthenticated } = useEduAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="*" element={<ProtectedApp />} />
    </Routes>
  );
}

function App() {
  return (
    <EduAuthProvider>
      <Router>
        <MainRoutes />
      </Router>
    </EduAuthProvider>
  );
}

export default App;
