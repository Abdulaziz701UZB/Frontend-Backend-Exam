import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const normalizeGroup = (g) => ({
  id: g.id,
  name: g.name,
  courseId: g.course_id || g.courseId || 1,
  courseName: g.course_name || g.courseName || g.course?.name || "Frontend ReactJS",
  teacherId: g.teacher_id || g.teacherId || 101,
  teacherName: g.teacher_name || g.teacherName || g.teacher?.name || "Abdulaziz Abdulhayev",
  room: g.room || "201-xona (Kompyuter zali)",
  scheduleDays: g.schedule_days || g.scheduleDays || "Dushanba - Chorshanba - Juma",
  scheduleTime: g.schedule_time || g.scheduleTime || "14:00 - 16:00",
  monthlyFee: parseFloat(g.monthly_fee || g.monthlyFee || 0),
  status: g.status || "Active",
  startDate: g.start_date || g.startDate || new Date().toISOString().split("T")[0],
});

export const normalizeStudent = (s) => ({
  id: s.id,
  fullName: s.full_name || s.fullName || "",
  phone: s.phone || "",
  parentPhone: s.parent_phone || s.parentPhone || "+998 90 599 06 00",
  groupId: s.group_id || s.groupId || "G-101",
  groupName: s.group_name || s.groupName || s.group?.name || "F-12 Guruh",
  joinDate: s.join_date || s.joinDate || new Date().toISOString().split("T")[0],
  paymentStatus: s.payment_status || s.paymentStatus || "Paid",
  balance: parseFloat(s.balance || 0),
  status: s.status || "Active",
});

export const normalizeTeacher = (t) => ({
  id: t.id,
  name: t.name,
  phone: t.phone,
  subject: t.subject,
  salary: parseFloat(t.salary || 0),
  experience: t.experience,
  avatar: t.avatar || "teacher",
});

export const normalizeCourse = (c) => ({
  id: c.id,
  name: c.name,
  duration: c.duration,
  price: parseFloat(c.price || 0),
});

export const normalizePayment = (p) => ({
  id: p.id,
  studentId: p.student_id || p.studentId,
  studentName: p.student_name || p.studentName || p.student?.full_name || "Abdulaziz Abdulhayev",
  groupName: p.group_name || p.groupName || "F-12 Guruh",
  amount: parseFloat(p.amount || 0),
  month: p.month,
  paymentMethod: p.payment_method || p.paymentMethod || "Card (Click)",
  date: p.date,
  recordedBy: p.recorded_by || p.recordedBy || "Admin",
});

export const normalizeAttendance = (a) => ({
  id: a.id,
  groupId: a.group_id || a.groupId,
  studentId: a.student_id || a.studentId,
  date: a.date,
  status: a.status,
  note: a.note || "",
  reasonCategory: a.reason_category || a.reasonCategory || "",
});

export const normalizeExam = (e) => ({
  id: e.id,
  groupName: e.group_name || e.groupName,
  title: e.title,
  date: e.date,
  totalScore: parseFloat(e.total_score || e.totalScore || 100),
  maxPassingScore: parseFloat(e.max_passing_score || e.maxPassingScore || 70),
  status: e.status || "Upcoming",
});

export const normalizeHomework = (h) => ({
  id: h.id,
  groupName: h.group_name || h.groupName,
  title: h.title,
  deadline: h.deadline,
  totalSubmitted: parseInt(h.total_submitted || h.totalSubmitted || 0),
  status: h.status || "Active",
});

export const normalizeCertificate = (c) => ({
  id: c.id,
  studentName: c.student_name || c.studentName,
  courseName: c.course_name || c.courseName,
  issueDate: c.issue_date || c.issueDate,
  qrCode: c.qr_code || c.qrCode,
  grade: c.grade,
});

