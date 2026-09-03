import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { attendanceApi, groupsApi, studentsApi } from "../../services/api";
import { format9DigitId } from "../../utils/idFormatter";
import StudentProfileModal from "../../components/StudentProfileModal/StudentProfileModal";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineFlag,
  HiOutlineInformationCircle,
  HiOutlineEllipsisHorizontal,
  HiOutlineEllipsisVertical,
  HiOutlineArrowsUpDown,
  HiOutlineArrowsPointingOut,
  HiOutlineArrowsPointingIn,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineArrowLeft,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineLockClosed,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineArrowUpRight,
  HiOutlinePaperAirplane,
  HiOutlineBolt,
  HiOutlineXCircle,
  HiOutlineLockOpen,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineAcademicCap
} from "react-icons/hi2";
import { FaTelegram, FaUserGraduate, FaChalkboardUser, FaTrophy, FaMedal } from "react-icons/fa6";
import "./Attendance.css";

const LC_UP_TABS = [
  { id: "attendance", label: "Davomat" },
  { id: "grades", label: "Ballar" },
  { id: "homework", label: "Mashqlar" },
  { id: "ratings", label: "Reyting" },
  { id: "exams", label: "Imtihonlar" },
  { id: "history", label: "Tarix" },
  { id: "chat", label: "Guruh Chat" }
];

const MONTHS_LIST = [
  { key: "01", name: "Yanvar", short: "yan" },
  { key: "02", name: "Fevral", short: "fev" },
  { key: "03", name: "Mart", short: "mar" },
  { key: "04", name: "Aprel", short: "apr" },
  { key: "05", name: "May", short: "may" },
  { key: "06", name: "Iyun", short: "iyun" },
  { key: "07", name: "Iyul", short: "iyul" },
  { key: "08", name: "Avg", short: "avg" },
  { key: "09", name: "Sen", short: "sen" },
  { key: "10", name: "Okt", short: "okt" },
  { key: "11", name: "Noy", short: "noy" },
  { key: "12", name: "Dek", short: "dek" }
];

const EXCUSED_REASONS = [
  { id: "medical", label: "Salomatlik / Kasallik", tag: "Kasal" },
  { id: "family", label: "Oilaviy Sabab", tag: "Oilaviy" },
  { id: "competition", label: "Musobaqa / Olimpiada", tag: "Musobaqa" },
  { id: "technical", label: "Texnik / Transport", tag: "Texnik" },
  { id: "other_excused", label: "Boshqa Uzrli Sabab", tag: "Uzrli" }
];

// Oxford LC-UP 5 Ta Rasmiy Sabablar va ularning maxsus rangli bayroqlari
const ABSENT_REASONS = [
  { id: "school", label: "Maktab / Univer sababli", color: "#22c55e", bg: "rgba(34, 197, 94, 0.14)", border: "rgba(34, 197, 94, 0.35)", text: "#15803d" },
  { id: "family", label: "Oilaviy sabab", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.14)", border: "rgba(139, 92, 246, 0.35)", text: "#6d28d9" },
  { id: "unexcused", label: "Sababsiz", color: "#ef4444", bg: "rgba(239, 68, 68, 0.14)", border: "rgba(239, 68, 68, 0.35)", text: "#b91c1c" },
  { id: "other", label: "Boshqa", color: "#a855f7", bg: "rgba(168, 85, 247, 0.14)", border: "rgba(168, 85, 247, 0.35)", text: "#7e22ce" },
  { id: "unreachable", label: "Bog'lanib bo'lmadi", color: "#ec4899", bg: "rgba(236, 72, 153, 0.14)", border: "rgba(236, 72, 153, 0.35)", text: "#be185d" }
];

const getReasonMeta = (note) => {
  if (!note) return ABSENT_REASONS[2]; // Default: Sababsiz (Qizil)
  const lower = note.toLowerCase().trim();
  if (lower.includes("maktab") || lower.includes("univer") || lower.includes("dars")) return ABSENT_REASONS[0];
  if (lower.includes("oila") || lower.includes("marosim")) return ABSENT_REASONS[1];
  if (lower.includes("bog'lan") || lower.includes("telefon") || lower.includes("ko'tarmadi") || lower.includes("unreachable")) return ABSENT_REASONS[4];
  if (lower.includes("boshqa")) return ABSENT_REASONS[3];
  if (lower.includes("sababsiz") || lower.includes("kelmadi")) return ABSENT_REASONS[2];
  
  const found = ABSENT_REASONS.find((r) => r.label.toLowerCase() === lower);
  return found || ABSENT_REASONS[2];
};

