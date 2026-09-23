import axios from "axios";
import {
  INITIAL_COURSES,
  INITIAL_TEACHERS,
  INITIAL_GROUPS,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_EXAMS,
  INITIAL_HOMEWORK,
  INITIAL_CERTIFICATES,
  INITIAL_ROOMS,
  INITIAL_LEADS,
  STORAGE,
  getStoredData,
  setStoredData,
} from "../data/eduData";

// Reviews and Trial lessons initial mock data
const INITIAL_REVIEWS = [
  {
    id: 1,
    studentId: 1,
    studentName: "Abdulaziz Abdulhayev",
    teacherName: "Abdulaziz Abdulhayev",
    groupName: "F-12 Guruh (ReactJS)",
    rating: 10,
    category: "O'qitish sifati",
    comment: "Darslar juda qiziqarli va tushunarli o'tilmoqda! Amaliy loyihalar ko'p.",
    status: "Ko'rib chiqildi",
    date: "2026-08-14",
  },
  {
    id: 2,
    studentId: 4,
    studentName: "Madinabonu Karimova",
    teacherName: "Farhod Saidov",
    groupName: "E-09 Guruh (IELTS)",
    rating: 9,
    category: "Dars qiziqarliligi",
    comment: "Speaking darslaridagi mashqlar va mock testlar IELTS darajamni ancha oshirdi.",
    status: "Ko'rib chiqildi",
    date: "2026-08-16",
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Diyorbek Toshmatov",
    teacherName: "Azizbek Murodov",
    groupName: "P-04 Guruh (Python)",
    rating: 10,
    category: "O'qitish sifati",
    comment: "Django va REST API mavzulari professional tarzda o'rgatilmoqda.",
    status: "Ko'rib chiqildi",
    date: "2026-08-18",
  },
];

const INITIAL_TRIAL_LESSONS = [
  {
    id: 1,
    studentName: "Jasurbek Rustamov",
    phone: "+998 90 599 06 00",
    teacherName: "Abdulaziz Abdulhayev",
    courseName: "Frontend ReactJS",
    date: "2026-09-24",
    time: "14:00 - 16:00",
    room: "201-xona (Kompyuter Zali)",
    status: "Rejalashtirilgan",
    notes: "Instagramdan yozilgan, Reactga qiziqishi yuqori",
  },
  {
    id: 2,
    studentName: "Dildora Alimova",
    phone: "+998 90 599 06 00",
    teacherName: "Farhod Saidov",
    courseName: "General English (IELTS)",
    date: "2026-09-25",
    time: "10:00 - 12:00",
    room: "102-xona (Media Xona)",
    status: "Rejalashtirilgan",
    notes: "IELTS 7.0 olishni maqsad qilgan",
  },
];

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2500, // 2.5s timeout prevents long hanging when backend is offline
  headers: {
    "Content-Type": "application/json",
  },
});

export const normalizeGroup = (g) => ({
  id: g?.id || "G-101",
  name: g?.name || "Guruh",
  courseId: g?.course_id || g?.courseId || 1,
  courseName: g?.course_name || g?.courseName || g?.course?.name || "Frontend ReactJS",
  teacherId: g?.teacher_id || g?.teacherId || 101,
  teacherName: g?.teacher_name || g?.teacherName || g?.teacher?.name || "Abdulaziz Abdulhayev",
  room: g?.room || "201-xona (Kompyuter zali)",
  scheduleDays: g?.schedule_days || g?.scheduleDays || "Dushanba - Chorshanba - Juma",
  scheduleTime: g?.schedule_time || g?.scheduleTime || "14:00 - 16:00",
  monthlyFee: parseFloat(g?.monthly_fee || g?.monthlyFee || 0),
  status: g?.status || "Active",
  startDate: g?.start_date || g?.startDate || new Date().toISOString().split("T")[0],
});