export const normalizeRoom = (r) => ({
  id: r.id,
  name: r.name,
  capacity: parseInt(r.capacity || 20),
  floor: r.floor || (String(r.name).startsWith("1") ? "1-qavat" : String(r.name).startsWith("3") ? "3-qavat" : "2-qavat"),
  computersCount: parseInt(r.computers_count || r.computersCount || 0),
  projector: r.projector || "Mavjud",
  status: r.status || "Active",
});

export const normalizeLead = (l) => ({
  id: l.id,
  name: l.name,
  phone: l.phone,
  interestedCourse: l.interested_course || l.interestedCourse,
  source: l.source,
  status: l.status || "Yangi",
});

export const groupsApi = {
  getAll: async () => {
    const res = await api.get("/groups");
    return (res.data || []).map(normalizeGroup);
  },
  getById: async (id) => {
    const res = await api.get(`/groups/${id}`);
    return normalizeGroup(res.data);
  },
  create: async (data) => {
    const res = await api.post("/groups", data);
    return normalizeGroup(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/groups/${id}`, data);
    return normalizeGroup(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/groups/${id}`);
    return res.data;
  },
};

export const studentsApi = {
  getAll: async () => {
    const res = await api.get("/students");
    return (res.data || []).map(normalizeStudent);
  },
  getById: async (id) => {
    const res = await api.get(`/students/${id}`);
    return normalizeStudent(res.data);
  },
  create: async (data) => {
    const res = await api.post("/students", data);
    return normalizeStudent(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/students/${id}`, data);
    return normalizeStudent(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },
  transfer: async (id, data) => {
    const res = await api.post(`/students/${id}/transfer`, data);
    return res.data;
  },
  transferGroup: async (id, newGroupId, transferReason, oldGroupId, oldGroupName, newGroupName) => {
    const res = await api.post(`/students/${id}/transfer`, {
      newGroupId,
      newGroupName: newGroupName || newGroupId,
      transferReason,
      oldGroupId,
      oldGroupName,
    });
    return res.data;
  },
};

export const teachersApi = {
  getAll: async () => {
    const res = await api.get("/teachers");
    return (res.data || []).map(normalizeTeacher);
  },
  getById: async (id) => {
    const res = await api.get(`/teachers/${id}`);
    return normalizeTeacher(res.data);
  },
  create: async (data) => {
    const res = await api.post("/teachers", data);
    return normalizeTeacher(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/teachers/${id}`, data);
    return normalizeTeacher(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/teachers/${id}`);
    return res.data;
  },
};

export const coursesApi = {
  getAll: async () => {
    const res = await api.get("/courses");
    return (res.data || []).map(normalizeCourse);
  },
  getById: async (id) => {
    const res = await api.get(`/courses/${id}`);
    return normalizeCourse(res.data);
  },
  create: async (data) => {
    const res = await api.post("/courses", data);
    return normalizeCourse(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/courses/${id}`, data);
    return normalizeCourse(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  },
};

export const paymentsApi = {
  getAll: async () => {
    const res = await api.get("/payments");
    return (res.data || []).map(normalizePayment);
  },
  getById: async (id) => {
    const res = await api.get(`/payments/${id}`);
    return normalizePayment(res.data);
  },
  create: async (data) => {
    const res = await api.post("/payments", data);
    return normalizePayment(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/payments/${id}`, data);
    return normalizePayment(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/payments/${id}`);
    return res.data;
  },
};

export const attendanceApi = {
  getAll: async (params) => {
    const res = await api.get("/attendance", { params });
    return (res.data || []).map(normalizeAttendance);
  },
  getById: async (id) => {
    const res = await api.get(`/attendance/${id}`);
    return normalizeAttendance(res.data);
  },
  create: async (data) => {
    const res = await api.post("/attendance", data);
    return normalizeAttendance(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/attendance/${id}`, data);
    return normalizeAttendance(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/attendance/${id}`);
    return res.data;
  },
};

export const examsApi = {
  getAll: async () => {
    const res = await api.get("/exams");
    return (res.data || []).map(normalizeExam);
  },
  getById: async (id) => {
    const res = await api.get(`/exams/${id}`);
    return normalizeExam(res.data);
  },
  create: async (data) => {
    const res = await api.post("/exams", data);
    return normalizeExam(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/exams/${id}`, data);
    return normalizeExam(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/exams/${id}`);
    return res.data;
  },
};

export const homeworkApi = {
  getAll: async () => {
    const res = await api.get("/homework");
    return (res.data || []).map(normalizeHomework);
  },
  getById: async (id) => {
    const res = await api.get(`/homework/${id}`);
    return normalizeHomework(res.data);
  },
  create: async (data) => {
    const res = await api.post("/homework", data);
    return normalizeHomework(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/homework/${id}`, data);
    return normalizeHomework(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/homework/${id}`);
    return res.data;
  },
};

export const certificatesApi = {
  getAll: async () => {
    const res = await api.get("/certificates");
    return (res.data || []).map(normalizeCertificate);
  },
  getById: async (id) => {
    const res = await api.get(`/certificates/${id}`);
    return normalizeCertificate(res.data);
  },
  verify: async (qrCode) => {
    const res = await api.get(`/certificates/verify/${qrCode}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/certificates", data);
    return normalizeCertificate(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/certificates/${id}`, data);
    return normalizeCertificate(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/certificates/${id}`);
    return res.data;
  },
};

export const roomsApi = {
  getAll: async () => {
    const res = await api.get("/rooms");
    return (res.data || []).map(normalizeRoom);
  },
  getOccupancy: async () => {
    const res = await api.get("/rooms/occupancy");
    return res.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/rooms/${id}`);
    return normalizeRoom(res.data);
  },
  create: async (data) => {
    const res = await api.post("/rooms", data);
    return normalizeRoom(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/rooms/${id}`, data);
    return normalizeRoom(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },
};

export const leadsApi = {
  getAll: async () => {
    const res = await api.get("/leads");
    return (res.data || []).map(normalizeLead);
  },
  getById: async (id) => {
    const res = await api.get(`/leads/${id}`);
    return normalizeLead(res.data);
  },
  create: async (data) => {
    const res = await api.post("/leads", data);
    return normalizeLead(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/leads/${id}`, data);
    return normalizeLead(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },
};

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

export const reviewsApi = {
  getAll: async () => {
    const res = await api.get("/reviews");
    return (res.data || []).map(normalizeReview);
  },
  getById: async (id) => {
    const res = await api.get(`/reviews/${id}`);
    return normalizeReview(res.data);
  },
  create: async (data) => {
    const res = await api.post("/reviews", data);
    return normalizeReview(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/reviews/${id}`, data);
    return normalizeReview(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
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

export const trialLessonsApi = {
  getAll: async () => {
    const res = await api.get("/trial-lessons");
    return (res.data || []).map(normalizeTrialLesson);
  },
  getById: async (id) => {
    const res = await api.get(`/trial-lessons/${id}`);
    return normalizeTrialLesson(res.data);
  },
  create: async (data) => {
    const res = await api.post("/trial-lessons", data);
    return normalizeTrialLesson(res.data);
  },
  update: async (id, data) => {
    const res = await api.put(`/trial-lessons/${id}`, data);
    return normalizeTrialLesson(res.data);
  },
  delete: async (id) => {
    const res = await api.delete(`/trial-lessons/${id}`);
    return res.data;
  },
};

export const telegramApi = {
  getStatus: async () => {
    const res = await api.get("/telegram/status");
    return res.data;
  },
  updateConfig: async (config) => {
    const res = await api.put("/telegram/config", config);
    return res.data;
  },
  sendBroadcast: async (message, targetRole) => {
    const res = await api.post("/telegram/broadcast", { message, targetRole });
    return res.data;
  },
  sendTestNotification: async (type, payload = {}) => {
    const res = await api.post("/telegram/test-notification", { type, ...payload });
    return res.data;
  },
};

export default api;