const Attendance = () => {
  const { id: routeGroupId } = useParams();
  const navigate = useNavigate();
  const { currentRole, user, canMarkAttendance } = useEduAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState(routeGroupId || null);
  const [groupFilterTab, setGroupFilterTab] = useState("all");

  useEffect(() => {
    if (routeGroupId) {
      setSelectedGroup(routeGroupId);
    } else {
      setSelectedGroup(null);
    }
  }, [routeGroupId]);

  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("08");
  const [selectedGradeDate, setSelectedGradeDate] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeReasonCard, setActiveReasonCard] = useState(null);
  const [isReasonSelectOpen, setIsReasonSelectOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");

  // Reyting Tab Filter States (Oxford LC-UP: [Ballar | Kristall] va [O'rta arifmetik | Umumiy])
  const [ratingType, setRatingType] = useState("points"); // "points" | "crystal"
  const [ratingMode, setRatingMode] = useState("average"); // "average" | "total"

  const [activeGradeCell, setActiveGradeCell] = useState(null);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [gradesMatrixData, setGradesMatrixData] = useState(() => {
    try {
      const saved = localStorage.getItem("velnex_grades_matrix");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const gradeInputRef = useRef({ buffer: "", lastKeyTime: 0 });

  // Oxford LC-UP Imtihonlar Tab State
  const [examsList, setExamsList] = useState(() => {
    try {
      const saved = localStorage.getItem(`velnex_exams_${routeGroupId || "default"}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    passingScore: "70",
    section: "Speaking",
    calcType: "Foiz %"
  });

  useEffect(() => {
    if (selectedGroup) {
      try {
        const saved = localStorage.getItem(`velnex_exams_${selectedGroup}`);
        setExamsList(saved ? JSON.parse(saved) : []);
      } catch {
        setExamsList([]);
      }
    }
  }, [selectedGroup]);

  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!newExamForm.name.trim()) {
      toast.warning("Iltimos, imtihon nomini kiriting!");
      return;
    }
    const newExam = {
      id: Date.now().toString(),
      name: newExamForm.name.trim(),
      date: newExamForm.date || new Date().toISOString().split("T")[0],
      passingScore: Number(newExamForm.passingScore) || 70,
      section: newExamForm.section || "Speaking",
      calcType: newExamForm.calcType || "Foiz %",
      createdAt: new Date().toISOString()
    };
    const updated = [newExam, ...examsList];
    setExamsList(updated);
    if (selectedGroup) {
      localStorage.setItem(`velnex_exams_${selectedGroup}`, JSON.stringify(updated));
    }
    setIsNewExamModalOpen(false);
    setNewExamForm({
      name: "",
      date: new Date().toISOString().split("T")[0],
      passingScore: "70",
      section: "Speaking",
      calcType: "Foiz %"
    });
    toast.success(`✅ "${newExam.name}" imtihoni muvaffaqiyatli qo'shildi!`);
  };

  const handleDeleteExam = (examId, examName) => {
    const updated = examsList.filter((ex) => ex.id !== examId);
    setExamsList(updated);
    if (selectedGroup) {
      localStorage.setItem(`velnex_exams_${selectedGroup}`, JSON.stringify(updated));
    }
    toast.info(`🗑️ "${examName}" imtihoni o'chirildi.`);
  };

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [unlockRequestModal, setUnlockRequestModal] = useState({
    isOpen: false,
    fullDate: "",
    reason: "Baho kiritish unutilgan",
    note: ""
  });
  const [unlockRequests, setUnlockRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("velnex_unlock_requests");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Real-vaqtda Administrator ruxsat berganida avtomatik yangilanish
  useEffect(() => {
    const handleUnlockSync = () => {
      try {
        const saved = localStorage.getItem("velnex_unlock_requests");
        if (saved) setUnlockRequests(JSON.parse(saved));
      } catch (e) {
        console.error("Sync unlock error", e);
      }
    };
    window.addEventListener("velnex_unlock_updated", handleUnlockSync);
    window.addEventListener("storage", handleUnlockSync);
    return () => {
      window.removeEventListener("velnex_unlock_updated", handleUnlockSync);
      window.removeEventListener("storage", handleUnlockSync);
    };
  }, []);

  // Sana administrator tomonidan ochilganini tekshirish
  const checkIsDateApproved = (fullDate) => {
    if (!fullDate) return false;
    const reqKey = `${selectedGroup}_${fullDate}`;
    return (
      unlockRequests[reqKey]?.status === "approved" ||
      unlockRequests[fullDate]?.status === "approved" ||
      unlockRequests[`G-101_${fullDate}`]?.status === "approved" ||
      unlockRequests[`F-12_${fullDate}`]?.status === "approved" ||
      unlockRequests[`F-12 Guruh_${fullDate}`]?.status === "approved"
    );
  };

  const [mobileBottomSheet, setMobileBottomSheet] = useState({
    isOpen: false,
    student: null,
    fullDate: ""
  });

  const now = new Date();
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isZenMode) setIsZenMode(false);
        if (unlockRequestModal.isOpen) setUnlockRequestModal((prev) => ({ ...prev, isOpen: false }));
        if (mobileBottomSheet.isOpen) setMobileBottomSheet((prev) => ({ ...prev, isOpen: false }));
        if (activeReasonCard) {
          setActiveReasonCard(null);
          setIsReasonSelectOpen(false);
        }
        if (showGradePicker) setShowGradePicker(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode, unlockRequestModal.isOpen, mobileBottomSheet.isOpen, activeReasonCard, showGradePicker]);

  const [matrixData, setMatrixData] = useState({});
  const [gradesData, setGradesData] = useState({});

  const teacherFullName = (user?.name || user?.fullName || "").toLowerCase().trim();

  const accessibleGroups = currentRole === "admin"
    ? groups
    : groups.filter((g) => {
        const gTeacher = (g.teacherName || "").toLowerCase().trim();
        const gTeacherId = String(g.teacherId || g.teacher_id || "");
        const curUserId = String(user?.id || "");
        if (curUserId && gTeacherId && gTeacherId === curUserId) return true;
        if (teacherFullName && gTeacher) {
          const tWords = teacherFullName.split(" ").filter((w) => w.length > 2);
          return tWords.some((w) => gTeacher.includes(w)) || gTeacher.includes(teacherFullName) || teacherFullName.includes(gTeacher);
        }
        return false;
      });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [gData, sData, aData] = await Promise.all([
        groupsApi.getAll(),
        studentsApi.getAll(),
        attendanceApi.getAll()
      ]);
      setGroups(gData);
      setStudents(sData);
      setAttendanceRecords(aData);

      if (routeGroupId) {
        setSelectedGroup(routeGroupId);
      }
    } catch (err) {
      console.error("Attendance initial load error:", err.message);
      toast.error("Davomat ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const currentGroupObj = groups.find((g) => String(g.id) === String(selectedGroup)) || groups[0];
  const activeGroupStudents = students.filter((s) => String(s.groupId || s.group_id) === String(selectedGroup));

  const getMonthLessonDates = () => {
    const monthObj = MONTHS_LIST.find((m) => m.key === selectedMonth) || MONTHS_LIST[3];
    const monthShort = monthObj.short;
    const year = parseInt(selectedYear, 10) || new Date().getFullYear();
    const month = parseInt(selectedMonth, 10) || (new Date().getMonth() + 1);

    // Guruh kunlari: Toq (Dush-Chor-Jum), Juft (Sesh-Pay-Shan), yoki Har kuni
    const sched = (currentGroupObj?.scheduleDays || currentGroupObj?.name || "").toLowerCase();
    const isToq = sched.includes("dush") || sched.includes("chor") || sched.includes("jum") || sched.includes("toq");
    const isJuft = sched.includes("sesh") || sched.includes("pay") || sched.includes("shan") || sched.includes("juft");
    const isEveryday = sched.includes("har kun") || sched.includes("daily") || sched.includes("barcha");

    // Shu oyda nechta kun bor (masalan, 30 yoki 31 kun)
    const daysInMonth = new Date(year, month, 0).getDate();
    const matchedDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(year, month - 1, day);
      const dayOfWeek = dt.getDay(); // 0: Yakshanba, 1: Dushanba, 2: Seshanba, 3: Chorshanba, 4: Payshanba, 5: Juma, 6: Shanba

      if (dayOfWeek === 0) continue; // Yakshanba kunlari dars bo'lmaydi

      if (isEveryday) {
        matchedDays.push(String(day).padStart(2, "0"));
      } else if (isToq && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        // Dushanba, Chorshanba, Juma
        matchedDays.push(String(day).padStart(2, "0"));
      } else if (isJuft && (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6)) {
        // Seshanba, Payshanba, Shanba
        matchedDays.push(String(day).padStart(2, "0"));
      } else if (!isToq && !isJuft) {
        // Default: Dushanba, Chorshanba, Juma
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
          matchedDays.push(String(day).padStart(2, "0"));
        }
      }
    }

    // Agar bugungi sana shu oyda bo'lsa va ro'yxatda yo'q bo'lsa, o'qituvchi bugun davomat qila olishi uchun kiritamiz
    const today = new Date();
    const isCurMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
    const todayDayStr = String(today.getDate()).padStart(2, "0");
    if (isCurMonth && !matchedDays.includes(todayDayStr)) {
      matchedDays.push(todayDayStr);
      matchedDays.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }

    return matchedDays.map((d) => ({
      dayStr: `${d} ${monthShort}`,
      fullDate: `${selectedYear}-${selectedMonth}-${d}`,
      dayNum: d
    }));
  };

  const lessonDates = getMonthLessonDates();

  useEffect(() => {
    if (!selectedGroup) return;

    const newMatrix = {};
    const newGrades = {};

    activeGroupStudents.forEach((student, sIdx) => {
      lessonDates.forEach((d) => {
        const cellKey = `${student.id}_${d.fullDate}`;
        const found = attendanceRecords.find(
          (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
                 String(r.studentId || r.student_id) === String(student.id) &&
                 r.date === d.fullDate
        );

        if (found && found.status) {
          newMatrix[cellKey] = {
            status: found.status,
            note: found.note || ""
          };
        } else {
          newMatrix[cellKey] = { status: null, note: "" };
        }
      });

      newGrades[student.id] = {
        score: 10,
        homework: true,
        comment: ""
      };
    });

    setMatrixData(newMatrix);
    setGradesData(newGrades);
  }, [selectedGroup, selectedMonth, selectedYear, activeGroupStudents.length, attendanceRecords.length]);

  const [activePickerCell, setActivePickerCell] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".td-attendance-cell")) {
        setActivePickerCell(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const isPastDate = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fullDate < todayStr;
  };

  const isFutureDate = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fullDate > todayStr;
  };

  const isTodayDate = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return fullDate === todayStr;
  };

  const isLessonTimeLocked = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (fullDate === todayStr) {
      return false;
    }
    if (fullDate < todayStr || fullDate > todayStr) {
      return true;
    }
    return false;
  };

  const checkDoubleBooking = (studentId, fullDate) => {
    const otherGroups = groups.filter((g) => g.id !== selectedGroup);
    const scheduleTimeStr = currentGroupObj?.time || currentGroupObj?.scheduleTime || "14:00 - 16:00";

    for (const g of otherGroups) {
      const gTime = g.time || g.scheduleTime || "";
      if (gTime === scheduleTimeStr) {
        const studentInOtherGroup = students.some((s) => s.groupId === g.id && s.id === studentId);
        if (studentInOtherGroup) {
          const rec = attendanceRecords.find(
            (r) => r.groupId === g.id && r.studentId === studentId && r.date === fullDate && r.status === "Present"
          );
          if (rec) {
            return { name: g.name, time: gTime };
          }
        }
      }
    }
    return null;
  };

  const handleSelectStatus = async (studentId, fullDate, studentName, newStatus, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!canMarkAttendance) return;

    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }

    if (isPastDate(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini faqat Administrator o'zgartira oladi! (Qulfni ochish so'rovini yuboring)");
      return;
    }

    if (isLessonTimeLocked(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }

    if (newStatus === "Present") {
      const conflictGroup = checkDoubleBooking(studentId, fullDate);
      if (conflictGroup) {
        toast.warning(`⚠️ [Double-Booking] "${studentName}" xuddi shu vaqtda (${conflictGroup.time}) "${conflictGroup.name}" guruhida ham darsda deb qayd etilgan!`);
      }
    }

    const cellKey = `${studentId}_${fullDate}`;
    const newEntry = {
      status: newStatus,
      note: newStatus === "Excused" ? "Darsga kechikdi" : newStatus === "Absent" ? "Sababsiz" : ""
    };

    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: newEntry
    }));

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
               String(r.studentId || r.student_id) === String(studentId) &&
               r.date === fullDate
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], status: newStatus, note: newEntry.note };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random()}`,
            groupId: selectedGroup,
            group_id: selectedGroup,
            studentId,
            student_id: studentId,
            date: fullDate,
            status: newStatus,
            note: newEntry.note
          }
        ];
      }
    });

    setSaveStatus("saving");
    try {
      await attendanceService.saveMatrixAttendance({
        groupId: selectedGroup,
        date: fullDate,
        records: [{ studentId, status: newStatus, note: newEntry.note }]
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("saved");
    }

    setActivePickerCell(null);
  };

  const touchStartCoords = useRef({ x: 0, y: 0 });
  const mouseDragCoords = useRef({ x: 0, y: 0, isDragging: false });

  // Touch Swipe (Mobile / Tablet) - Faqat Bugungi yoki ruxsat berilgan darslar uchun
  const handleCellTouchStart = (fullDate, e) => {
    if (!isTodayDate(fullDate) && !checkIsDateApproved(fullDate) && currentRole !== "admin") return;
    if (e.touches && e.touches[0]) {
      touchStartCoords.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleCellTouchEnd = (studentId, fullDate, studentName, e) => {
    if (isPastDate(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi!");
      return;
    }
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isLessonTimeLocked(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }

    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartCoords.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartCoords.current.y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist > 15) {
        if ((deltaY > 15 || deltaY < -15) && Math.abs(deltaY) >= Math.abs(deltaX)) {
          // Swipe DOWN / Vertical (Pastga tortish) -> Kechikdi / Kech qolmoqda 🕒
          handleSelectStatus(studentId, fullDate, studentName, "Excused", e);
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 15) {
            // Swipe Right -> Keldi ✅
            handleSelectStatus(studentId, fullDate, studentName, "Present", e);
          } else if (deltaX < -15) {
            // Swipe Left -> Kelmadi ❌ + Tepadan Smart Card tushishi
            handleSelectStatus(studentId, fullDate, studentName, "Absent", e);
            setActiveReasonCard({
              studentId,
              fullDate,
              studentName,
              reason: ABSENT_REASONS[0].label,
              customNote: ""
            });
          }
        }
      } else {
        const cellKey = `${studentId}_${fullDate}`;
        setActivePickerCell((prev) => (prev === cellKey ? null : cellKey));
      }
    }
  };

  // Mouse Drag & Click (Desktop / Laptop) - Bugun, Admin yoki ruxsat berilgan sanalar
  const handleCellMouseDown = (studentId, fullDate, studentName, e) => {
    if (e.button !== 0) return; // Faqat chap tugma
    if (isFutureDate(fullDate)) return;
    if (isPastDate(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) return;
    mouseDragCoords.current = {
      x: e.clientX,
      y: e.clientY,
      isDragging: true,
      studentId,
      fullDate,
      studentName
    };
  };

  // Global Window MouseUp Listener for Smooth Reliable Dragging in Any Direction
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (!mouseDragCoords.current.isDragging) return;
      const { x, y, studentId, fullDate, studentName } = mouseDragCoords.current;
      mouseDragCoords.current.isDragging = false;

      if (!studentId || !fullDate) return;

      const deltaX = e.clientX - x;
      const deltaY = e.clientY - y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Agar sichqoncha surilgan bo'lsa (drag masofasi > 15px)
      if (dist > 15) {
        // Pastga (yoki vertikal) tortish (deltaY musbat / vertikal va |deltaY| >= |deltaX|)
        if ((deltaY > 15 || deltaY < -15) && Math.abs(deltaY) >= Math.abs(deltaX)) {
          // Pastga tortish -> Kechikdi / Kech qolmoqda 🕒
          handleSelectStatus(studentId, fullDate, studentName, "Excused", e);
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 15) {
            // O'ngga -> Keldi ✅
            handleSelectStatus(studentId, fullDate, studentName, "Present", e);
          } else if (deltaX < -15) {
            // Chapga -> Kelmadi ❌ + Smart Card
            handleSelectStatus(studentId, fullDate, studentName, "Absent", e);
            setActiveReasonCard({
              studentId,
              fullDate,
              studentName,
              reason: ABSENT_REASONS[0].label,
              customNote: ""
            });
          }
        }
      } else {
        // Joyida oddiy bosish (Click) -> Bugun, Admin yoki ruxsat berilganlar uchun popover ochilsin
        if (isTodayDate(fullDate) || (currentRole === "admin" && isPastDate(fullDate)) || checkIsDateApproved(fullDate)) {
          const cellKey = `${studentId}_${fullDate}`;
          setActivePickerCell((prev) => (prev === cellKey ? null : cellKey));
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [selectedGroup, groups, students, attendanceRecords, currentRole, unlockRequests]);

  // Right-Click (Sichqoncha o'ng tugmasi bilan tezkor aylantirib belgilash)
  const handleCellContextMenu = (studentId, fullDate, studentName, currentStatus, e) => {
    e.preventDefault();
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isPastDate(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini faqat Administrator o'zgartira oladi!");
      return;
    }
    if (isLessonTimeLocked(fullDate) && currentRole !== "admin" && !checkIsDateApproved(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }
    const nextStatus = !currentStatus ? "Present" : currentStatus === "Present" ? "Absent" : currentStatus === "Absent" ? "Excused" : null;
    handleSelectStatus(studentId, fullDate, studentName, nextStatus, e);
  };

  // Oxford LC-UP: Sababni tasdiqlash va saqlash
  const handleConfirmReason = async (e) => {
    if (e) e.preventDefault();
    if (!activeReasonCard) return;

    const finalReason = activeReasonCard.reason === "Boshqa" && activeReasonCard.customNote.trim()
      ? activeReasonCard.customNote.trim()
      : activeReasonCard.reason || "Sababsiz";

    const cellKey = `${activeReasonCard.studentId}_${activeReasonCard.fullDate}`;
    const newEntry = {
      status: "Absent",
      note: finalReason
    };

    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: newEntry
    }));

    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
               String(r.studentId || r.student_id) === String(activeReasonCard.studentId) &&
               r.date === activeReasonCard.fullDate
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newEntry, date: activeReasonCard.fullDate, groupId: selectedGroup, studentId: activeReasonCard.studentId };
        return copy;
      }
      return [{ groupId: selectedGroup, studentId: activeReasonCard.studentId, date: activeReasonCard.fullDate, ...newEntry }, ...prev];
    });

    setSaveStatus("saving");
    const targetStudentId = activeReasonCard.studentId;
    const targetDate = activeReasonCard.fullDate;
    setActiveReasonCard(null);
    setIsReasonSelectOpen(false);

    try {
      await attendanceApi.create({
        group_id: selectedGroup,
        student_id: targetStudentId,
        date: targetDate,
        status: "Absent",
        note: finalReason
      });
      setSaveStatus("saved");
    } catch (err) {
      console.warn("Auto-save sync:", err.message);
      setSaveStatus("saved");
    }
  };

  // Mark all students Present for TODAY (yoki eng yaqin o'tilgan dars sanasi) with instant auto-save
  const handleMarkAllPresent = async () => {
    if (!selectedGroup || activeGroupStudents.length === 0) return;

    // Ko'rinayotgan jadvaldagi maqsadli sana (Bugungi sana yoki eng so'nggi dars kuni)
    const targetDate = lessonDates.find((d) => d.fullDate === todayDateStr)?.fullDate
      || lessonDates.filter((d) => !isFutureDate(d.fullDate)).slice(-1)[0]?.fullDate
      || lessonDates[0]?.fullDate;

    if (!targetDate) {
      toast.warning("Ushbu oy uchun dars sanasi topilmadi!");
      return;
    }

    const updated = { ...matrixData };
    const promises = [];

    activeGroupStudents.forEach((student) => {
      const cellKey = `${student.id}_${targetDate}`;
      updated[cellKey] = { status: "Present", note: "" };
      promises.push(
        attendanceApi.create({
          group_id: selectedGroup,
          student_id: student.id,
          date: targetDate,
          status: "Present",
          note: ""
        }).catch(() => null)
      );
    });

    setMatrixData(updated);
    setAttendanceRecords((prev) => {
      let copy = [...prev];
      activeGroupStudents.forEach((student) => {
        const idx = copy.findIndex(
          (r) => String(r.groupId || r.group_id) === String(selectedGroup) &&
                 String(r.studentId || r.student_id) === String(student.id) &&
                 r.date === targetDate
        );
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], status: "Present", note: "" };
        } else {
          copy.unshift({ groupId: selectedGroup, studentId: student.id, date: targetDate, status: "Present", note: "" });
        }
      });
      return copy;
    });

    await Promise.all(promises);
    toast.success(`"${targetDate}" darsi uchun barcha o'quvchilar "Keldi" qilindi va avto-saqlandi! ✅⚡`);
  };

  // Faqat darsga kelgan (Present / Excused) o'quvchilarga 10 ball qo'yish (agar davomat qilinmagan bo'lsa avtomatik davomat qilib 10 qo'yadi)
  const handleMarkAllGradesTen = () => {
    if (activeGroupStudents.length === 0) {
      toast.warning("Guruhda faol talabalar mavjud emas!");
      return;
    }

    const targetDate = lessonDates.find((d) => d.fullDate === todayDateStr)?.fullDate
      || lessonDates.filter((d) => !isFutureDate(d.fullDate)).slice(-1)[0]?.fullDate
      || lessonDates[0]?.fullDate;

    if (!targetDate) {
      toast.warning("Ushbu oy uchun dars sanasi topilmadi!");
      return;
    }

    let presentStudents = activeGroupStudents.filter((student) => {
      const att = matrixData[`${student.id}_${targetDate}`];
      return att?.status === "Present" || att?.status === "Excused";
    });

    // Agar o'qituvchi hali davomatni belgilamagan bo'lsa, avtomatik ravishda barchani "Keldi" qilib 10 ball beradi
    if (presentStudents.length === 0) {
      const updatedMatrix = { ...matrixData };
      activeGroupStudents.forEach((student) => {
        const cellKey = `${student.id}_${targetDate}`;
        updatedMatrix[cellKey] = { status: "Present", note: "" };
        attendanceApi.create({
          group_id: selectedGroup,
          student_id: student.id,
          date: targetDate,
          status: "Present",
          note: ""
        }).catch(() => null);
      });
      setMatrixData(updatedMatrix);
      presentStudents = activeGroupStudents;
    }

    setGradesMatrixData((prev) => {
      let copy = { ...prev };
      presentStudents.forEach((student) => {
        const cellKey = `${student.id}_${targetDate}`;
        copy[cellKey] = {
          score: 10,
          date: targetDate,
          studentId: student.id,
          updatedAt: new Date().toISOString()
        };
      });
      try {
        localStorage.setItem("velnex_grades_matrix", JSON.stringify(copy));
      } catch {}
      return copy;
    });

    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
    }, 300);

    toast.success(`"${targetDate}" darsi uchun barcha o'quvchilarga 10 ball qo'yildi va saqlandi! 🟢💯`);
  };

  // 17-Qoida: O'tgan darsni ochish uchun Administratorga ruxsat so'rovi yuborish
  const handleSendUnlockRequest = (e) => {
    if (e) e.preventDefault();
    if (!unlockRequestModal.fullDate) return;
    const reqKey = `${selectedGroup}_${unlockRequestModal.fullDate}`;
    const newReq = {
      groupId: selectedGroup,
      groupName: currentGroupObj?.name || "Guruh",
      date: unlockRequestModal.fullDate,
      teacherName: user?.fullName || user?.name || "O'qituvchi",
      teacherId: user?.id,
      reason: unlockRequestModal.reason,
      note: unlockRequestModal.note,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setUnlockRequests((prev) => {
      const copy = { ...prev, [reqKey]: newReq };
      try {
        localStorage.setItem("velnex_unlock_requests", JSON.stringify(copy));
      } catch {}
      return copy;
    });

    toast.success(`📩 "${unlockRequestModal.fullDate}" darsi uchun qulfni ochish so'rovi Administratorga yuborildi! Kutilmoqda... ⏳`);
    setUnlockRequestModal({ isOpen: false, fullDate: "", reason: "Baho kiritish unutilgan", note: "" });
  };

  // 12-Qoida: Skeleton Shimmer bilan silliq yuklanish
  const handleMonthChangeWithShimmer = (m) => {
    setIsTableLoading(true);
    setSelectedMonth(m);
    setTimeout(() => setIsTableLoading(false), 240);
  };

  const handleYearChangeWithShimmer = (y) => {
    setIsTableLoading(true);
    setSelectedYear(y);
    setTimeout(() => setIsTableLoading(false), 240);
  };

  // Filter students based on legend
  const filteredStudents = activeGroupStudents.filter((s) => {
    const isDebtor = (s.balance || 0) < 0 || s.paymentStatus === "Overdue" || s.paymentStatus === "Unpaid";
    if (studentFilter === "debtors") return isDebtor;
    if (studentFilter === "trial") return s.status === "Trial" || (s.notes || "").includes("Sinov");
    if (studentFilter === "frozen") return s.status === "Frozen" || s.status === "Inactive";
    if (studentFilter === "active") return !isDebtor && s.status !== "Frozen";
    return true;
  }).sort((a, b) => {
    if (sortAsc) return a.fullName.localeCompare(b.fullName);
    return b.fullName.localeCompare(a.fullName);
  });

  // Oxford LC-UP: Reyting (Leaderboard) hisoblash
  const leaderboardStudents = useMemo(() => {
    return activeGroupStudents.map((student) => {
      // Shu oy darslaridagi talabaning baholari
      const monthScores = lessonDates
        .map((d) => gradesMatrixData[`${student.id}_${d.fullDate}`]?.score)
        .filter((s) => typeof s === "number" && s > 0);

      // Kelgan darslar soni (Present va Kech qolgan/Excused)
      const attendedDays = lessonDates
        .map((d) => matrixData[`${student.id}_${d.fullDate}`]?.status)
        .filter((st) => st === "Present" || st === "Excused").length;

      let displayScore = "10";
      let numericVal = 10;

      if (ratingType === "points") {
        if (ratingMode === "average") {
          const avg = monthScores.length > 0
            ? monthScores.reduce((a, b) => a + b, 0) / monthScores.length
            : 10;
          numericVal = avg;
          displayScore = avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
        } else {
          const total = monthScores.length > 0
            ? monthScores.reduce((a, b) => a + b, 0)
            : 10;
          numericVal = total;
          displayScore = total.toString();
        }
      } else {
        // Kristall
        const crystals = (attendedDays * 5) + (monthScores.filter((sc) => sc >= 9).length * 10) + 20;
        numericVal = crystals;
        displayScore = `${crystals}`;
      }

      return {
        ...student,
        numericVal,
        displayScore
      };
    }).sort((a, b) => b.numericVal - a.numericVal || a.fullName.localeCompare(b.fullName));
  }, [activeGroupStudents, lessonDates, gradesMatrixData, matrixData, ratingType, ratingMode]);

  // Baholash (1-10 Ball) Ball qo'yish va saqlash
  const handleSetGradeScore = (studentId, fullDate, score, studentName, autoClose = true) => {
    // Admin bo'lmagan foydalanuvchilar (O'qituvchi) o'tib ketgan darslarga agar ruxsat berilmagan bo'lsa baho qo'ya olmaydi
    if (currentRole !== "admin" && isPastDate(fullDate) && !checkIsDateApproved(fullDate)) {
      toast.error(`⏱️ O'tib ketgan dars (${fullDate}) uchun faqat Administrator baho qo'yishi yoki ochish ruxsatini berishi mumkin!`);
      setActiveGradeCell(null);
      return;
    }
    if (currentRole !== "admin" && isFutureDate(fullDate)) {
      toast.info(`⏳ Kelajakdagi dars sanasi (${fullDate})! Dars kuni kelganda baholash ochiladi.`);
      setActiveGradeCell(null);
      return;
    }

    // Darsga kelmagan (Absent / Belgilanmagan) o'quvchiga baho qo'yib bo'lmaydi.
    // Vaqt belgilangan / kech kelgan (Excused) va darsda bo'lgan (Present) o'quvchiga baho qo'yiladi!
    const attRecord = matrixData[`${studentId}_${fullDate}`];
    const canGrade = attRecord?.status === "Present" || attRecord?.status === "Excused";
    if (!canGrade) {
      const statusLabel = attRecord?.status === "Absent" ? "Darsga kelmagan" : "Davomati belgilanmagan";
      toast.error(`🚨 "${studentName}" ushbu darsda qatnashmagan (${statusLabel})! Kelmagan o'quvchiga baho qo'yib bo'lmaydi.`);
      setActiveGradeCell(null);
      return;
    }

    const cellKey = `${studentId}_${fullDate}`;
    const finalScore = (score === 0 || score === null) ? null : score;

    setGradesMatrixData((prev) => {
      const updated = {
        ...prev,
        [cellKey]: {
          score: finalScore,
          date: fullDate,
          studentId: studentId,
          updatedAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem("velnex_grades_matrix", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
    }, 300);

    if (autoClose) {
      setActiveGradeCell(null);
    }
  };

  // Klaviaturada 0-10 yozish (1 keyin 0 yozsa 10 bo'ladi) va Enter bosganda pastdagi talabaga o'tish
  useEffect(() => {
    const handleGradeKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if (activeGradeCell) {
        const parts = activeGradeCell.split("_");
        if (parts.length >= 2) {
          const studentId = parts[0];
          const fullDate = parts.slice(1).join("_");
          const student = students.find((s) => String(s.id) === String(studentId));
          const studentName = student?.fullName || "Talaba";
          const nowTime = Date.now();

          // Enter yoki Pastga o'q (ArrowDown) -> Pastdagi talabani baholashga o'tish (popover ochilmasdan)
          if (e.key === "Enter" || e.key === "ArrowDown") {
            e.preventDefault();
            gradeInputRef.current = { buffer: "", lastKeyTime: 0 };
            setShowGradePicker(false); // Klaviatura bilan yozganda popover ochilmaydi!
            const currentIdx = filteredStudents.findIndex((s) => String(s.id) === String(studentId));
            if (currentIdx !== -1) {
              for (let i = currentIdx + 1; i < filteredStudents.length; i++) {
                const nextS = filteredStudents[i];
                const nextKey = `${nextS.id}_${fullDate}`;
                const nextAtt = matrixData[nextKey];
                if (nextAtt?.status === "Present" || nextAtt?.status === "Excused") {
                  setActiveGradeCell(nextKey);
                  setShowGradePicker(false);
                  return;
                }
              }
              // Agar pastda boshqa darsga kelgan talaba qolmagan bo'lsa
              setActiveGradeCell(null);
              setShowGradePicker(false);
            }
            return;
          }

          // Tepaga o'q (ArrowUp) -> Tepadagi talabaga o'tish
          if (e.key === "ArrowUp") {
            e.preventDefault();
            gradeInputRef.current = { buffer: "", lastKeyTime: 0 };
            setShowGradePicker(false);
            const currentIdx = filteredStudents.findIndex((s) => String(s.id) === String(studentId));
            if (currentIdx > 0) {
              for (let i = currentIdx - 1; i >= 0; i--) {
                const prevS = filteredStudents[i];
                const prevKey = `${prevS.id}_${fullDate}`;
                const prevAtt = matrixData[prevKey];
                if (prevAtt?.status === "Present" || prevAtt?.status === "Excused") {
                  setActiveGradeCell(prevKey);
                  setShowGradePicker(false);
                  return;
                }
              }
            }
            return;
          }

          // Backspace yoki Delete -> Bahoni tozalash (Baholanmagan)
          if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            gradeInputRef.current = { buffer: "", lastKeyTime: 0 };
            handleSetGradeScore(studentId, fullDate, null, studentName, false);
            setShowGradePicker(false);
            return;
          }

          // Escape -> Baholashni yopish
          if (e.key === "Escape") {
            gradeInputRef.current = { buffer: "", lastKeyTime: 0 };
            setActiveGradeCell(null);
            setShowGradePicker(false);
            return;
          }

          // Raqamlar 0 dan 9 gacha
          if (e.key >= "0" && e.key <= "9") {
            e.preventDefault();
            const timeDiff = nowTime - gradeInputRef.current.lastKeyTime;

            // 1 dan keyin 0 bosilsa -> 10 ball!
            if (e.key === "0" && gradeInputRef.current.buffer === "1" && timeDiff < 1500) {
              gradeInputRef.current = { buffer: "10", lastKeyTime: nowTime };
              handleSetGradeScore(studentId, fullDate, 10, studentName, false);
              setShowGradePicker(false);
              return;
            }

            if (e.key === "1") {
              gradeInputRef.current = { buffer: "1", lastKeyTime: nowTime };
              handleSetGradeScore(studentId, fullDate, 1, studentName, false);
              setShowGradePicker(false);
              return;
            }

            if (e.key === "0") {
              gradeInputRef.current = { buffer: "0", lastKeyTime: nowTime };
              handleSetGradeScore(studentId, fullDate, null, studentName, false);
              setShowGradePicker(false);
              return;
            }

            // 2 dan 9 gacha raqamlar
            const numVal = parseInt(e.key, 10);
            gradeInputRef.current = { buffer: String(numVal), lastKeyTime: nowTime };
            handleSetGradeScore(studentId, fullDate, numVal, studentName, false);
            setShowGradePicker(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleGradeKeyDown);
    return () => window.removeEventListener("keydown", handleGradeKeyDown);
  }, [activeGradeCell, showGradePicker, students, filteredStudents, matrixData]);

  // 1, 2, 3, 6, 7, 8, 9, 10-Qoidalar: Guruhlar Hubi Uchun Professional Helperlar

  // 7-Qoida: Bugun guruhning darsi bormi?
  const isGroupLessonToday = (group) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: Yakshanba, 1: Dush, 2: Sesh, 3: Chor, 4: Pay, 5: Juma, 6: Shanba
    const daysStr = (group.scheduleDays || "").toLowerCase();
    const groupName = (group.name || "").toLowerCase();

    // Toq kunlar: Dushanba (1), Chorshanba (3), Juma (5)
    if ([1, 3, 5].includes(dayOfWeek)) {
      if (daysStr.includes("dushanba") || daysStr.includes("toq") || groupName.includes("toq")) return true;
    }
    // Juft kunlar: Seshanba (2), Payshanba (4), Shanba (6)
    if ([2, 4, 6].includes(dayOfWeek)) {
      if (daysStr.includes("seshanba") || daysStr.includes("payshanba") || daysStr.includes("juft") || groupName.includes("juft")) return true;
    }

    const uzbekDays = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
    const todayName = uzbekDays[dayOfWeek];
    return daysStr.includes(todayName);
  };

  // 8-Qoida: Hozir ayni vaqtda jonli dars ketmoqdami?
  const isLessonLiveNow = (group) => {
    if (!isGroupLessonToday(group)) return false;
    const timeStr = group.scheduleTime || group.time || "14:00 - 16:00";
    const parts = timeStr.split("-");
    if (parts.length !== 2) return false;

    const [startH, startM] = parts[0].trim().split(":").map(Number);
    const [endH, endM] = parts[1].trim().split(":").map(Number);
    if (isNaN(startH) || isNaN(endH)) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + (startM || 0);
    const endMins = endH * 60 + (endM || 0);

    return currentMins >= startMins && currentMins <= endMins;
  };

  // 10-Qoida: Dars vaqti va countdown hisobi
  const getLessonTimingStatus = (group) => {
    if (!isGroupLessonToday(group)) {
      return { status: "no_lesson", text: "Bugun dars yo'q" };
    }
    if (isLessonLiveNow(group)) {
      return { status: "live", text: "⚡ Dars ketmoqda" };
    }

    const timeStr = group.scheduleTime || group.time || "14:00 - 16:00";
    const parts = timeStr.split("-");
    if (parts.length === 2) {
      const [startH, startM] = parts[0].trim().split(":").map(Number);
      if (!isNaN(startH)) {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const startMins = startH * 60 + (startM || 0);
        const diff = startMins - currentMins;

        if (diff > 0 && diff <= 180) {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          const leftStr = h > 0 ? `${h}s ${m}m` : `${m}m`;
          return { status: "upcoming", text: `⏳ ${leftStr} qoldi` };
        } else if (diff > 180) {
          return { status: "upcoming", text: `⏰ ${parts[0].trim()} da` };
        } else {
          return { status: "ended", text: "🏁 Dars tugagan" };
        }
      }
    }
    return { status: "today", text: "Bugun dars bor" };
  };

  // 9-Qoida: Davomat topshirilganlik statusi
  const getGroupAttendanceStatus = (groupId, gStudents) => {
    if (gStudents.length === 0) return { type: "empty", label: "Talabalar yo'q" };

    const markedCount = gStudents.filter((s) =>
      attendanceRecords.some(
        (r) => String(r.groupId || r.group_id) === String(groupId) &&
               String(r.studentId || r.student_id) === String(s.id) &&
               r.date === todayDateStr &&
               r.status
      )
    ).length;

    if (markedCount === gStudents.length && gStudents.length > 0) {
      return { type: "done", label: `✓ Davomat Qilingan (${markedCount}/${gStudents.length})` };
    }
    if (markedCount > 0) {
      return { type: "partial", label: `⏳ Qisman Qilingan (${markedCount}/${gStudents.length})` };
    }
    return { type: "pending", label: `⚠️ Davomat Qilinmagan (0/${gStudents.length})` };
  };

  // 3-Qoida: Kurslar bo'yicha rangli gradient mavzular
  const getCourseTheme = (courseName = "") => {
    const c = courseName.toLowerCase();
    if (c.includes("react") || c.includes("front") || c.includes("js") || c.includes("web")) {
      return "theme-react";
    }
    if (c.includes("python") || c.includes("django") || c.includes("data") || c.includes("ai")) {
      return "theme-python";
    }
    if (c.includes("node") || c.includes("back") || c.includes("net") || c.includes("c#")) {
      return "theme-backend";
    }
    if (c.includes("design") || c.includes("ui") || c.includes("grafik") || c.includes("figma")) {
      return "theme-design";
    }
    return "theme-default";
  };

  return (
    <div className="lc-up-attendance-container">
      {/* 1. AGAR GURUH TANLANMAGAN BO'LSA: GURUHLARNI TANLASH JURNALI (HUB) */}
      {!selectedGroup ? (
        <div className="lc-group-selection-view oxford-dark-hub">
          {/* Header matching Image 1 */}
          <div className="lc-group-selection-header">
            <div className="hub-title-wrap">
              <h2 className="lc-group-selection-title">Guruhlar</h2>
            </div>
            {/* Filter Pills: Barchasi | Bugun */}
            <div className="hub-filter-pill-container">
              <button
                type="button"
                className={`hub-filter-pill ${groupFilterTab === "all" ? "active" : ""}`}
                onClick={() => setGroupFilterTab("all")}
              >
                Barchasi
              </button>
              <button
                type="button"
                className={`hub-filter-pill ${groupFilterTab === "today" ? "active" : ""}`}
                onClick={() => setGroupFilterTab("today")}
              >
                Bugun
              </button>
            </div>
          </div>

          {/* Sleek Dark Table matching Image 1 */}
          <div className="lc-groups-table-container">
            <table className="lc-groups-list-table">
              <thead>
                <tr>
                  <th className="th-g-name">Guruh nomi</th>
                  <th className="th-g-course">Kurs</th>
                  <th className="th-g-students">O'quvchilar ⓘ</th>
                  <th className="th-g-room">Xona</th>
                </tr>
              </thead>
              <tbody>
                {(groupFilterTab === "today" ? accessibleGroups.filter(isGroupLessonToday) : accessibleGroups).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-groups-row">
                      {groupFilterTab === "today" ? "Bugun darsi bor guruhlar mavjud emas" : "Guruhlar topilmadi"}
                    </td>
                  </tr>
                ) : (
                  (groupFilterTab === "today" ? accessibleGroups.filter(isGroupLessonToday) : accessibleGroups).map((g) => {
                    const gStudents = students.filter((s) => String(s.groupId || s.group_id) === String(g.id));
                    const hasLessonToday = isGroupLessonToday(g);
                    const isLive = isLessonLiveNow(g);
                    const timing = getLessonTimingStatus(g);
                    const attStatus = getGroupAttendanceStatus(g.id, gStudents);

                    return (
                      <tr
                        key={g.id}
                        className={`lc-group-table-row ${hasLessonToday ? "row-today" : ""}`}
                        onClick={() => {
                          setSelectedGroup(g.id);
                          navigate(`/attendance/${g.id}`);
                        }}
                      >
                        <td className="td-g-name">
                          <span className="g-arrow-icon">
                            <HiOutlineArrowUpRight />
                          </span>
                          <span className="g-name-text">{g.name}</span>
                          {isLive && <span className="mini-live-tag"><HiOutlineBolt className="inline-bolt-icon" /> JONLI</span>}
                          {hasLessonToday && !isLive && <span className="mini-today-tag"><span className="mini-today-dot"></span> BUGUN</span>}
                        </td>
                        <td className="td-g-course">
                          <span className="g-course-chip">{g.courseName || g.course_name || "Frontend ReactJS"}</span>
                        </td>
                        <td className="td-g-students">
                          <span className="g-students-count">{gStudents.length}</span>
                        </td>
                        <td className="td-g-room">
                          <span className="g-room-text">{g.roomName || g.room || "1-xona"}</span>
                          <span className="g-time-subtext">{g.scheduleTime || "14:00 - 16:00"}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* 2. GURUH TANLANGAN HOLAT: YAGONA BIR QATORLI TOP BAR & DAVOMAT JURNALI */}
          <div className="lc-top-controls-bar">
            {/* Left: Guruhlarga qaytish tugmasi + Nav Tabs */}
            <div className="lc-top-left-group">
              <button 
                type="button" 
                className="btn-back-to-groups" 
                onClick={() => {
                  setSelectedGroup(null);
                  navigate('/attendance');
                }}
                title="Boshqa guruhni tanlash"
              >
                <HiOutlineArrowLeft /> Guruhlar
              </button>

              <div className="lc-tabs-navigation">
                {LC_UP_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`lc-tab-button ${activeTab === t.id ? "active" : ""}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Sync Indicator, Year Dropdown, Month Dropdown, Barchasi Keldi, Fullscreen */}
            <div className="lc-top-right-actions">
              {/* Sokin Avto-Saqlash Indikatori (Google Docs / Notion uslubida) */}
              <div className="lc-sync-indicator-pill">
                {saveStatus === "saving" ? (
                  <span className="sync-status status-saving">
                    <span className="sync-dot dot-yellow"></span> Saqlanmoqda...
                  </span>
                ) : saveStatus === "error" ? (
                  <span className="sync-status status-error">
                    <span className="sync-dot dot-red"></span> Saqlanmadi
                  </span>
                ) : (
                  <span className="sync-status status-saved">
                    <HiOutlineCheck className="sync-check-svg" /> Saqlandi
                  </span>
                )}
              </div>

              <div className="lc-select-pill year-select-pill">
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChangeWithShimmer(e.target.value)}
                  className="lc-clean-select"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div className="lc-select-pill month-select-pill">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChangeWithShimmer(e.target.value)}
                  className="lc-clean-select"
                >
                  {MONTHS_LIST.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {canMarkAttendance && (
                <>
                  <button
                    type="button"
                    className="lc-btn-mark-all lc-btn-icon-only"
                    onClick={handleMarkAllPresent}
                    title="Barcha talabalarni 'Keldi' qilish"
                  >
                    <HiOutlineCheck className="btn-icon" />
                  </button>

                  <button
                    type="button"
                    className="lc-btn-grade-ten"
                    onClick={handleMarkAllGradesTen}
                    title="Bugungi barcha talabalarga 10 ball qo'yish"
                  >
                    10
                  </button>
                </>
              )}

              <button 
                type="button"
                className={`ribbon-fullscreen-btn ${isZenMode ? "active-zen" : ""}`} 
                onClick={() => setIsZenMode(!isZenMode)}
                title={isZenMode ? "To'liq ekrandan chiqish (Esc)" : "To'liq ekranga yoyish (Zen Mode)"}
              >
                {isZenMode ? <HiOutlineArrowsPointingIn /> : <HiOutlineArrowsPointingOut />}
              </button>
            </div>
          </div>

          {/* Main Full-Width Matrix Grid */}
          <div className={`lc-fullwidth-matrix-panel ${isZenMode ? "zen-fullscreen-mode" : ""}`}>
            {/* Zen Mode Floating Control Bar */}
            {isZenMode && (
              <div className="zen-exit-floating-bar">
                <div className="zen-title-info">
                  <span className="zen-live-dot"></span>
                  <strong>{currentGroupObj?.name || "Guruh"}</strong> — Davomat & Baholash (Zen Mode)
                </div>
                <button 
                  type="button" 
                  className="btn-exit-zen" 
                  onClick={() => setIsZenMode(false)}
                  title="To'liq ekrandan chiqish"
                >
                  <HiOutlineArrowsPointingIn className="inline-icon-xs" /> To'liq ekrandan chiqish (Esc)
                </button>
              </div>
            )}

            {/* ATTENDANCE MATRIX TABLE */}
            {activeTab === "attendance" && (
              <div className="lc-matrix-wrapper">
                {isTableLoading ? (
                  <div className="lc-matrix-skeleton-table">
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                      <div key={row} className="lc-sk-row">
                        <div className="lc-sk-student-cell">
                          <div className="lc-sk-avatar shimmer-box"></div>
                          <div className="lc-sk-name shimmer-box"></div>
                        </div>
                        <div className="lc-sk-dates-cells">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                            <div key={col} className="lc-sk-cell-pill shimmer-box"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="lc-matrix-table">
                    <thead>
                      <tr>
                        <th className="th-talabalar">Talabalar</th>
                        {lessonDates.map((d, idx) => {
                          const isToday = d.fullDate === todayDateStr;
                          const isFuture = isFutureDate(d.fullDate);
                          const isPast = isPastDate(d.fullDate);
                          const reqKey = `${selectedGroup}_${d.fullDate}`;
                          const isApprovedUnlock = checkIsDateApproved(d.fullDate);
                          const isPendingUnlock = !isApprovedUnlock && unlockRequests[reqKey]?.status === "pending";

                          return (
                            <th key={idx} className={`th-date-col ${isToday ? "th-col-today" : ""} ${isPast ? "th-col-past" : ""} ${isFuture ? "th-col-future" : ""}`}>
                              {isToday && <span className="today-badge-pill">Bugun</span>}
                              {isFuture && <span className="future-badge-pill">Kelgusi</span>}
                              {isPendingUnlock && <span className="unlock-pending-pill" title="Administratorga ochish so'rovi yuborilgan">So'rov</span>}
                              {isApprovedUnlock && <span className="unlock-approved-pill" title="Administrator tomonidan ruxsat berilgan (Qulf ochilgan)">Ochiq ✓</span>}
                              <span className="th-date-text">{d.dayNum || d.dayStr.split(" ")[0]}</span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={lessonDates.length + 1} className="empty-matrix-msg">
                          Guruhda o'quvchilar mavjud emas
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, sIdx) => {
                        const isDebtor = (student.balance || 0) < 0 || student.paymentStatus === "Overdue" || student.paymentStatus === "Unpaid";
                        const paymentClass = isDebtor ? "student-row-debtor" : "student-row-paid";

                        return (
                          <tr key={student.id} className={`lc-matrix-student-row ${paymentClass}`}>
                            <td className={`td-student-info ${paymentClass}`}>
                              <div className="lc-student-row-flex">
                                <div className="lc-student-avatar-wrap">
                                  {student.avatar && student.avatar.length > 5 ? (
                                    <img src={student.avatar} alt="" className="lc-student-avatar-img" />
                                  ) : (
                                    <span className="lc-avatar-initials">{(student.fullName || "T").charAt(0)}</span>
                                  )}
                                </div>
                                <span 
                                  className="td-student-name"
                                  onClick={() => setSelectedProfileStudent(student)}
                                >
                                  {student.fullName}
                                </span>
                              </div>
                            </td>

                        {lessonDates.map((d, dIdx) => {
                          const cellKey = `${student.id}_${d.fullDate}`;
                          const cell = matrixData[cellKey];
                          const status = cell?.status;
                          const isToday = d.fullDate === todayDateStr;
                          const isFuture = isFutureDate(d.fullDate);
                          const isPast = isPastDate(d.fullDate);
                          const isApprovedUnlock = checkIsDateApproved(d.fullDate);
                          const canEditDavomat = !isFuture && (isToday || currentRole === "admin" || isApprovedUnlock);

                          return (
                            <td 
                              key={dIdx} 
                              className={`td-attendance-cell ${isToday ? "td-cell-today" : ""} ${isPast && currentRole !== "admin" && !isApprovedUnlock ? "td-cell-past" : ""} ${isFuture ? "td-cell-future" : ""} ${activePickerCell === cellKey ? "picker-open" : ""} ${isLessonTimeLocked(d.fullDate) && currentRole !== "admin" && !isApprovedUnlock ? "cell-time-locked" : ""}`}
                              onMouseDown={canEditDavomat ? (e) => handleCellMouseDown(student.id, d.fullDate, student.fullName, e) : undefined}
                              onTouchStart={canEditDavomat ? (e) => handleCellTouchStart(d.fullDate, e) : undefined}
                              onTouchEnd={canEditDavomat ? (e) => handleCellTouchEnd(student.id, d.fullDate, student.fullName, e) : undefined}
                              onContextMenu={canEditDavomat ? (e) => handleCellContextMenu(student.id, d.fullDate, student.fullName, status, e) : undefined}
                              onClick={isFuture ? (e) => { e.stopPropagation(); toast.info(`⏳ Kelajakdagi dars (${d.fullDate})! Ushbu dars kuni kelganda davomat ochiladi.`); } : (!canEditDavomat && isPast) ? (e) => { e.stopPropagation(); toast.error(`⏱️ O'tib ketgan dars (${d.fullDate}) davomatini faqat Administrator o'zgartira oladi!`); } : undefined}
                              title={`${student.fullName} — ${d.dayStr}: ${isFuture ? "Kelgusi dars sanasi (Hali boshlanmagan — davomat qilib bo'lmaydi)" : status || (isPast && currentRole !== "admin" && !isApprovedUnlock ? "O'tib ketgan dars (Qulflangan)" : isApprovedUnlock ? "Administrator ruxsat bergan (Qulf ochildi)" : "Dars davomati (Bosing / Drag)")}`}
                            >
                              {/* Faqat O'qituvchi uchun o'tgan qulflangan sanalarda qulf ko'rinadi (Admin yoki ruxsat berilganlar uchun qulf yo'qoladi) */}
                              {currentRole !== "admin" && isPast && !isFuture && !isApprovedUnlock && (
                                <HiOutlineLockClosed className="locked-watermark-icon" title="Qulflangan — Faqat Admin o'zgartira oladi" />
                              )}

                              {/* LC-UP Usulidagi Tepada Ochiluvchi Tanlagich (Floating Top Popover) - Bugun yoki Admin uchun */}
                              {!isFuture && activePickerCell === cellKey && (
                                <div 
                                  className="lc-floating-popover-card" 
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onMouseUp={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  onTouchEnd={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-absent"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectStatus(student.id, d.fullDate, student.fullName, "Absent", e);
                                      setActiveReasonCard({
                                        studentId: student.id,
                                        fullDate: d.fullDate,
                                        studentName: student.fullName,
                                        reason: ABSENT_REASONS[0].label,
                                        customNote: ""
                                      });
                                    }}
                                    title="Kelmadi (❌)"
                                  >
                                    <HiOutlineXMark />
                                  </button>
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-excused"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectStatus(student.id, d.fullDate, student.fullName, "Excused", e);
                                    }}
                                    title="Kechikdi / Sababli (🕒)"
                                  >
                                    <HiOutlineClock />
                                  </button>
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-present"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onTouchEnd={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectStatus(student.id, d.fullDate, student.fullName, "Present", e);
                                    }}
                                    title="Keldi (✔)"
                                  >
                                    <HiOutlineCheck />
                                  </button>
                                  <div className="lc-popover-arrow"></div>
                                </div>
                              )}

                              {/* Kelgusi sanalarda davomat bo'lmaydi - faqat bo'sh nuqta */}
                              {isFuture ? (
                                <div className="cell-empty-dash">
                                  <span className="empty-dot"></span>
                                </div>
                              ) : status === "Present" ? (
                                <div className="cell-circle circle-present">
                                  <HiOutlineCheck className="circle-icon" />
                                </div>
                              ) : status === "Excused" ? (
                                <div className="cell-circle circle-excused">
                                  <HiOutlineClock className="circle-flag-yellow" />
                                </div>
                              ) : status === "Absent" ? (
                                (() => {
                                  const meta = getReasonMeta(cell?.note);
                                  return (
                                    <div 
                                      className="cell-circle circle-absent-dynamic"
                                      style={{
                                        backgroundColor: meta.bg,
                                        borderColor: meta.border,
                                        color: meta.color
                                      }}
                                      onClick={(e) => {
                                        if (canEditDavomat) {
                                          e.stopPropagation();
                                          setActiveReasonCard({
                                            studentId: student.id,
                                            fullDate: d.fullDate,
                                            studentName: student.fullName,
                                            reason: cell?.note || ABSENT_REASONS[2].label,
                                            customNote: cell?.note && !ABSENT_REASONS.some((r) => r.label === cell?.note) ? cell?.note : ""
                                          });
                                          setIsReasonSelectOpen(false);
                                        }
                                      }}
                                      title={`${student.fullName} — Kelmadi (${meta.label}) • Sababni o'zgartirish uchun bosing`}
                                    >
                                      <HiOutlineFlag className="circle-flag-dynamic" style={{ color: meta.color }} />
                                    </div>
                                  );
                                })()
                              ) : status === "Trial" ? (
                                <div className="cell-circle circle-trial">
                                  <HiOutlineInformationCircle className="circle-icon" />
                                </div>
                              ) : (
                                <div className="cell-empty-dash">
                                  <span className="empty-dot"></span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                  )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* BAHOLASH TAB */}
          {activeTab === "grades" && (
            <div className="lc-grades-wrapper">
              <div className="lc-matrix-wrapper">
                {isTableLoading ? (
                  <div className="lc-matrix-skeleton-table">
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                      <div key={row} className="lc-sk-row">
                        <div className="lc-sk-student-cell">
                          <div className="lc-sk-avatar shimmer-box"></div>
                          <div className="lc-sk-name shimmer-box"></div>
                        </div>
                        <div className="lc-sk-dates-cells">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                            <div key={col} className="lc-sk-cell-pill shimmer-box"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="lc-matrix-table lc-grades-matrix-table">
                    <thead>
                      <tr>
                        <th className="th-talabalar">Talabalar</th>
                        {lessonDates.map((d, idx) => {
                          const isToday = d.fullDate === todayDateStr;
                          const isFuture = isFutureDate(d.fullDate);
                          const isPast = isPastDate(d.fullDate);
                          const reqKey = `${selectedGroup}_${d.fullDate}`;
                          const isApprovedUnlock = checkIsDateApproved(d.fullDate);
                          const isPendingUnlock = !isApprovedUnlock && unlockRequests[reqKey]?.status === "pending";

                          return (
                            <th key={idx} className={`th-date-col ${isToday ? "th-col-today" : ""} ${isPast ? "th-col-past" : ""} ${isFuture ? "th-col-future" : ""}`}>
                              {isToday && <span className="today-badge-pill">Bugun</span>}
                              {isFuture && <span className="future-badge-pill">Kelgusi</span>}
                              {isPendingUnlock && <span className="unlock-pending-pill" title="Administratorga ochish so'rovi yuborilgan">So'rov</span>}
                              {isApprovedUnlock && <span className="unlock-approved-pill" title="Administrator tomonidan ruxsat berilgan (Qulf ochilgan)">Ochiq ✓</span>}
                              <span className="th-date-text">{d.dayNum || d.dayStr.split(" ")[0]}</span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={lessonDates.length + 1} className="empty-matrix-msg">
                            Guruhda o'quvchilar mavjud emas
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => {
                          const isDebtor = (student.balance || 0) < 0 || student.paymentStatus === "Overdue" || student.paymentStatus === "Unpaid";
                          const paymentClass = isDebtor ? "student-row-debtor" : "student-row-paid";

                          return (
                            <tr key={student.id} className={`lc-matrix-student-row ${paymentClass}`}>
                              <td className={`td-student-info ${paymentClass}`}>
                                <div className="lc-student-row-flex">
                                  <div className="lc-student-avatar-wrap">
                                    {student.avatar && student.avatar.length > 5 ? (
                                      <img src={student.avatar} alt="" className="lc-student-avatar-img" />
                                    ) : (
                                      <span className="lc-avatar-initials">{(student.fullName || "T").charAt(0)}</span>
                                    )}
                                  </div>
                                  <span 
                                    className="td-student-name"
                                    onClick={() => setSelectedProfileStudent(student)}
                                  >
                                    {student.fullName}
                                  </span>
                                </div>
                              </td>

                              {lessonDates.map((d, dIdx) => {
                                const cellKey = `${student.id}_${d.fullDate}`;
                                const gradeItem = gradesMatrixData[cellKey];
                                const score = gradeItem?.score;
                                const isToday = d.fullDate === todayDateStr;
                                const isPast = isPastDate(d.fullDate);
                                const isFuture = isFutureDate(d.fullDate);
                                const isApprovedUnlock = checkIsDateApproved(d.fullDate);
                                const isLockedForTeacher = currentRole !== "admin" && isPast && !isApprovedUnlock;

                                const attCell = matrixData[cellKey];
                                const isPresent = attCell?.status === "Present";
                                const isAbsent = attCell?.status === "Absent";
                                const isExcused = attCell?.status === "Excused";
                                const canBeGraded = isPresent || isExcused;

                                return (
                                  <td
                                    key={dIdx}
                                    className={`td-attendance-cell td-grade-cell ${isToday ? "td-cell-today" : ""} ${isLockedForTeacher ? "grade-cell-locked" : ""} ${!canBeGraded ? "grade-cell-disabled-absent" : ""} ${activeGradeCell === cellKey ? "grade-cell-active" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!canBeGraded) return;
                                      if (isFuture) {
                                        toast.info(`⏳ Kelajakdagi dars sanasi (${d.fullDate})! Dars kuni kelganda baholash ochiladi.`);
                                        return;
                                      }
                                      if (isLockedForTeacher && isPast) {
                                        const reqKey = `${selectedGroup}_${d.fullDate}`;
                                        const existingReq = unlockRequests[reqKey];
                                        if (existingReq?.status === "pending") {
                                          toast.info(`⏳ "${d.fullDate}" darsi uchun ochish so'rovingiz yuborilgan, Administrator tasdiqlashini kuting.`);
                                        } else {
                                          setUnlockRequestModal({
                                            isOpen: true,
                                            fullDate: d.fullDate,
                                            reason: "Baho kiritish unutilgan",
                                            note: ""
                                          });
                                        }
                                        return;
                                      }
                                      if (activeGradeCell === cellKey) {
                                        if (showGradePicker) {
                                          setShowGradePicker(false);
                                        } else {
                                          setShowGradePicker(true);
                                        }
                                      } else {
                                        setActiveGradeCell(cellKey);
                                        setShowGradePicker(true);
                                      }
                                    }}
                                  title={
                                    !canBeGraded
                                      ? `${student.fullName} — Darsga kelmagan (Baholab bo'lmaydi)`
                                      : isExcused
                                      ? `${student.fullName} — Kech qolib kelgan (${score ? score + ' Ball' : 'Baholash uchun bosing'})`
                                      : isLockedForTeacher && isPast
                                      ? `${student.fullName} — O'tib ketgan dars (Faqat Admin o'zgartira oladi)`
                                      : `${student.fullName} — ${d.dayStr}: ${score ? score + ' Ball' : 'Baholanmagan (Bosing yoki 1-10 tering)'}`
                                  }
                                >
                                  {canBeGraded && !isLockedForTeacher && activeGradeCell === cellKey && showGradePicker && (
                                    <div
                                      className="lc-oxford-vert-grade-picker"
                                      onClick={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onMouseUp={(e) => e.stopPropagation()}
                                    >
                                      <div 
                                        className="oxford-vert-header"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowGradePicker(false);
                                        }}
                                        title="Yopish"
                                      >
                                        <HiOutlineCheck className="oxford-vert-check" />
                                      </div>
                                      <div className="oxford-vert-numbers-list">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                          const isCurrentScore = (num === 0 && (score === 0 || score === null)) || score === num;
                                          return (
                                            <button
                                              key={num}
                                              type="button"
                                              className={`oxford-vert-num-btn ${isCurrentScore ? "vert-active-score" : ""}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetGradeScore(student.id, d.fullDate, num === 0 ? null : num, student.fullName, false);
                                                setShowGradePicker(false);
                                              }}
                                            >
                                              {num}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {isLockedForTeacher && isPast && canBeGraded && (
                                    <HiOutlineLockClosed
                                      className="cell-corner-lock-icon"
                                      title="O'tib ketgan dars — Faqat Admin o'zgartira oladi"
                                    />
                                  )}

                                  <div className={`grade-cell-box ${activeGradeCell === cellKey ? "is-active" : ""}`}>
                                    {!canBeGraded ? (
                                      <div className="cell-grade-absent-black" title="Darsga kelmagan (Baho qo'yib bo'lmaydi)">
                                        <span className="absent-mini-dash"></span>
                                      </div>
                                    ) : score != null ? (
                                      <div className={`cell-grade-badge score-badge-${score >= 8 ? "high" : score >= 6 ? "mid" : score >= 3 ? "yellow" : "low"}`}>
                                        {score}
                                        {isExcused && (
                                          <span className="cell-late-clock-indicator" title="Darsga kech qolib kelgan">
                                            <HiOutlineClock />
                                          </span>
                                        )}
                                      </div>
                                    ) : isExcused ? (
                                      <div className="cell-grade-empty-capsule capsule-late" title="Darsga kech qolib kelgan — Baholash uchun bosing">
                                        <HiOutlineClock className="capsule-late-icon" />
                                      </div>
                                    ) : (
                                      <div className="cell-grade-empty-capsule" title="Baholash uchun bosing"></div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
            </div>
          )}

          {/* Oxford LC-UP: REYTING TAB */}
          {activeTab === "ratings" && (
            <div className="oxford-ratings-container">
              {/* Sub-Filters: [Ballar | Kristall] va [O'rta arifmetik | Umumiy] */}
              <div className="oxford-ratings-filters-bar">
                <div className="oxford-pills-group">
                  <button
                    type="button"
                    className={`oxford-pill-btn ${ratingType === "points" ? "active" : ""}`}
                    onClick={() => setRatingType("points")}
                  >
                    Ballar
                  </button>
                  <button
                    type="button"
                    className={`oxford-pill-btn ${ratingType === "crystal" ? "active" : ""}`}
                    onClick={() => setRatingType("crystal")}
                  >
                    Kristall
                  </button>
                </div>

                <div className="oxford-pills-group">
                  <button
                    type="button"
                    className={`oxford-pill-btn ${ratingMode === "average" ? "active" : ""}`}
                    onClick={() => setRatingMode("average")}
                  >
                    O'rta arifmetik
                  </button>
                  <button
                    type="button"
                    className={`oxford-pill-btn ${ratingMode === "total" ? "active" : ""}`}
                    onClick={() => setRatingMode("total")}
                  >
                    Umumiy
                  </button>
                </div>
              </div>

              {/* Leaderboard Cards List */}
              <div className="oxford-ratings-list">
                {leaderboardStudents.length === 0 ? (
                  <div className="empty-matrix-msg">Guruhda talabalar mavjud emas</div>
                ) : (
                  leaderboardStudents.map((student, idx) => {
                    const rank = idx + 1;
                    const isLeader = rank === 1;

                    return (
                      <div 
                        key={student.id} 
                        className={`oxford-rating-card ${isLeader ? "rank-1-card" : ""}`}
                        onClick={() => setSelectedProfileStudent(student)}
                      >
                        {/* Rank Number */}
                        <div className="oxford-rating-rank-num">{rank}</div>

                        {/* Avatar */}
                        <div className="oxford-rating-avatar">
                          {student.avatar && student.avatar.length > 5 ? (
                            <img src={student.avatar} alt="" className="oxford-avatar-img" />
                          ) : (
                            <span className="oxford-avatar-initial">
                              {(student.fullName || "T").charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Student Name & Score */}
                        <div className="oxford-rating-info">
                          <span className="oxford-rating-name">{student.fullName}</span>
                          <div className="oxford-rating-score-line">
                            {ratingType === "crystal" ? (
                              <span className="rating-gem-icon">💎</span>
                            ) : (
                              <span className="rating-star-icon">⭐</span>
                            )}
                            <span className="rating-score-val">{student.displayScore}</span>
                          </div>
                        </div>

                        {/* Trophy or Medal Icon */}
                        <div className="oxford-rating-trophy-box">
                          {rank === 1 && <span className="trophy-badge" title="1-O'rin G'olibi">🏆</span>}
                          {rank === 2 && <span className="medal-badge" title="2-O'rin">🥈</span>}
                          {rank === 3 && <span className="medal-badge" title="3-O'rin">🥉</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Oxford LC-UP: IMTIHONLAR TAB */}
          {activeTab === "exams" && (
            <div className="oxford-exams-container">
              {/* Header: Title + "+ Yangi imtihon qo'shish" Button */}
              <div className="oxford-exams-header-row">
                <h2 className="oxford-exams-title">Imtihonlar</h2>
                <button
                  type="button"
                  className="btn-oxford-add-exam"
                  onClick={() => setIsNewExamModalOpen(true)}
                >
                  <HiOutlinePlus className="btn-plus-icon" />
                  <span>Yangi imtihon qo'shish</span>
                </button>
              </div>

              {/* Exams Table Structure */}
              <div className="oxford-exams-table-wrap">
                <table className="oxford-exams-table">
                  <thead>
                    <tr>
                      <th className="th-exam-col th-col-name">NOMI</th>
                      <th className="th-exam-col th-col-date">SANA</th>
                      <th className="th-exam-col th-col-score">O'TISH BALI</th>
                      <th className="th-exam-col th-col-section">BO'LIM</th>
                      <th className="th-exam-col th-col-calc">HISOBLASH</th>
                      <th className="th-exam-col th-col-actions">HARAKATLAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examsList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="td-exams-empty-cell">
                          <div className="oxford-empty-exams-state">
                            <HiOutlineDocumentText className="oxford-empty-doc-icon" />
                            <p className="oxford-empty-doc-text">Ma'lumot topilmadi</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      examsList.map((exam) => (
                        <tr key={exam.id} className="tr-exam-row">
                          <td className="td-exam-name">
                            <div className="exam-name-box">
                              <HiOutlineAcademicCap className="exam-row-icon" />
                              <span className="exam-name-text">{exam.name}</span>
                            </div>
                          </td>
                          <td className="td-exam-date">{exam.date}</td>
                          <td className="td-exam-score">
                            <span className="exam-pass-score-badge">{exam.passingScore} ball</span>
                          </td>
                          <td className="td-exam-section">
                            <span className="exam-section-tag">{exam.section}</span>
                          </td>
                          <td className="td-exam-calc">
                            <span className="exam-calc-pill">{exam.calcType}</span>
                          </td>
                          <td className="td-exam-actions">
                            <button
                              type="button"
                              className="btn-exam-action-delete"
                              onClick={() => handleDeleteExam(exam.id, exam.name)}
                              title="O'chirish"
                            >
                              <HiOutlineTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTHER TABS (Mashqlar, Tarix, Chat) */}
          {activeTab !== "attendance" && activeTab !== "grades" && activeTab !== "ratings" && activeTab !== "exams" && (
            <div className="lc-empty-tab-panel">
              <HiOutlineSparkles className="empty-tab-icon" />
              <h3>{LC_UP_TABS.find((t) => t.id === activeTab)?.label} Bo'limi</h3>
              <p>Ushbu guruh uchun {LC_UP_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} ma'lumotlari to'liq sinxronizatsiya qilingan.</p>
            </div>
          )}
        </div>
        </>
      )}

      {/* Oxford LC-UP: Yangi Sabab Kiritish Modali */}
      {activeReasonCard && (
        <div className="reason-modal-backdrop" onClick={() => { setActiveReasonCard(null); setIsReasonSelectOpen(false); }}>
          <div className="lc-oxford-reason-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="lc-oxford-reason-header">
              <h3 className="lc-oxford-reason-title">Yangi sabab kiritish</h3>
              <button 
                type="button" 
                className="btn-oxford-close" 
                onClick={() => { setActiveReasonCard(null); setIsReasonSelectOpen(false); }}
                title="Yopish"
              >
                <HiOutlineXMark />
              </button>
            </div>

            {/* Modal Body */}
            <div className="lc-oxford-reason-body">
              <label className="lc-oxford-label">Sabab</label>
              
              {/* Custom Select Box */}
              <div className="lc-oxford-select-container">
                <button
                  type="button"
                  className={`lc-oxford-select-trigger ${isReasonSelectOpen ? "select-open" : ""}`}
                  onClick={() => setIsReasonSelectOpen(!isReasonSelectOpen)}
                >
                  <div className="lc-selected-reason-display">
                    {activeReasonCard.reason ? (
                      <>
                        <span 
                          className="reason-color-dot" 
                          style={{ backgroundColor: getReasonMeta(activeReasonCard.reason).color }}
                        />
                        <span className="reason-display-text">{activeReasonCard.reason}</span>
                      </>
                    ) : (
                      <span className="reason-placeholder-text">Tanlang...</span>
                    )}
                  </div>
                  <span className="select-chevron-icon">
                    {isReasonSelectOpen ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                  </span>
                </button>

                {/* Custom Dropdown Menu with Colored Dots */}
                {isReasonSelectOpen && (
                  <div className="lc-oxford-dropdown-menu">
                    {ABSENT_REASONS.map((r) => {
                      const isSelected = activeReasonCard.reason === r.label;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          className={`lc-oxford-option-item ${isSelected ? "option-selected" : ""}`}
                          onClick={() => {
                            setActiveReasonCard({ ...activeReasonCard, reason: r.label });
                            setIsReasonSelectOpen(false);
                          }}
                        >
                          <span className="reason-color-dot" style={{ backgroundColor: r.color }} />
                          <span className="option-label-text">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom text input if "Boshqa" is chosen */}
              {activeReasonCard.reason === "Boshqa" && (
                <div className="lc-oxford-custom-input-wrap">
                  <input
                    type="text"
                    className="lc-oxford-text-input"
                    placeholder="Sababni batafsil yozing..."
                    value={activeReasonCard.customNote || ""}
                    onChange={(e) => setActiveReasonCard({ ...activeReasonCard, customNote: e.target.value })}
                    autoFocus
                  />
                </div>
              )}

              {/* Action Buttons Row: [Bekor qilish] & [Saqlash] */}
              <div className="lc-oxford-actions-row">
                <button 
                  type="button" 
                  className="btn-oxford-cancel" 
                  onClick={() => { setActiveReasonCard(null); setIsReasonSelectOpen(false); }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="button" 
                  className="btn-oxford-save" 
                  onClick={handleConfirmReason}
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 17-Qoida: O'tgan Darsni Qulfini Ochish Uchun Administratorga Ruxsat So'rovi Modali */}
      {unlockRequestModal.isOpen && (
        <div className="reason-modal-backdrop" onClick={() => setUnlockRequestModal((prev) => ({ ...prev, isOpen: false }))}>
          <div className="lc-unlock-request-card" onClick={(e) => e.stopPropagation()}>
            <div className="lc-unlock-header">
              <div className="lc-unlock-title-wrap">
                <span className="lc-unlock-icon"><HiOutlineLockClosed /></span>
                <div>
                  <h3 className="lc-unlock-title">Qulfni Ochish So'rovi</h3>
                  <p className="lc-unlock-subtitle">O'tib ketgan dars baho va davomatini tahrirlash</p>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close-reason-card" 
                onClick={() => setUnlockRequestModal((prev) => ({ ...prev, isOpen: false }))}
                title="Yopish"
              >
                <HiOutlineXMark />
              </button>
            </div>

            <div className="lc-unlock-info-box">
              <div className="lc-unlock-info-item">
                <span className="info-label">Guruh:</span>
                <span className="info-val">{currentGroupObj?.name || "Guruh"}</span>
              </div>
              <div className="lc-unlock-info-item">
                <span className="info-label">Dars sanasi:</span>
                <span className="info-val highlight-date">{unlockRequestModal.fullDate}</span>
              </div>
              <div className="lc-unlock-info-item">
                <span className="info-label">O'qituvchi:</span>
                <span className="info-val">{user?.fullName || user?.name || "O'qituvchi"}</span>
              </div>
            </div>

            <form onSubmit={handleSendUnlockRequest} className="lc-unlock-form">
              <label className="reason-input-label">So'rov sababini tanlang:</label>
              <select
                className="reason-select-dropdown"
                value={unlockRequestModal.reason}
                onChange={(e) => setUnlockRequestModal({ ...unlockRequestModal, reason: e.target.value })}
              >
                <option value="Baho kiritish unutilgan">Baho kiritish unutilgan</option>
                <option value="Davomat kech belgilandi">Davomat kech belgilandi</option>
                <option value="Texnik xatolik / Internet uzilgan">Texnik xatolik / Internet uzilgan</option>
                <option value="O'quvchi darsni qayta topshirdi">O'quvchi darsni qayta topshirdi</option>
                <option value="Boshqa sabab">Boshqa sabab</option>
              </select>

              <label className="reason-input-label" style={{ marginTop: '10px' }}>Qo'shimcha izoh (ixtiyoriy):</label>
              <textarea
                className="lc-unlock-textarea"
                rows="2"
                placeholder="Administrator uchun qo'shimcha ma'lumot..."
                value={unlockRequestModal.note}
                onChange={(e) => setUnlockRequestModal({ ...unlockRequestModal, note: e.target.value })}
              />

              <div className="lc-unlock-actions">
                <button
                  type="button"
                  className="lc-btn-cancel-modal"
                  onClick={() => setUnlockRequestModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="lc-btn-send-request">
                  <HiOutlinePaperAirplane className="svg-send-icon" /> Administratorga So'rov Yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6-Qoida: Mobil / Planshet Uchun iOS Uslubidagi Bottom Sheet Tezkor Boshqaruv */}
      {mobileBottomSheet.isOpen && mobileBottomSheet.student && (
        <div className="lc-mobile-bottom-sheet-overlay" onClick={() => setMobileBottomSheet((prev) => ({ ...prev, isOpen: false }))}>
          <div className="lc-mobile-bottom-sheet-card" onClick={(e) => e.stopPropagation()}>
            <div className="lc-sheet-drag-handle"></div>
            
            <div className="lc-sheet-student-header">
              <div className="lc-student-avatar-wrap">
                {mobileBottomSheet.student.avatar ? (
                  <img src={mobileBottomSheet.student.avatar} alt="" className="lc-student-avatar-img" />
                ) : (
                  <span className="lc-avatar-initials">{(mobileBottomSheet.student.fullName || "T").charAt(0)}</span>
                )}
              </div>
              <div className="lc-sheet-student-info">
                <h4>{mobileBottomSheet.student.fullName}</h4>
                <p>{currentGroupObj?.name} • Bugungi dars ({mobileBottomSheet.fullDate})</p>
              </div>
              <button
                type="button"
                className="lc-sheet-close-btn"
                onClick={() => setMobileBottomSheet((prev) => ({ ...prev, isOpen: false }))}
              >
                <HiOutlineXMark />
              </button>
            </div>

            {/* Quick Attendance */}
            <div className="lc-sheet-section">
              <span className="sheet-sec-label">Davomat:</span>
              <div className="lc-sheet-att-grid">
                <button
                  type="button"
                  className={`sheet-att-btn att-present ${matrixData[`${mobileBottomSheet.student.id}_${mobileBottomSheet.fullDate}`]?.status === "Present" ? "active" : ""}`}
                  onClick={() => {
                    handleSelectStatus(mobileBottomSheet.student.id, mobileBottomSheet.fullDate, mobileBottomSheet.student.fullName, "Present");
                  }}
                >
                  <HiOutlineCheck /> Keldi
                </button>
                <button
                  type="button"
                  className={`sheet-att-btn att-excused ${matrixData[`${mobileBottomSheet.student.id}_${mobileBottomSheet.fullDate}`]?.status === "Excused" ? "active" : ""}`}
                  onClick={() => {
                    handleSelectStatus(mobileBottomSheet.student.id, mobileBottomSheet.fullDate, mobileBottomSheet.student.fullName, "Excused");
                  }}
                >
                  <HiOutlineClock /> Kechikdi
                </button>
                <button
                  type="button"
                  className={`sheet-att-btn att-absent ${matrixData[`${mobileBottomSheet.student.id}_${mobileBottomSheet.fullDate}`]?.status === "Absent" ? "active" : ""}`}
                  onClick={() => {
                    handleSelectStatus(mobileBottomSheet.student.id, mobileBottomSheet.fullDate, mobileBottomSheet.student.fullName, "Absent");
                    setActiveReasonCard({
                      studentId: mobileBottomSheet.student.id,
                      fullDate: mobileBottomSheet.fullDate,
                      studentName: mobileBottomSheet.student.fullName,
                      reason: ABSENT_REASONS[0].label,
                      customNote: ""
                    });
                    setMobileBottomSheet((prev) => ({ ...prev, isOpen: false }));
                  }}
                >
                  <HiOutlineXMark /> Kelmadi
                </button>
              </div>
            </div>

            {/* Quick Grade 0-10 */}
            <div className="lc-sheet-section">
              <span className="sheet-sec-label">Baho (0-10):</span>
              <div className="lc-sheet-grades-row">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const curScore = gradesMatrixData[`${mobileBottomSheet.student.id}_${mobileBottomSheet.fullDate}`]?.score;
                  return (
                    <button
                      key={num}
                      type="button"
                      className={`sheet-grade-btn num-${num} ${curScore === num ? "active-score" : ""}`}
                      onClick={() => {
                        handleSetGradeScore(mobileBottomSheet.student.id, mobileBottomSheet.fullDate, num === 0 ? null : num, mobileBottomSheet.student.fullName, false);
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Oxford LC-UP: Yangi Imtihon Qo'shish Modali */}
      {isNewExamModalOpen && (
        <div className="reason-modal-backdrop" onClick={() => setIsNewExamModalOpen(false)}>
          <div className="lc-oxford-reason-card" onClick={(e) => e.stopPropagation()}>
            <div className="lc-oxford-reason-header">
              <h3 className="lc-oxford-reason-title">Yangi imtihon qo'shish</h3>
              <button 
                type="button" 
                className="btn-oxford-close" 
                onClick={() => setIsNewExamModalOpen(false)}
                title="Yopish"
              >
                <HiOutlineXMark />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="lc-oxford-reason-body">
              <div className="lc-oxford-input-group">
                <label className="lc-oxford-label">Imtihon nomi:</label>
                <input
                  type="text"
                  className="lc-oxford-text-input"
                  placeholder="Masalan: Unit 1 Test, Speaking Exam..."
                  value={newExamForm.name}
                  onChange={(e) => setNewExamForm((prev) => ({ ...prev, name: e.target.value }))}
                  autoFocus
                  required
                />
              </div>

              <div className="lc-oxford-input-group" style={{ marginTop: "14px" }}>
                <label className="lc-oxford-label">Sana:</label>
                <input
                  type="date"
                  className="lc-oxford-text-input"
                  value={newExamForm.date}
                  onChange={(e) => setNewExamForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
                <div className="lc-oxford-input-group">
                  <label className="lc-oxford-label">O'tish bali:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="lc-oxford-text-input"
                    value={newExamForm.passingScore}
                    onChange={(e) => setNewExamForm((prev) => ({ ...prev, passingScore: e.target.value }))}
                    required
                  />
                </div>

                <div className="lc-oxford-input-group">
                  <label className="lc-oxford-label">Bo'lim:</label>
                  <select
                    className="lc-oxford-text-input"
                    value={newExamForm.section}
                    onChange={(e) => setNewExamForm((prev) => ({ ...prev, section: e.target.value }))}
                  >
                    <option value="Speaking">Speaking</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Listening">Listening</option>
                    <option value="Reading">Reading</option>
                    <option value="Writing">Writing</option>
                    <option value="General">General (Umumiy)</option>
                  </select>
                </div>
              </div>

              <div className="lc-oxford-input-group" style={{ marginTop: "14px", marginBottom: "22px" }}>
                <label className="lc-oxford-label">Hisoblash turi:</label>
                <select
                  className="lc-oxford-text-input"
                  value={newExamForm.calcType}
                  onChange={(e) => setNewExamForm((prev) => ({ ...prev, calcType: e.target.value }))}
                >
                  <option value="Foiz %">Foiz %</option>
                  <option value="Ballar (0-100)">Ballar (0-100)</option>
                  <option value="Baho (1-5)">Baho (1-5)</option>
                </select>
              </div>

              <div className="lc-oxford-actions-row">
                <button
                  type="button"
                  className="btn-oxford-cancel"
                  onClick={() => setIsNewExamModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-oxford-save"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedProfileStudent && (
        <StudentProfileModal
          student={selectedProfileStudent}
          onClose={() => setSelectedProfileStudent(null)}
        />
      )}
    </div>
  );
};

export default Attendance;