export const normalizeStudent = (s) => ({
  id: s?.id || 1,
  fullName: s?.full_name || s?.fullName || "O'quvchi",
  phone: s?.phone || "+998 90 599 06 00",
  parentPhone: s?.parent_phone || s?.parentPhone || "+998 90 599 06 00",
  groupId: s?.group_id || s?.groupId || "G-101",
  groupName: s?.group_name || s?.groupName || s?.group?.name || "F-12 Guruh",
  joinDate: s?.join_date || s?.joinDate || new Date().toISOString().split("T")[0],
  paymentStatus: s?.payment_status || s?.paymentStatus || "Paid",
  balance: parseFloat(s?.balance || 0),
  status: s?.status || "Active",
});

export const normalizeTeacher = (t) => ({
  id: t?.id || 101,
  name: t?.name || "O'qituvchi",
  phone: t?.phone || "+998 90 599 06 00",
  subject: t?.subject || "Dasturlash",
  salary: parseFloat(t?.salary || 0),
  experience: t?.experience || "3 yil",
  avatar: t?.avatar || "👨‍💻",
});

export const normalizeCourse = (c) => ({
  id: c?.id || 1,
  name: c?.name || "Kurs",
  duration: c?.duration || "6 oy",
  price: parseFloat(c?.price || 0),
});

export const normalizePayment = (p) => ({
  id: p?.id || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
  studentId: p?.student_id || p?.studentId || 1,
  studentName: p?.student_name || p?.studentName || p?.student?.full_name || "Abdulaziz Abdulhayev",
  groupName: p?.group_name || p?.groupName || "F-12 Guruh",
  amount: parseFloat(p?.amount || 0),
  month: p?.month || "Avgust 2026",
  paymentMethod: p?.payment_method || p?.paymentMethod || "Card (Click)",
  date: p?.date || new Date().toISOString().split("T")[0],
  recordedBy: p?.recorded_by || p?.recordedBy || "Abdulaziz Abdulhayev (Admin)",
});

export const normalizeAttendance = (a) => ({
  id: a?.id || Math.floor(1000 + Math.random() * 9000),
  groupId: a?.group_id || a?.groupId || "G-101",
  studentId: a?.student_id || a?.studentId || 1,
  date: a?.date || new Date().toISOString().split("T")[0],
  status: a?.status || "Present",
  note: a?.note || "",
  reasonCategory: a?.reason_category || a?.reasonCategory || "",
});

export const normalizeExam = (e) => ({
  id: e?.id || `EX-${Math.floor(100 + Math.random() * 900)}`,
  groupName: e?.group_name || e?.groupName || "F-12 Guruh",
  title: e?.title || "Oraliq Imtihon",
  date: e?.date || new Date().toISOString().split("T")[0],
  totalScore: parseFloat(e?.total_score || e?.totalScore || 100),
  maxPassingScore: parseFloat(e?.max_passing_score || e?.maxPassingScore || 70),
  status: e?.status || "Upcoming",
});

export const normalizeHomework = (h) => ({
  id: h?.id || `HW-${Math.floor(10 + Math.random() * 90)}`,
  groupName: h?.group_name || h?.groupName || "F-12 Guruh",
  title: h?.title || "Uyga vazifa",
  deadline: h?.deadline || new Date().toISOString().split("T")[0],
  totalSubmitted: parseInt(h?.total_submitted || h?.totalSubmitted || 0),
  status: h?.status || "Active",
});

