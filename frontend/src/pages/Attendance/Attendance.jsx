import { useState, useEffect, useRef } from "react";
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
  HiOutlineLockClosed,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlinePhone,
  HiOutlineClock
} from "react-icons/hi2";
import { FaTelegram, FaUserGraduate, FaChalkboardUser } from "react-icons/fa6";
import "./Attendance.css";

const LC_UP_TABS = [
  { id: "attendance", label: "Davomat" },
  { id: "grades", label: "Baholash" },
  { id: "exercises", label: "Mashqlar" },
  { id: "homework", label: "Uyga vazifa" },
  { id: "discounts", label: "Chegirma" },
  { id: "ratings", label: "Reyting" },
  { id: "exams", label: "Imtihonlar" },
  { id: "history", label: "Tarix" },
  { id: "notes", label: "Izoh" }
];

const MONTHS_LIST = [
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

const ABSENT_REASONS = [
  { id: "health", label: "🩺 Salomatligi / Kasallik tufayli" },
  { id: "family", label: "👨‍👩‍👧 Oilaviy sabab / Marosim" },
  { id: "travel", label: "🚗 Sayohat / Shaharda yo'q" },
  { id: "unreachable", label: "📞 Sababsiz (Telefoni ko'tarmadi)" },
  { id: "medical_note", label: "📑 Tibbiy ma'lumotnoma (Spravka) taqdim etiladi" },
  { id: "other", label: "✍️ Boshqa sabab (qo'lda yozish)" }
];

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
  const [studentFilter, setStudentFilter] = useState("all"); // all, debtors, trial, active, frozen
  const [sortAsc, setSortAsc] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false); // 6-Qoida: To'liq ekran Zen Mode
  const [activeReasonCard, setActiveReasonCard] = useState(null); // Smart Card popup for absence reason

  // 1-Qoida: Bugungi sana hisobi
  const now = new Date();
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Escape tugmasi bilan Zen rejimdan chiqish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode]);

  // Local Attendance Matrix: { [studentId_dateKey]: { status: 'Present'|'Excused'|'Absent'|'Trial'|null, note: '' } }
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

  const currentGroupObj = groups.find((g) => g.id === selectedGroup) || groups[0];
  const activeGroupStudents = students.filter((s) => s.groupId === selectedGroup);

  // Generate lesson dates for selected year & month based on group schedule
  const getMonthLessonDates = () => {
    const monthObj = MONTHS_LIST.find((m) => m.key === selectedMonth) || MONTHS_LIST[3];
    const monthShort = monthObj.short;
    
    // Generates realistic schedule dates for odd/even days
    const isOddDays = (currentGroupObj?.scheduleDays || "").toLowerCase().includes("dushanba") || (currentGroupObj?.name || "").includes("Toq");
    const dayNumbers = isOddDays 
      ? ["03", "05", "07", "10", "12", "14", "17", "19", "21", "24", "26", "28", "31"]
      : ["02", "04", "06", "09", "11", "13", "16", "18", "20", "23", "25", "27", "30"];

    return dayNumbers.map((d) => ({
      dayStr: `${d} ${monthShort}`,
      fullDate: `${selectedYear}-${selectedMonth}-${d}`,
      dayNum: d
    }));
  };

  const lessonDates = getMonthLessonDates();

  // Populate matrix when group, month, or attendance records change
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

        if (found) {
          newMatrix[cellKey] = {
            status: found.status,
            note: found.note || ""
          };
        } else {
          // Default is unmarked (dot .)
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

  // Active cell picker state (shows ✅ ❌ on two sides when clicked)
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

  // 15-Qoida: O'tgan va Kelajak sanalarini tekshirish
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

  // 1-Qoida: Dars tugaganidan so'ng 1 soatgacha tahrirlash mumkin
  const isLessonTimeLocked = (fullDate) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // O'tib ketgan sana (kecha yoki oldingi kunlar)
    if (fullDate < todayStr) {
      return true;
    }

    // Kelajak sanasi
    if (fullDate > todayStr) {
      return true;
    }

    // Bugungi dars: dars tugashidan so'ng 1 soatgacha
    const scheduleTimeStr = currentGroupObj?.time || currentGroupObj?.scheduleTime || "14:00 - 16:00";
    const parts = scheduleTimeStr.split("-");
    if (parts.length === 2) {
      const endPart = parts[1].trim(); // "16:00"
      const [endHour, endMin] = endPart.split(":").map(Number);
      if (!isNaN(endHour)) {
        const lockHour = endHour + 1; // 1 soatlik vaqt oynasi
        const currentHour = today.getHours();
        const currentMin = today.getMinutes();
        if (currentHour > lockHour || (currentHour === lockHour && currentMin > (endMin || 0))) {
          return true; // 1 soatdan ko'p vaqt o'tgan -> Qulflangan
        }
      }
    }

    return false;
  };

  // 5-Qoida: Bir vaqtda 2 ta guruhda bo'lishni bloklash (Double-booking prevention)
  const checkDoubleBooking = (studentId, fullDate) => {
    const studentObj = students.find((s) => String(s.id) === String(studentId));
    if (!studentObj) return null;

    // Boshqa guruhlarda xuddi shu vaqtda darsi borligini tekshirish
    const otherGroups = groups.filter((g) => 
      String(g.id) !== String(selectedGroup) &&
      (String(studentObj.groupId || studentObj.group_id) === String(g.id) ||
       String(studentObj.groupName || "").toLowerCase().includes(String(g.name || "").toLowerCase()))
    );

    for (const g of otherGroups) {
      const curTime = currentGroupObj?.time || currentGroupObj?.scheduleTime || "14:00 - 16:00";
      const otherTime = g.time || g.scheduleTime || "14:00 - 16:00";
      if (curTime === otherTime) {
        return g;
      }
    }
    return null;
  };

  // Set status directly from ✅ ❌ picker with Instant Auto-Save & Bot Dispatch (1, 5, 6, 15-Qoidalar)
  const handleSelectStatus = async (studentId, fullDate, studentName, newStatus, e) => {
    if (e) e.stopPropagation();
    if (!canMarkAttendance) return;

    // O'tgan darslarni qat'iy tekshirish (Umuman ruxsat berilmaydi)
    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi! Faqat bugungi dars uchun ruxsat berilgan.");
      return;
    }

    // Kelajakdagi dars sanasini qat'iy tekshirish (Umuman ruxsat berilmaydi)
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }

    // 1-Qoida: 1 soatlik vaqt qulfi tekshiruvi
    if (isLessonTimeLocked(fullDate)) {
      toast.error("⏱️ [1-Qoida] Ushbu dars davomati qulflangan! Dars tugaganidan so'ng faqat 1 soatgacha o'zgartirish mumkin.");
      return;
    }

    // 5-Qoida: Double-booking tekshiruvi
    if (newStatus === "Present") {
      const conflictGroup = checkDoubleBooking(studentId, fullDate);
      if (conflictGroup) {
        toast.warning(`⚠️ [5-Qoida: Double-Booking] "${studentName}" xuddi shu vaqtda (${conflictGroup.time}) "${conflictGroup.name}" guruhida ham darsda deb qayd etilgan!`);
      }
    }

    const cellKey = `${studentId}_${fullDate}`;
    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: {
        status: newStatus,
        note: newStatus === "Excused" ? "Salomatlik / Uzrli" : newStatus === "Absent" ? "Sababsiz" : ""
      }
    }));

    setActivePickerCell(null);

    // Instant Backend Auto-Save
    try {
      if (newStatus) {
        await attendanceApi.create({
          group_id: selectedGroup,
          student_id: studentId,
          date: fullDate,
          status: newStatus,
          note: newStatus === "Excused" ? "Salomatlik / Uzrli" : newStatus === "Absent" ? "Sababsiz" : ""
        });
      }
    } catch (err) {
      console.warn("Auto-save sync:", err.message);
    }

    // 6-Qoida: Real-vaqt Telegram Bot Ota-ona Xabarnomasi
    if (newStatus === "Present") {
      toast.success(`📲 [6-Qoida: Telegram Bot] "${studentName}" — Darsga kelganligi ota-onaga yuborildi ✅`);
    } else if (newStatus === "Absent") {
      toast.error(`📲 [6-Qoida: Telegram Bot] "${studentName}" — "Darsga qatnashmadi" deb ota-onasiga tezkor ogohlantirish yuborildi ❌`);
    } else if (newStatus === "Excused") {
      toast.info(`📲 [6-Qoida: Telegram Bot] "${studentName}" — "Sababli dars qoldirdi" deb ota-onasiga ma'lumot yuborildi 🚩`);
    } else {
      toast.info(`"${studentName}" davomati tozalandi • (Avto-saqlandi)`);
    }
  };

  // 1-Dizayn: Swipe & Mouse Drag & Right-click Quick Mark Gestures
  const touchStartCoords = useRef({ x: 0, y: 0 });
  const mouseDragCoords = useRef({ x: 0, y: 0, isDragging: false });

  // Touch Swipe (Mobile / Tablet) - Faqat Bugungi dars uchun ishlaydi
  const handleCellTouchStart = (fullDate, e) => {
    if (!isTodayDate(fullDate)) return;
    if (e.touches && e.touches[0]) {
      touchStartCoords.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleCellTouchEnd = (studentId, fullDate, studentName, e) => {
    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi!");
      return;
    }
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isLessonTimeLocked(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }

    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartCoords.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartCoords.current.y;
      
      // Horizontal swipe detected (> 35px horizontally)
      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 35) {
          // Swipe Right -> Keldi ✅
          handleSelectStatus(studentId, fullDate, studentName, "Present", e);
        } else if (deltaX < -35) {
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
    }
  };

  // Mouse Drag & Click (Desktop / Laptop) - Faqat Bugungi dars uchun ishlaydi
  const handleCellMouseDown = (fullDate, e) => {
    if (e.button !== 0) return; // Faqat chap tugma
    if (!isTodayDate(fullDate)) return;
    mouseDragCoords.current = {
      x: e.clientX,
      y: e.clientY,
      isDragging: true
    };
  };

  const handleCellMouseUp = (studentId, fullDate, studentName, e) => {
    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi! Faqat bugungi dars uchun ruxsat berilgan.");
      return;
    }
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isLessonTimeLocked(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }

    if (!mouseDragCoords.current.isDragging) return;
    const deltaX = e.clientX - mouseDragCoords.current.x;
    const deltaY = e.clientY - mouseDragCoords.current.y;
    mouseDragCoords.current.isDragging = false;

    // Sichqonchani surish (Mouse Drag > 30px)
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30) {
        // Drag Right -> Keldi ✅
        handleSelectStatus(studentId, fullDate, studentName, "Present", e);
      } else if (deltaX < -30) {
        // Drag Left -> Kelmadi ❌ + Tepadan Smart Card tushishi
        handleSelectStatus(studentId, fullDate, studentName, "Absent", e);
        setActiveReasonCard({
          studentId,
          fullDate,
          studentName,
          reason: ABSENT_REASONS[0].label,
          customNote: ""
        });
      }
    } else {
      // Surmasdan shunchaki bosish (Oddiy Click)
      // Faqat ekran 800px dan katta bo'lsa va faqat bugungi dars bo'lsa dock ochilsin
      const isDesktop = window.innerWidth > 800;
      if (isDesktop && isTodayDate(fullDate)) {
        const cellKey = `${studentId}_${fullDate}`;
        setActivePickerCell(activePickerCell === cellKey ? null : cellKey);
      }
    }
  };

  // Right-Click (Sichqoncha o'ng tugmasi bilan tezkor aylantirib belgilash)
  const handleCellContextMenu = (studentId, fullDate, studentName, currentStatus, e) => {
    e.preventDefault();
    if (isPastDate(fullDate)) {
      toast.error("⏱️ O'tib ketgan dars davomatini o'zgartirib bo'lmaydi!");
      return;
    }
    if (isFutureDate(fullDate)) {
      toast.info("⏳ Kelajakdagi dars sanasi! Ushbu dars kuni kelganda davomat ochiladi.");
      return;
    }
    if (isLessonTimeLocked(fullDate)) {
      toast.error("🔒 Ushbu dars davomati qulflangan!");
      return;
    }
    const nextStatus = !currentStatus ? "Present" : currentStatus === "Present" ? "Absent" : currentStatus === "Absent" ? "Excused" : null;
    handleSelectStatus(studentId, fullDate, studentName, nextStatus, e);
  };

  // Smart Card: Sababni tasdiqlash va Telegram Botga yuborish
  const handleConfirmReason = async (e) => {
    if (e) e.preventDefault();
    if (!activeReasonCard) return;

    const finalReason = activeReasonCard.reason === "✍️ Boshqa sabab (qo'lda yozish)" && activeReasonCard.customNote.trim()
      ? activeReasonCard.customNote.trim()
      : activeReasonCard.reason;

    const cellKey = `${activeReasonCard.studentId}_${activeReasonCard.fullDate}`;
    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: {
        status: "Absent",
        note: finalReason
      }
    }));

    try {
      await attendanceApi.create({
        group_id: selectedGroup,
        student_id: activeReasonCard.studentId,
        date: activeReasonCard.fullDate,
        status: "Absent",
        note: finalReason
      });
    } catch (err) {
      console.warn("Auto-save sync:", err.message);
    }

    // 4-Qoida: Yangi formatdagi Telegram Bot xabarnomasi
    toast.error(`📲 [Telegram Bot] "${activeReasonCard.studentName}" — Darsga qatnashmadi. Qayd etilgan sabab: [${finalReason}] ❌. Shu sabab bo'yicha kelmaganidan xabaringiz bormi?`);
    setActiveReasonCard(null);
  };

  // Mark all students Present for all dates with instant auto-save
  const handleMarkAllPresent = async () => {
    const updated = { ...matrixData };
    const promises = [];

    activeGroupStudents.forEach((student) => {
      lessonDates.forEach((d) => {
        if (parseInt(d.dayNum, 10) <= 25) {
          const cellKey = `${student.id}_${d.fullDate}`;
          updated[cellKey] = { status: "Present", note: "" };
          promises.push(
            attendanceApi.create({
              group_id: selectedGroup,
              student_id: student.id,
              date: d.fullDate,
              status: "Present",
              note: ""
            }).catch(() => null)
          );
        }
      });
    });

    setMatrixData(updated);
    await Promise.all(promises);
    toast.success("Barcha talabalar 'Keldi' qilindi va avtomatik ravishda saqlandi! ⚡");
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

  return (
    <div className="lc-up-attendance-container">
      {/* 1. AGAR GURUH TANLANMAGAN BO'LSA: GURUHLARNI TANLASH KARTALARI (HUB) */}
      {!selectedGroup ? (
        <div className="lc-group-selection-view">
          <div className="lc-group-selection-header">
            <div>
              <h2 className="lc-group-selection-title">📋 Davomat Uchun Guruhni Tanlang</h2>
              <p className="lc-group-selection-subtitle">Davomat va baholash jurnalini ochish uchun quyidagi guruhlardan birini bosing</p>
            </div>
          </div>

          <div className="lc-groups-cards-grid">
            {accessibleGroups.map((g) => {
              const gStudents = students.filter((s) => s.groupId === g.id);
              return (
                <div
                  key={g.id}
                  className="lc-group-card-item"
                  onClick={() => {
                    setSelectedGroup(g.id);
                    navigate(`/attendance/${g.id}`);
                  }}
                >
                  <div className="group-card-top">
                    <span className="group-card-badge">{g.courseName || "Frontend ReactJS"}</span>
                    <span className="group-card-count">👥 {gStudents.length} ta o'quvchi</span>
                  </div>
                  <h3 className="group-card-title">{g.name}</h3>
                  <div className="group-card-info">
                    <div className="info-row">
                      <span className="info-label">👨‍🏫 O'qituvchi:</span>
                      <span className="info-val">{g.teacherName || "Tayinlanmagan"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">⏰ Vaqt:</span>
                      <span className="info-val">{g.scheduleTime || "14:00 - 16:00"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📅 Kunlar:</span>
                      <span className="info-val">{g.scheduleDays || "Dushanba - Chorshanba - Juma"}</span>
                    </div>
                  </div>
                  <button type="button" className="btn-enter-group-attendance">
                    Davomatni Ochish →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* 2. GURUH TANLANGAN HOLAT: YAGONA BIR QATORLI TOP BAR & DAVOMAT JURNALI */}
          <div className="lc-top-controls-bar">
            {/* Left: Guruhlarga qaytish tugmasi + Guruh nomi + Nav Tabs */}
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

              <div className="lc-active-group-pill">
                <strong>{currentGroupObj?.name}</strong>
              </div>

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

            {/* Right: Year Dropdown, Month Dropdown, Barchasi Keldi, Fullscreen */}
            <div className="lc-top-right-actions">
              <div className="lc-select-pill year-select-pill">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
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
                  onChange={(e) => setSelectedMonth(e.target.value)}
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
                <button
                  type="button"
                  className="lc-btn-mark-all"
                  onClick={handleMarkAllPresent}
                  title="Barcha talabalarni 'Keldi' qilish"
                >
                  <HiOutlineCheck className="btn-icon" /> Barchasi Keldi
                </button>
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
                <table className="lc-matrix-table">
                  <thead>
                    <tr>
                      <th className="th-talabalar">Talabalar</th>
                      {lessonDates.map((d, idx) => {
                        const isToday = d.fullDate === todayDateStr;
                        const isFuture = isFutureDate(d.fullDate);
                        const isPast = isPastDate(d.fullDate);
                        return (
                          <th key={idx} className={`th-date-col ${isToday ? "th-col-today" : ""} ${isPast ? "th-col-past" : ""} ${isFuture ? "th-col-future" : ""}`}>
                            {isToday && <span className="today-badge-pill">Bugun</span>}
                            {isFuture && <span className="future-badge-pill">Kelgusi</span>}
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

                          return (
                            <td 
                              key={dIdx} 
                              className={`td-attendance-cell ${isToday ? "td-cell-today" : ""} ${isPast ? "td-cell-past" : ""} ${isFuture ? "td-cell-future" : ""} ${activePickerCell === cellKey ? "picker-open" : ""} ${isLessonTimeLocked(d.fullDate) ? "cell-time-locked" : ""}`}
                              onMouseDown={(e) => handleCellMouseDown(d.fullDate, e)}
                              onMouseUp={(e) => handleCellMouseUp(student.id, d.fullDate, student.fullName, e)}
                              onTouchStart={(e) => handleCellTouchStart(d.fullDate, e)}
                              onTouchEnd={(e) => handleCellTouchEnd(student.id, d.fullDate, student.fullName, e)}
                              onContextMenu={(e) => handleCellContextMenu(student.id, d.fullDate, student.fullName, status, e)}
                              title={`${student.fullName} — ${d.dayStr}: ${status || (isFuture ? "Kelgusi dars sanasi (Hali boshlanmadi)" : isPast ? "O'tib ketgan dars (Qulflangan)" : "Bugungi dars (Bosing / Drag: ✅ ❌)")} ${isToday ? "(Bugungi dars)" : ""} ${isLessonTimeLocked(d.fullDate) ? "(Qulflangan)" : ""}`}
                            >
                              {/* 8-Qoida: Faqat Admin o'zgartirishi mumkin bo'lgan qulf suv belgisi */}
                              {isLessonTimeLocked(d.fullDate) && (
                                <HiOutlineLockClosed className="locked-watermark-icon" title="Qulflangan — Faqat Admin o'zgartira oladi" />
                              )}

                              {/* LC-UP Usulidagi Tepada Ochiluvchi Tanlagich (Floating Top Popover) */}
                              {activePickerCell === cellKey && (
                                <div className="lc-floating-popover-card" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-absent"
                                    onClick={(e) => {
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
                                    onClick={(e) => handleSelectStatus(student.id, d.fullDate, student.fullName, "Excused", e)}
                                    title="Kechikdi / Sababli (🕒)"
                                  >
                                    <HiOutlineClock />
                                  </button>
                                  <button
                                    type="button"
                                    className="lc-pop-btn lc-pop-present"
                                    onClick={(e) => handleSelectStatus(student.id, d.fullDate, student.fullName, "Present", e)}
                                    title="Keldi (✔)"
                                  >
                                    <HiOutlineCheck />
                                  </button>
                                  <div className="lc-popover-arrow"></div>
                                </div>
                              )}

                              {status === "Present" && (
                                <div className="cell-circle circle-present">
                                  <HiOutlineCheck className="circle-icon" />
                                </div>
                              )}

                              {status === "Excused" && (
                                <div className="cell-circle circle-excused">
                                  <HiOutlineClock className="circle-flag-yellow" />
                                </div>
                              )}

                              {status === "Absent" && (
                                <div className="cell-circle circle-absent">
                                  <HiOutlineFlag className="circle-flag-red" />
                                </div>
                              )}

                              {status === "Trial" && (
                                <div className="cell-circle circle-trial">
                                  <HiOutlineInformationCircle className="circle-icon" />
                                </div>
                              )}

                              {!status && (
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
            </div>
          )}

          {/* BAHOLASH TAB */}
          {activeTab === "grades" && (
            <div className="lc-grades-wrapper">
              {/* Grades Toolbar */}
              <div className="grades-header-toolbar">
                <div className="grades-date-picker-wrap">
                  <span className="grades-toolbar-label">
                    <HiOutlineCalendarDays className="inline-icon-xs text-indigo" />
                    Baholash Dars Sanasi:
                  </span>
                  <select
                    value={selectedGradeDate || (lessonDates[0]?.fullDate || "")}
                    onChange={(e) => setSelectedGradeDate(e.target.value)}
                    className="lc-grade-date-select"
                  >
                    {lessonDates.map((d) => (
                      <option key={d.fullDate} value={d.fullDate}>
                        {d.dayStr} ({d.fullDate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <table className="lc-grades-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Talaba F.I.SH</th>
                    <th>Davomat Holati</th>
                    <th>Ball (1-10)</th>
                    <th>Uy Vazifasi</th>
                    <th>Izoh / Baholash Qaydi</th>
                    <th>Telegram Xabarnoma</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st, idx) => {
                    const activeDateStr = selectedGradeDate || (lessonDates[0]?.fullDate || "");
                    const attCell = matrixData[`${st.id}_${activeDateStr}`];
                    const isPresent = attCell?.status === "Present";
                    const isAbsent = attCell?.status === "Absent";
                    const isExcused = attCell?.status === "Excused";

                    return (
                      <tr key={st.id} className={!isPresent ? "row-student-absent" : ""}>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{st.fullName}</strong>
                        </td>
                        <td>
                          {isPresent && (
                            <span className="badge-att-status badge-status-present">
                              <HiOutlineCheck className="inline-icon-xs" /> Darsda qatnashgan
                            </span>
                          )}
                          {isExcused && (
                            <span className="badge-att-status badge-status-excused">
                              <HiOutlineFlag className="inline-icon-xs" /> Sababli kelmagan
                            </span>
                          )}
                          {isAbsent && (
                            <span className="badge-att-status badge-status-absent">
                              <HiOutlineXMark className="inline-icon-xs" /> Kelmagan
                            </span>
                          )}
                          {!attCell?.status && (
                            <span className="badge-att-status badge-status-none">
                              • Belgilanmagan
                            </span>
                          )}
                        </td>
                        <td>
                          {isPresent && !isLessonTimeLocked(activeDateStr) ? (
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={gradesData[st.id]?.score || 10}
                              onChange={(e) =>
                                setGradesData((prev) => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], score: e.target.value }
                                }))
                              }
                              className="lc-grade-input"
                            />
                          ) : isPresent && isLessonTimeLocked(activeDateStr) ? (
                            <div
                              className="locked-grade-cell"
                              onClick={() =>
                                toast.error(
                                  `⏱️ Ushbu dars baholari qulflangan (Dars tugaganiga 1 soatdan ko'p vaqt o'tgan). O'zgartirish uchun Adminga murojaat qiling.`
                                )
                              }
                              title="Dars tugaganiga 1 soatdan ko'p vaqt o'tgan (Qulflangan)"
                            >
                              <span className="badge-absent-lock" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                                <HiOutlineLockClosed className="inline-icon-xs" /> {gradesData[st.id]?.score || 10} ball
                              </span>
                            </div>
                          ) : (
                            <div
                              className="locked-grade-cell"
                              onClick={() =>
                                toast.error(
                                  `🚨 "${st.fullName}" ushbu darsga kelmagan! Kelmagan o'quvchiga baho qo'yib bo'lmaydi.`
                                )
                              }
                              title="Darsda yo'q - baho qo'yib bo'lmaydi"
                            >
                              <span className="badge-absent-lock">
                                <HiOutlineLockClosed className="inline-icon-xs" /> Bloklangan
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <label className={`checkbox-wrap ${!isPresent || isLessonTimeLocked(activeDateStr) ? "disabled-checkbox" : ""}`}>
                            <input
                              type="checkbox"
                              disabled={!isPresent || isLessonTimeLocked(activeDateStr)}
                              checked={isPresent ? (gradesData[st.id]?.homework ?? true) : false}
                              onChange={(e) =>
                                isPresent && !isLessonTimeLocked(activeDateStr) &&
                                setGradesData((prev) => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], homework: e.target.checked }
                                }))
                              }
                            />
                            <span>{isPresent ? "Bajarilgan" : "Qatnashmagan"}</span>
                          </label>
                        </td>
                        <td>
                          <input
                            type="text"
                            disabled={!isPresent || isLessonTimeLocked(activeDateStr)}
                            value={isPresent ? (gradesData[st.id]?.comment || "") : ""}
                            onChange={(e) =>
                              isPresent && !isLessonTimeLocked(activeDateStr) &&
                              setGradesData((prev) => ({
                                ...prev,
                                [st.id]: { ...prev[st.id], comment: e.target.value }
                              }))
                            }
                            placeholder={
                              !isPresent
                                ? "Darsda qatnashmaganligi sababli baholanmaydi"
                                : isLessonTimeLocked(activeDateStr)
                                ? "Dars qulflangan (O'zgartirib bo'lmaydi)"
                                : "Darsdagi faollik izohi..."
                            }
                            className={`lc-comment-input ${!isPresent || isLessonTimeLocked(activeDateStr) ? "disabled-input" : ""}`}
                          />
                        </td>
                        <td>
                          {isPresent && !isLessonTimeLocked(activeDateStr) ? (
                            <button
                              type="button"
                              className="btn-tg-grade"
                              onClick={() =>
                                toast.success(
                                  `📲 "${st.fullName}" ota-onasiga baho bot orqali yuborildi!`
                                )
                              }
                            >
                              <FaTelegram /> Yuborish
                            </button>
                          ) : isPresent && isLessonTimeLocked(activeDateStr) ? (
                            <span className="tg-disabled-tag">
                              <HiOutlineLockClosed className="inline-icon-xs" /> Qulflangan
                            </span>
                          ) : (
                            <span className="tg-disabled-tag">
                              <HiOutlineNoSymbol className="inline-icon-xs" /> Darsda yo'q
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* OTHER TABS (Mashqlar, Uyga vazifa, Chegirma, Reyting, Imtihonlar, Tarix, Izoh) */}
          {activeTab !== "attendance" && activeTab !== "grades" && (
            <div className="lc-empty-tab-panel">
              <HiOutlineSparkles className="empty-tab-icon" />
              <h3>{LC_UP_TABS.find((t) => t.id === activeTab)?.label} Bo'limi</h3>
              <p>Ushbu guruh uchun {LC_UP_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} ma'lumotlari to'liq sinxronizatsiya qilingan.</p>
            </div>
          )}
        </div>
        </>
      )}

      {/* Reason Smart Card Modal Overlay */}
      {activeReasonCard && (
        <div className="reason-modal-backdrop" onClick={() => setActiveReasonCard(null)}>
          <div className="reason-smart-card-popup" onClick={(e) => e.stopPropagation()}>
            <div className="reason-card-header">
              <div className="reason-header-left">
                <span className="reason-badge-icon">❌</span>
                <span className="reason-card-title">Dars qoldirish sababi</span>
              </div>
              <button 
                type="button" 
                className="btn-close-reason-card" 
                onClick={() => setActiveReasonCard(null)}
                title="Yopish"
              >
                ✕
              </button>
            </div>

            <div className="reason-card-student">
              <span className="student-name-highlight">{activeReasonCard.studentName}</span>
              <span className="date-highlight">• {activeReasonCard.fullDate}</span>
            </div>

            <div className="reason-card-body">
              <label className="reason-input-label">Sababni tanlang:</label>
              <select
                className="reason-select-dropdown"
                value={activeReasonCard.reason}
                onChange={(e) => setActiveReasonCard({ ...activeReasonCard, reason: e.target.value })}
              >
                {ABSENT_REASONS.map((r) => (
                  <option key={r.id} value={r.label}>{r.label}</option>
                ))}
              </select>

              {activeReasonCard.reason === "✍️ Boshqa sabab (qo'lda yozish)" && (
                <input
                  type="text"
                  className="reason-custom-input"
                  placeholder="Sababni yozing..."
                  value={activeReasonCard.customNote}
                  onChange={(e) => setActiveReasonCard({ ...activeReasonCard, customNote: e.target.value })}
                  autoFocus
                />
              )}

              <button type="button" className="btn-submit-reason-card" onClick={handleConfirmReason}>
                Tasdiqlash & Botga Yuborish 📲
              </button>
            </div>
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
