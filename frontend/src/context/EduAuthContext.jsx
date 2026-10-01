import { createContext, useState, useEffect, useContext } from "react";
import { teachersApi, studentsApi } from "../services/api";
import { INITIAL_ADMINS } from "../data/eduData";

const EduAuthContext = createContext();

const VALID_PASSWORDS = ["10102013", "1010201300"];

const DEFAULT_USER = {
  id: 201,
  name: "Abdulaziz Abdulhayev (Bosh Admin)",
  phone: "+998 90 599 06 00",
  email: "admin@velnex.uz",
  roleTitle: "Bosh Administrator",
};

export const EduAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("educontrol_is_authenticated") === "true";
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem("educontrol_role") || "admin";
  });

  const [selectedUserId, setSelectedUserId] = useState(() => {
    return parseInt(localStorage.getItem("educontrol_user_id")) || 201;
  });

  const [userLoginIdentifier, setUserLoginIdentifier] = useState(() => {
    return localStorage.getItem("educontrol_user_identifier") || "+998 90 599 06 00";
  });

  const [authError, setAuthError] = useState("");
  const [liveTeachers, setLiveTeachers] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);

  useEffect(() => {
    const fetchAuthUsers = async () => {
      try {
        const [teachersData, studentsData] = await Promise.all([
          teachersApi.getAll(),
          studentsApi.getAll(),
        ]);
        setLiveTeachers(teachersData);
        setLiveStudents(studentsData);
      } catch (err) {
        console.error("Auth users fetch error:", err.message);
      }
    };
    fetchAuthUsers();
  }, []);

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem("velnex_admin_password") || localStorage.getItem("velnex_custom_password") || "10102013";
  });

  const [teacherPassword, setTeacherPassword] = useState(() => {
    return localStorage.getItem("velnex_teacher_password") || "teacher123";
  });

  const [studentPassword, setStudentPassword] = useState(() => {
    return localStorage.getItem("velnex_student_password") || "student123";
  });

  const [teacherCustomPasswords, setTeacherCustomPasswords] = useState(() => {
    try {
      const saved = localStorage.getItem("velnex_teacher_custom_passwords");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [profileOverride, setProfileOverride] = useState(() => {
    try {
      const saved = localStorage.getItem("velnex_user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const getUserObject = (role, userId) => {
    let found;
    if (role === "admin") {
      found = INITIAL_ADMINS.find((a) => a.id === userId) || INITIAL_ADMINS[0];
    } else if (role === "teacher") {
      found = liveTeachers.find((t) => t.id === userId) || liveTeachers[0];
    } else {
      found = liveStudents.find((s) => s.id === userId) || liveStudents[0];
    }
    const base = found || DEFAULT_USER;
    return profileOverride ? { ...base, ...profileOverride } : base;
  };

  const user = getUserObject(currentRole, selectedUserId);

  const getValidAdminPasswords = () => {
    return [adminPassword, "10102013", "1010201300"];
  };

  const getValidTeacherPasswords = (teacherId) => {
    const list = [teacherPassword, adminPassword, "10102013", "1010201300"];
    if (teacherId && teacherCustomPasswords[teacherId]) {
      const custom = typeof teacherCustomPasswords[teacherId] === "string" 
        ? teacherCustomPasswords[teacherId] 
        : teacherCustomPasswords[teacherId]?.password;
      if (custom) list.push(custom);
    } else {
      // Include all teacher custom passwords as valid for teacher logins
      Object.values(teacherCustomPasswords).forEach((item) => {
        const p = typeof item === "string" ? item : item?.password;
        if (p) list.push(p);
      });
    }
    return list;
  };

  const getValidStudentPasswords = () => {
    return [studentPassword, adminPassword, "10102013", "1010201300"];
  };

  const changeAdminPassword = (currentPass, newPass) => {
    const validList = getValidAdminPasswords();
    if (!validList.includes(currentPass.trim())) {
      return { success: false, message: "Hozirgi admin paroli noto'g'ri kiritildi!" };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: "Yangi admin paroli kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    const cleanPass = newPass.trim();
    setAdminPassword(cleanPass);
    try {
      localStorage.setItem("velnex_admin_password", cleanPass);
      localStorage.setItem("velnex_custom_password", cleanPass);
    } catch {}
    return { success: true, message: "Admin paroli muvaffaqiyatli yangilandi!" };
  };

  // Backwards compatibility alias
  const changePassword = (currentPass, newPass) => changeAdminPassword(currentPass, newPass);

  const changeTeacherPassword = (newPass) => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: "O'qituvchi paroli kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    const cleanPass = newPass.trim();
    setTeacherPassword(cleanPass);
    try {
      localStorage.setItem("velnex_teacher_password", cleanPass);
    } catch {}
    return { success: true, message: "Umumiy o'qituvchi paroli muvaffaqiyatli saqlandi!" };
  };

  const changeStudentPassword = (newPass) => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: "O'quvchi paroli kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    const cleanPass = newPass.trim();
    setStudentPassword(cleanPass);
    try {
      localStorage.setItem("velnex_student_password", cleanPass);
    } catch {}
    return { success: true, message: "O'quvchi paroli muvaffaqiyatli saqlandi!" };
  };

  const setTeacherIndividualPassword = (teacherId, teacherName, password) => {
    if (!teacherId) return { success: false, message: "O'qituvchi tanlanmadi!" };
    if (!password || password.trim().length < 4) {
      return { success: false, message: "Shaxsiy parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    const cleanPass = password.trim();
    const updated = {
      ...teacherCustomPasswords,
      [teacherId]: {
        teacherId,
        teacherName: teacherName || `O'qituvchi #${teacherId}`,
        password: cleanPass,
        updatedAt: new Date().toISOString(),
      },
    };
    setTeacherCustomPasswords(updated);
    try {
      localStorage.setItem("velnex_teacher_custom_passwords", JSON.stringify(updated));
    } catch {}
    return { success: true, message: `${teacherName || "O'qituvchi"} uchun maxsus parol muvaffaqiyatli saqlandi!` };
  };

  const removeTeacherIndividualPassword = (teacherId) => {
    const updated = { ...teacherCustomPasswords };
    delete updated[teacherId];
    setTeacherCustomPasswords(updated);
    try {
      localStorage.setItem("velnex_teacher_custom_passwords", JSON.stringify(updated));
    } catch {}
    return { success: true, message: "Maxsus parol o'chirildi, umumiy o'qituvchi paroli faollashtirildi!" };
  };

  const updateProfile = (profileData) => {
    const updated = { ...user, ...profileData };
    setProfileOverride(updated);
    try {
      localStorage.setItem("velnex_user_profile", JSON.stringify(updated));
    } catch {}
    return { success: true, message: "Profil ma'lumotlari muvaffaqiyatli saqlandi!" };
  };

  const login = (identifier, password, roleHint = "admin") => {
    setAuthError("");

    if (!identifier || !identifier.trim() || identifier.trim() === "+998") {
      setAuthError("Iltimos, telefon raqamingizni to'liq kiriting!");
      return false;
    }

    const trimmedPass = (password || "").trim();
    let determinedRole = roleHint;
    const lower = identifier.toLowerCase().trim();

    if (lower.includes("teacher") || lower.includes("ustoz") || lower.includes("oqituvchi")) {
      determinedRole = "teacher";
    } else if (lower.includes("student") || lower.includes("oquvchi") || lower.includes("talaba")) {
      determinedRole = "student";
    } else if (lower.includes("admin")) {
      determinedRole = "admin";
    }

    let isValid = false;
    if (determinedRole === "admin") {
      isValid = getValidAdminPasswords().includes(trimmedPass);
    } else if (determinedRole === "teacher") {
      isValid = getValidTeacherPasswords().includes(trimmedPass);
    } else {
      isValid = getValidStudentPasswords().includes(trimmedPass);
    }

    if (!isValid) {
      setAuthError("Noto'g'ri parol kiritildi! Iltimos qaytadan urinib ko'ring.");
      return false;
    }

    let targetUserId = 201;
    if (determinedRole === "admin") {
      targetUserId = 201;
    } else if (determinedRole === "teacher") {
      // Find if this password matches an individual teacher
      const matchedTeacherEntry = Object.values(teacherCustomPasswords).find((item) => {
        const p = typeof item === "string" ? item : item?.password;
        return p === trimmedPass;
      });
      if (matchedTeacherEntry) {
        targetUserId = parseInt(matchedTeacherEntry.teacherId) || liveTeachers[0]?.id || 101;
      } else {
        targetUserId = liveTeachers[0]?.id || 101;
      }
    } else {
      targetUserId = liveStudents[0]?.id || 1;
    }

    setIsAuthenticated(true);
    setCurrentRole(determinedRole);
    setSelectedUserId(targetUserId);
    setUserLoginIdentifier(identifier.trim());

    localStorage.setItem("educontrol_is_authenticated", "true");
    localStorage.setItem("educontrol_role", determinedRole);
    localStorage.setItem("educontrol_user_id", targetUserId.toString());
    localStorage.setItem("educontrol_user_identifier", identifier.trim());
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("educontrol_is_authenticated");
    localStorage.removeItem("educontrol_role");
    localStorage.removeItem("educontrol_user_id");
    localStorage.removeItem("educontrol_user_identifier");
  };

  const switchRoleWithPassword = (newRole, password, targetUserId) => {
    setAuthError("");
    const trimmedPass = (password || "").trim();

    let isValid = false;
    if (newRole === "admin") {
      isValid = getValidAdminPasswords().includes(trimmedPass);
    } else if (newRole === "teacher") {
      isValid = getValidTeacherPasswords(targetUserId).includes(trimmedPass);
    } else {
      isValid = getValidStudentPasswords().includes(trimmedPass);
    }

    if (isValid) {
      setCurrentRole(newRole);
      const newUserId =
        targetUserId ||
        (newRole === "admin" ? 201 : newRole === "teacher" ? 101 : 1);
      setSelectedUserId(newUserId);
      localStorage.setItem("educontrol_role", newRole);
      localStorage.setItem("educontrol_user_id", newUserId.toString());
      return true;
    } else {
      setAuthError(
        "Noto'g'ri parol kiritildi! Iltimos qaytadan urinib ko'ring.",
      );
      return false;
    }
  };

  const isAdmin = currentRole === "admin";
  const isTeacher = currentRole === "teacher";
  const isStudent = currentRole === "student";

  const canManageGroups = isAdmin;
  const canManageStudents = isAdmin;
  const canMarkAttendance = isAdmin || isTeacher;
  const canManagePayments = isAdmin;

  return (
    <EduAuthContext.Provider
      value={{
        isAuthenticated,
        userLoginIdentifier,
        login,
        logout,
        currentRole,
        switchRoleWithPassword,
        user: user || DEFAULT_USER,
        authError,
        setAuthError,
        isAdmin,
        isTeacher,
        isStudent,
        canManageGroups,
        canManageStudents,
        canMarkAttendance,
        canManagePayments,
        changePassword,
        changeAdminPassword,
        changeTeacherPassword,
        changeStudentPassword,
        setTeacherIndividualPassword,
        removeTeacherIndividualPassword,
        adminPassword,
        teacherPassword,
        studentPassword,
        teacherCustomPasswords,
        updateProfile,
        customPassword: adminPassword,
        allAdmins: INITIAL_ADMINS,
        allTeachers: liveTeachers.length > 0 ? liveTeachers : [{ id: 101, name: "Abdulaziz Abdulhayev", subject: "Frontend ReactJS" }],
        allStudents: liveStudents.length > 0 ? liveStudents : [{ id: 1, name: "Abdulaziz Abdulhayev", groupName: "F-12 Guruh" }],
      }}
    >
      {children}
    </EduAuthContext.Provider>
  );
};

export const useEduAuth = () => {
  const context = useContext(EduAuthContext);
  if (!context) {
    throw new Error("useEduAuth must be used within EduAuthProvider");
  }
  return context;
};

export default EduAuthContext;