export const normalizeCertificate = (c) => ({
  id: c?.id || `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
  studentName: c?.student_name || c?.studentName || "Abdulaziz Abdulhayev",
  courseName: c?.course_name || c?.courseName || "Frontend ReactJS",
  issueDate: c?.issue_date || c?.issueDate || new Date().toISOString().split("T")[0],
  qrCode: c?.qr_code || c?.qrCode || "QR-VERIFIED",
  grade: c?.grade || "A (95%)",
});

export const normalizeRoom = (r) => ({
  id: r?.id || "R-201",
  name: r?.name || "Xona",
  capacity: parseInt(r?.capacity || 20),
  floor: r?.floor || (String(r?.name).startsWith("1") ? "1-qavat" : String(r?.name).startsWith("3") ? "3-qavat" : "2-qavat"),
  computersCount: parseInt(r?.computers_count || r?.computersCount || 0),
  projector: r?.projector || "Mavjud",
  status: r?.status || "Active",
});

export const normalizeLead = (l) => ({
  id: l?.id || `L-${Math.floor(100 + Math.random() * 900)}`,
  name: l?.name || "Mijoz",
  phone: l?.phone || "+998 90 599 06 00",
  interestedCourse: l?.interested_course || l?.interestedCourse || "Frontend ReactJS",
  source: l?.source || "Instagram Ads",
  status: l?.status || "Yangi",
});

export const normalizeReview = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id || r.studentId,
    studentName: r.student_name || r.studentName,
    teacherName: r.teacher_name || r.teacherName,
    groupName: r.group_name || r.groupName,
    rating: parseInt(r.rating) || 10,
    category: r.category,
    comment: r.comment,
    status: r.status,
    date: r.date,
  };
};

export const normalizeTrialLesson = (t) => {
  if (!t) return null;
  return {
    id: t.id,
    studentName: t.student_name || t.studentName,
    phone: t.phone,
    teacherName: t.teacher_name || t.teacherName,
    courseName: t.course_name || t.courseName,
    date: t.date,
    time: t.time,
    room: t.room,
    status: t.status,
    notes: t.notes,
  };
};

// ==================== APIS WITH SMART PERSISTENT FALLBACK ====================

export const groupsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/groups");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeGroup);
        setStoredData(STORAGE.GROUPS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.GROUPS, INITIAL_GROUPS).map(normalizeGroup);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/groups/${id}`);
      if (res.data) return normalizeGroup(res.data);
    } catch {}
    const list = getStoredData(STORAGE.GROUPS, INITIAL_GROUPS);
    return normalizeGroup(list.find((g) => String(g.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeGroup({ ...data, id: data.id || `G-${Math.floor(100 + Math.random() * 900)}` });
    try {
      const res = await api.post("/groups", data);
      if (res.data) newItem = normalizeGroup(res.data);
    } catch {}
    const list = getStoredData(STORAGE.GROUPS, INITIAL_GROUPS);
    setStoredData(STORAGE.GROUPS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeGroup({ ...data, id });
    try {
      const res = await api.put(`/groups/${id}`, data);
      if (res.data) updated = normalizeGroup(res.data);
    } catch {}
    const list = getStoredData(STORAGE.GROUPS, INITIAL_GROUPS);
    const updatedList = list.map((g) => (String(g.id) === String(id) ? { ...g, ...updated } : g));
    setStoredData(STORAGE.GROUPS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/groups/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.GROUPS, INITIAL_GROUPS);
    setStoredData(STORAGE.GROUPS, list.filter((g) => String(g.id) !== String(id)));
    return { success: true };
  },
};

export const studentsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/students");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeStudent);
        setStoredData(STORAGE.STUDENTS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS).map(normalizeStudent);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data) return normalizeStudent(res.data);
    } catch {}
    const list = getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS);
    return normalizeStudent(list.find((s) => String(s.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeStudent({ ...data, id: data.id || Math.floor(100 + Math.random() * 900) });
    try {
      const res = await api.post("/students", data);
      if (res.data) newItem = normalizeStudent(res.data);
    } catch {}
    const list = getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS);
    setStoredData(STORAGE.STUDENTS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeStudent({ ...data, id });
    try {
      const res = await api.put(`/students/${id}`, data);
      if (res.data) updated = normalizeStudent(res.data);
    } catch {}
    const list = getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS);
    const updatedList = list.map((s) => (String(s.id) === String(id) ? { ...s, ...updated } : s));
    setStoredData(STORAGE.STUDENTS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/students/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS);
    setStoredData(STORAGE.STUDENTS, list.filter((s) => String(s.id) !== String(id)));
    return { success: true };
  },
  transfer: async (id, data) => {
    try {
      const res = await api.post(`/students/${id}/transfer`, data);
      if (res.data) return res.data;
    } catch {}
    const list = getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS);
    const updatedList = list.map((s) =>
      String(s.id) === String(id)
        ? { ...s, groupId: data.newGroupId || data.groupId, groupName: data.newGroupName || data.groupName }
        : s
    );
    setStoredData(STORAGE.STUDENTS, updatedList);
    return { success: true };
  },
  transferGroup: async (id, newGroupId, transferReason, oldGroupId, oldGroupName, newGroupName) => {
    try {
      const res = await api.post(`/students/${id}/transfer`, {
        newGroupId,
        newGroupName: newGroupName || newGroupId,
        transferReason,
        oldGroupId,
        oldGroupName,
      });
      if (res.data) return res.data;
    } catch {}
    const list = getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS);
    const updatedList = list.map((s) =>
      String(s.id) === String(id) ? { ...s, groupId: newGroupId, groupName: newGroupName || newGroupId } : s
    );
    setStoredData(STORAGE.STUDENTS, updatedList);
    return { success: true };
  },
};

