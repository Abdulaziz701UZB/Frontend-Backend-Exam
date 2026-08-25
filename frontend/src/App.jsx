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
import ExpenseAnalytics from "./pages/ExpenseAnalytics/ExpenseAnalytics";
import Login from "./pages/Login/Login";
import Landing from "./pages/Landing/Landing";

import { EduAuthProvider, useEduAuth } from "./context/EduAuthContext";
import { ToastProvider } from "./context/ToastContext";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<Groups />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/:id" element={<Payments />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<Teachers />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<Rooms />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/trial-lessons" element={<TrialLessons />} />
            <Route path="/telegram" element={<TelegramBot />} />
            <Route path="/expenses" element={<ExpenseAnalytics />} />
            <Route path="/expense-analytics" element={<ExpenseAnalytics />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
      />
      <Route path="/landing" element={<Landing />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <EduAuthProvider>
        <Router>
          <MainRoutes />
        </Router>
      </EduAuthProvider>
    </ToastProvider>
  );
}

export default App;