export const teachersApi = {
  getAll: async () => {
    try {
      const res = await api.get("/teachers");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeTeacher);
        setStoredData(STORAGE.TEACHERS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS).map(normalizeTeacher);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/teachers/${id}`);
      if (res.data) return normalizeTeacher(res.data);
    } catch {}
    const list = getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS);
    return normalizeTeacher(list.find((t) => String(t.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeTeacher({ ...data, id: data.id || Math.floor(200 + Math.random() * 800) });
    try {
      const res = await api.post("/teachers", data);
      if (res.data) newItem = normalizeTeacher(res.data);
    } catch {}
    const list = getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS);
    setStoredData(STORAGE.TEACHERS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeTeacher({ ...data, id });
    try {
      const res = await api.put(`/teachers/${id}`, data);
      if (res.data) updated = normalizeTeacher(res.data);
    } catch {}
    const list = getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS);
    const updatedList = list.map((t) => (String(t.id) === String(id) ? { ...t, ...updated } : t));
    setStoredData(STORAGE.TEACHERS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/teachers/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.TEACHERS, INITIAL_TEACHERS);
    setStoredData(STORAGE.TEACHERS, list.filter((t) => String(t.id) !== String(id)));
    return { success: true };
  },
};

export const coursesApi = {
  getAll: async () => {
    try {
      const res = await api.get("/courses");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeCourse);
        setStoredData("educontrol_courses_v5", normalized);
        return normalized;
      }
    } catch {}
    return getStoredData("educontrol_courses_v5", INITIAL_COURSES).map(normalizeCourse);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data) return normalizeCourse(res.data);
    } catch {}
    const list = getStoredData("educontrol_courses_v5", INITIAL_COURSES);
    return normalizeCourse(list.find((c) => String(c.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeCourse({ ...data, id: data.id || Math.floor(10 + Math.random() * 90) });
    try {
      const res = await api.post("/courses", data);
      if (res.data) newItem = normalizeCourse(res.data);
    } catch {}
    const list = getStoredData("educontrol_courses_v5", INITIAL_COURSES);
    setStoredData("educontrol_courses_v5", [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeCourse({ ...data, id });
    try {
      const res = await api.put(`/courses/${id}`, data);
      if (res.data) updated = normalizeCourse(res.data);
    } catch {}
    const list = getStoredData("educontrol_courses_v5", INITIAL_COURSES);
    const updatedList = list.map((c) => (String(c.id) === String(id) ? { ...c, ...updated } : c));
    setStoredData("educontrol_courses_v5", updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/courses/${id}`);
    } catch {}
    const list = getStoredData("educontrol_courses_v5", INITIAL_COURSES);
    setStoredData("educontrol_courses_v5", list.filter((c) => String(c.id) !== String(id)));
    return { success: true };
  },
};

export const paymentsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/payments");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizePayment);
        setStoredData(STORAGE.PAYMENTS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.PAYMENTS, INITIAL_PAYMENTS).map(normalizePayment);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/payments/${id}`);
      if (res.data) return normalizePayment(res.data);
    } catch {}
    const list = getStoredData(STORAGE.PAYMENTS, INITIAL_PAYMENTS);
    return normalizePayment(list.find((p) => String(p.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizePayment({ ...data, id: data.id || `PAY-${Math.floor(1000 + Math.random() * 9000)}` });
    try {
      const res = await api.post("/payments", data);
      if (res.data) newItem = normalizePayment(res.data);
    } catch {}
    const list = getStoredData(STORAGE.PAYMENTS, INITIAL_PAYMENTS);
    setStoredData(STORAGE.PAYMENTS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizePayment({ ...data, id });
    try {
      const res = await api.put(`/payments/${id}`, data);
      if (res.data) updated = normalizePayment(res.data);
    } catch {}
    const list = getStoredData(STORAGE.PAYMENTS, INITIAL_PAYMENTS);
    const updatedList = list.map((p) => (String(p.id) === String(id) ? { ...p, ...updated } : p));
    setStoredData(STORAGE.PAYMENTS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/payments/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.PAYMENTS, INITIAL_PAYMENTS);
    setStoredData(STORAGE.PAYMENTS, list.filter((p) => String(p.id) !== String(id)));
    return { success: true };
  },
};

export const attendanceApi = {
  getAll: async (params) => {
    try {
      const res = await api.get("/attendance", { params });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeAttendance);
        setStoredData(STORAGE.ATTENDANCE, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.ATTENDANCE, INITIAL_ATTENDANCE).map(normalizeAttendance);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/attendance/${id}`);
      if (res.data) return normalizeAttendance(res.data);
    } catch {}
    const list = getStoredData(STORAGE.ATTENDANCE, INITIAL_ATTENDANCE);
    return normalizeAttendance(list.find((a) => String(a.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeAttendance({ ...data, id: data.id || Math.floor(1000 + Math.random() * 9000) });
    try {
      const res = await api.post("/attendance", data);
      if (res.data) newItem = normalizeAttendance(res.data);
    } catch {}
    const list = getStoredData(STORAGE.ATTENDANCE, INITIAL_ATTENDANCE);
    // Replace if exists for same student and date
    const filtered = list.filter(
      (a) => !(String(a.studentId) === String(newItem.studentId) && a.date === newItem.date)
    );
    setStoredData(STORAGE.ATTENDANCE, [newItem, ...filtered]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeAttendance({ ...data, id });
    try {
      const res = await api.put(`/attendance/${id}`, data);
      if (res.data) updated = normalizeAttendance(res.data);
    } catch {}
    const list = getStoredData(STORAGE.ATTENDANCE, INITIAL_ATTENDANCE);
    const updatedList = list.map((a) => (String(a.id) === String(id) ? { ...a, ...updated } : a));
    setStoredData(STORAGE.ATTENDANCE, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/attendance/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.ATTENDANCE, INITIAL_ATTENDANCE);
    setStoredData(STORAGE.ATTENDANCE, list.filter((a) => String(a.id) !== String(id)));
    return { success: true };
  },
};

export const examsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/exams");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeExam);
        setStoredData(STORAGE.EXAMS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.EXAMS, INITIAL_EXAMS).map(normalizeExam);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/exams/${id}`);
      if (res.data) return normalizeExam(res.data);
    } catch {}
    const list = getStoredData(STORAGE.EXAMS, INITIAL_EXAMS);
    return normalizeExam(list.find((e) => String(e.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeExam({ ...data, id: data.id || `EX-${Math.floor(100 + Math.random() * 900)}` });
    try {
      const res = await api.post("/exams", data);
      if (res.data) newItem = normalizeExam(res.data);
    } catch {}
    const list = getStoredData(STORAGE.EXAMS, INITIAL_EXAMS);
    setStoredData(STORAGE.EXAMS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeExam({ ...data, id });
    try {
      const res = await api.put(`/exams/${id}`, data);
      if (res.data) updated = normalizeExam(res.data);
    } catch {}
    const list = getStoredData(STORAGE.EXAMS, INITIAL_EXAMS);
    const updatedList = list.map((e) => (String(e.id) === String(id) ? { ...e, ...updated } : e));
    setStoredData(STORAGE.EXAMS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/exams/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.EXAMS, INITIAL_EXAMS);
    setStoredData(STORAGE.EXAMS, list.filter((e) => String(e.id) !== String(id)));
    return { success: true };
  },
};

export const homeworkApi = {
  getAll: async () => {
    try {
      const res = await api.get("/homework");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeHomework);
        setStoredData(STORAGE.HOMEWORK, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.HOMEWORK, INITIAL_HOMEWORK).map(normalizeHomework);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/homework/${id}`);
      if (res.data) return normalizeHomework(res.data);
    } catch {}
    const list = getStoredData(STORAGE.HOMEWORK, INITIAL_HOMEWORK);
    return normalizeHomework(list.find((h) => String(h.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeHomework({ ...data, id: data.id || `HW-${Math.floor(10 + Math.random() * 90)}` });
    try {
      const res = await api.post("/homework", data);
      if (res.data) newItem = normalizeHomework(res.data);
    } catch {}
    const list = getStoredData(STORAGE.HOMEWORK, INITIAL_HOMEWORK);
    setStoredData(STORAGE.HOMEWORK, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeHomework({ ...data, id });
    try {
      const res = await api.put(`/homework/${id}`, data);
      if (res.data) updated = normalizeHomework(res.data);
    } catch {}
    const list = getStoredData(STORAGE.HOMEWORK, INITIAL_HOMEWORK);
    const updatedList = list.map((h) => (String(h.id) === String(id) ? { ...h, ...updated } : h));
    setStoredData(STORAGE.HOMEWORK, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/homework/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.HOMEWORK, INITIAL_HOMEWORK);
    setStoredData(STORAGE.HOMEWORK, list.filter((h) => String(h.id) !== String(id)));
    return { success: true };
  },
};

export const certificatesApi = {
  getAll: async () => {
    try {
      const res = await api.get("/certificates");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeCertificate);
        setStoredData(STORAGE.CERTIFICATES, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES).map(normalizeCertificate);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/certificates/${id}`);
      if (res.data) return normalizeCertificate(res.data);
    } catch {}
    const list = getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES);
    return normalizeCertificate(list.find((c) => String(c.id) === String(id)) || list[0]);
  },
  verify: async (qrCode) => {
    try {
      const res = await api.get(`/certificates/verify/${qrCode}`);
      if (res.data) return res.data;
    } catch {}
    const list = getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES);
    const found = list.find((c) => c.qrCode === qrCode);
    return found ? { valid: true, certificate: found } : { valid: false };
  },
  create: async (data) => {
    let newItem = normalizeCertificate({ ...data, id: data.id || `CERT-${Math.floor(1000 + Math.random() * 9000)}` });
    try {
      const res = await api.post("/certificates", data);
      if (res.data) newItem = normalizeCertificate(res.data);
    } catch {}
    const list = getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES);
    setStoredData(STORAGE.CERTIFICATES, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeCertificate({ ...data, id });
    try {
      const res = await api.put(`/certificates/${id}`, data);
      if (res.data) updated = normalizeCertificate(res.data);
    } catch {}
    const list = getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES);
    const updatedList = list.map((c) => (String(c.id) === String(id) ? { ...c, ...updated } : c));
    setStoredData(STORAGE.CERTIFICATES, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/certificates/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES);
    setStoredData(STORAGE.CERTIFICATES, list.filter((c) => String(c.id) !== String(id)));
    return { success: true };
  },
};

export const roomsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/rooms");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeRoom);
        setStoredData(STORAGE.ROOMS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.ROOMS, INITIAL_ROOMS).map(normalizeRoom);
  },
  getOccupancy: async () => {
    try {
      const res = await api.get("/rooms/occupancy");
      if (res.data) return res.data;
    } catch {}
    return [
      { roomId: "R-201", roomName: "201-xona", time: "14:00 - 16:00", groupName: "F-12 Guruh", isOccupied: true },
      { roomId: "R-203", roomName: "203-xona", time: "16:30 - 18:30", groupName: "P-04 Guruh", isOccupied: true },
    ];
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/rooms/${id}`);
      if (res.data) return normalizeRoom(res.data);
    } catch {}
    const list = getStoredData(STORAGE.ROOMS, INITIAL_ROOMS);
    return normalizeRoom(list.find((r) => String(r.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeRoom({ ...data, id: data.id || `R-${Math.floor(100 + Math.random() * 900)}` });
    try {
      const res = await api.post("/rooms", data);
      if (res.data) newItem = normalizeRoom(res.data);
    } catch {}
    const list = getStoredData(STORAGE.ROOMS, INITIAL_ROOMS);
    setStoredData(STORAGE.ROOMS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeRoom({ ...data, id });
    try {
      const res = await api.put(`/rooms/${id}`, data);
      if (res.data) updated = normalizeRoom(res.data);
    } catch {}
    const list = getStoredData(STORAGE.ROOMS, INITIAL_ROOMS);
    const updatedList = list.map((r) => (String(r.id) === String(id) ? { ...r, ...updated } : r));
    setStoredData(STORAGE.ROOMS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.ROOMS, INITIAL_ROOMS);
    setStoredData(STORAGE.ROOMS, list.filter((r) => String(r.id) !== String(id)));
    return { success: true };
  },
};

export const leadsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/leads");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeLead);
        setStoredData(STORAGE.LEADS, normalized);
        return normalized;
      }
    } catch {}
    return getStoredData(STORAGE.LEADS, INITIAL_LEADS).map(normalizeLead);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/leads/${id}`);
      if (res.data) return normalizeLead(res.data);
    } catch {}
    const list = getStoredData(STORAGE.LEADS, INITIAL_LEADS);
    return normalizeLead(list.find((l) => String(l.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeLead({ ...data, id: data.id || `L-${Math.floor(100 + Math.random() * 900)}` });
    try {
      const res = await api.post("/leads", data);
      if (res.data) newItem = normalizeLead(res.data);
    } catch {}
    const list = getStoredData(STORAGE.LEADS, INITIAL_LEADS);
    setStoredData(STORAGE.LEADS, [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeLead({ ...data, id });
    try {
      const res = await api.put(`/leads/${id}`, data);
      if (res.data) updated = normalizeLead(res.data);
    } catch {}
    const list = getStoredData(STORAGE.LEADS, INITIAL_LEADS);
    const updatedList = list.map((l) => (String(l.id) === String(id) ? { ...l, ...updated } : l));
    setStoredData(STORAGE.LEADS, updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/leads/${id}`);
    } catch {}
    const list = getStoredData(STORAGE.LEADS, INITIAL_LEADS);
    setStoredData(STORAGE.LEADS, list.filter((l) => String(l.id) !== String(id)));
    return { success: true };
  },
};

export const reviewsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/reviews");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeReview);
        setStoredData("educontrol_reviews_v5", normalized);
        return normalized;
      }
    } catch {}
    return getStoredData("educontrol_reviews_v5", INITIAL_REVIEWS).map(normalizeReview);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/reviews/${id}`);
      if (res.data) return normalizeReview(res.data);
    } catch {}
    const list = getStoredData("educontrol_reviews_v5", INITIAL_REVIEWS);
    return normalizeReview(list.find((r) => String(r.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeReview({ ...data, id: data.id || Math.floor(100 + Math.random() * 900) });
    try {
      const res = await api.post("/reviews", data);
      if (res.data) newItem = normalizeReview(res.data);
    } catch {}
    const list = getStoredData("educontrol_reviews_v5", INITIAL_REVIEWS);
    setStoredData("educontrol_reviews_v5", [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeReview({ ...data, id });
    try {
      const res = await api.put(`/reviews/${id}`, data);
      if (res.data) updated = normalizeReview(res.data);
    } catch {}
    const list = getStoredData("educontrol_reviews_v5", INITIAL_REVIEWS);
    const updatedList = list.map((r) => (String(r.id) === String(id) ? { ...r, ...updated } : r));
    setStoredData("educontrol_reviews_v5", updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
    } catch {}
    const list = getStoredData("educontrol_reviews_v5", INITIAL_REVIEWS);
    setStoredData("educontrol_reviews_v5", list.filter((r) => String(r.id) !== String(id)));
    return { success: true };
  },
};

export const trialLessonsApi = {
  getAll: async () => {
    try {
      const res = await api.get("/trial-lessons");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeTrialLesson);
        setStoredData("educontrol_trial_lessons_v5", normalized);
        return normalized;
      }
    } catch {}
    return getStoredData("educontrol_trial_lessons_v5", INITIAL_TRIAL_LESSONS).map(normalizeTrialLesson);
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/trial-lessons/${id}`);
      if (res.data) return normalizeTrialLesson(res.data);
    } catch {}
    const list = getStoredData("educontrol_trial_lessons_v5", INITIAL_TRIAL_LESSONS);
    return normalizeTrialLesson(list.find((t) => String(t.id) === String(id)) || list[0]);
  },
  create: async (data) => {
    let newItem = normalizeTrialLesson({ ...data, id: data.id || Math.floor(100 + Math.random() * 900) });
    try {
      const res = await api.post("/trial-lessons", data);
      if (res.data) newItem = normalizeTrialLesson(res.data);
    } catch {}
    const list = getStoredData("educontrol_trial_lessons_v5", INITIAL_TRIAL_LESSONS);
    setStoredData("educontrol_trial_lessons_v5", [newItem, ...list]);
    return newItem;
  },
  update: async (id, data) => {
    let updated = normalizeTrialLesson({ ...data, id });
    try {
      const res = await api.put(`/trial-lessons/${id}`, data);
      if (res.data) updated = normalizeTrialLesson(res.data);
    } catch {}
    const list = getStoredData("educontrol_trial_lessons_v5", INITIAL_TRIAL_LESSONS);
    const updatedList = list.map((t) => (String(t.id) === String(id) ? { ...t, ...updated } : t));
    setStoredData("educontrol_trial_lessons_v5", updatedList);
    return updated;
  },
  delete: async (id) => {
    try {
      await api.delete(`/trial-lessons/${id}`);
    } catch {}
    const list = getStoredData("educontrol_trial_lessons_v5", INITIAL_TRIAL_LESSONS);
    setStoredData("educontrol_trial_lessons_v5", list.filter((t) => String(t.id) !== String(id)));
    return { success: true };
  },
};

export const telegramApi = {
  getStatus: async () => {
    try {
      const res = await api.get("/telegram/status");
      if (res.data) return res.data;
    } catch {}
    return { isConnected: true, botUsername: "@Velnex_bot", activeSubscribers: 28 };
  },
  updateConfig: async (config) => {
    try {
      const res = await api.put("/telegram/config", config);
      if (res.data) return res.data;
    } catch {}
    return { success: true, config };
  },
  sendBroadcast: async (message, targetRole) => {
    try {
      const res = await api.post("/telegram/broadcast", { message, targetRole });
      if (res.data) return res.data;
    } catch {}
    return { success: true, count: 28 };
  },
  sendTestNotification: async (type, payload = {}) => {
    try {
      const res = await api.post("/telegram/test-notification", { type, ...payload });
      if (res.data) return res.data;
    } catch {}
    return { success: true };
  },
};

export default api;
