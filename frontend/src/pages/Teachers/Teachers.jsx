import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { teachersApi, groupsApi, studentsApi } from "../../services/api";
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
  HiOutlineChartBar,
  HiOutlineMapPin,
  HiOutlineUserGroup
} from "react-icons/hi2";
import { FaChalkboardUser } from "react-icons/fa6";
import "./Teachers.css";

const Teachers = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();

  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998 90 599 06 00",
    subject: "Frontend ReactJS",
    salary: 10000000,
    experience: "3 yil",
    avatar: "teacher",
  });

  const subjectOptions = [
    "Frontend ReactJS",
    "Backend NodeJS / Express",
    "Python Backend (Django)",
    "Grafik Dizayn & UI/UX",
    "Ingliz tili (IELTS / CEFR)",
    "Matematika va SAT",
    "Mobil Dasturlash (Flutter)",
    "Cyber Security (Kiberxavfsizlik)",
    "Buxgalteriya va 1C",
    "Robototexnika va IT Kids",
    "Rus tili (So'zlashuv)",
    "Arab tili va Tajvid",
  ];

  const experienceOptions = [
    "1 yilgacha (Boshlang'ich)",
    "1 - 2 yil",
    "2 - 3 yil",
    "3 yil",
    "4 - 5 yil (Tajribali)",
    "5 - 7 yil",
    "7+ yil (Katta o'qituvchi / Lead)",
  ];

  const salaryOptions = [
    { value: 4000000, label: "4,000,000 so'm (Boshlang'ich)" },
    { value: 5000000, label: "5,000,000 so'm" },
    { value: 6000000, label: "6,000,000 so'm" },
    { value: 8000000, label: "8,000,000 so'm" },
    { value: 10000000, label: "10,000,000 so'm (Standart stavka)" },
    { value: 12000000, label: "12,000,000 so'm" },
    { value: 15000000, label: "15,000,000 so'm (Katta o'qituvchi)" },
    { value: 18000000, label: "18,000,000 so'm" },
    { value: 20000000, label: "20,000,000 so'm (Lead / Top ustoz)" },
    { value: 25000000, label: "25,000,000 so'm (Kafedra mudiri)" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersData, groupsData, studentsData] = await Promise.all([
        teachersApi.getAll(),
        groupsApi.getAll().catch(() => []),
        studentsApi.getAll().catch(() => []),
      ]);
      setTeachers(teachersData);
      setGroups(groupsData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Teachers load error:", err.message);
      toast.error("O'qituvchilar ro'yxatini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      phone: "+998 90 599 06 00",
      subject: "Frontend ReactJS",
      salary: 10000000,
      experience: "3 yil",
      avatar: "teacher",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher, e) => {
    if (e) e.stopPropagation();
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      phone: teacher.phone,
      subject: teacher.subject,
      salary: teacher.salary || 10000000,
      experience: teacher.experience || "3 yil",
      avatar: teacher.avatar || "teacher",
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (teacher, e) => {
    if (e) e.stopPropagation();
    setSelectedTeacherDetail(teacher);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      phone: formData.phone,
      subject: formData.subject,
      salary: parseFloat(formData.salary || 0),
      experience: formData.experience,
      avatar: formData.avatar,
    };

    try {
      if (editingTeacher) {
        await teachersApi.update(editingTeacher.id, payload);
        toast.success(`"${formData.name}" ma'lumotlari yangilandi!`);
      } else {
        await teachersApi.create(payload);
        toast.success(`Yangi o'qituvchi "${formData.name}" qo'shildi!`);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Haqiqatan ham "${name}" o'qituvchisini o'chirmoqchisiz?`)) {
      try {
        await teachersApi.delete(id);
        toast.success(`"${name}" muvaffaqiyatli o'chirildi!`);
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filtered = teachers.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    new Intl.NumberFormat("uz-UZ").format(val || 0) + " so'm";

  const getTeacherAnalytics = (teacher) => {
    if (!teacher) return null;
    const teacherGroups = groups.filter((g) => parseInt(g.teacherId) === teacher.id && g.status === "Active");
    const totalStudentsTaught = teacherGroups.reduce((acc, g) => acc + students.filter((s) => s.groupId === g.id).length, 0);
    const totalRevenueGenerated = teacherGroups.reduce((acc, g) => {
      const gStudents = students.filter((s) => s.groupId === g.id).length;
      return acc + (gStudents * (g.monthlyFee || 0));
    }, 0);
    const netCenterProfit = totalRevenueGenerated - (teacher.salary || 0);

    return {
      teacherGroups,
      totalStudentsTaught,
      totalRevenueGenerated,
      netCenterProfit,
    };
  };

  const teacherStats = selectedTeacherDetail ? getTeacherAnalytics(selectedTeacherDetail) : null;

  return (
    <div className="teachers-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaChalkboardUser className="title-icon-indigo" />
            5. O'qituvchilar va Xodimlar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha o'qituvchilari, mutaxassisliklari, maosh kalkulyatori va shaxsiy dars jadvallari
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi O'qituvchi Qo'shish
          </button>
        )}
      </div>

      <div className="card filter-card mb-6">
        <div className="search-input-wrap">
          <span className="search-icon"><HiMagnifyingGlass /></span>
          <input
            type="text"
            className="form-input search-field"
            placeholder="O'qituvchi ismi yoki fani bo'yicha qidiruv..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>O'qituvchi F.I.SH (Tahlil uchun bosing)</th>
                <th>Mutaxassisligi / Fani</th>
                <th>Telefon</th>
                <th>Tajribasi</th>
                <th>Oylik Maosh Stavkasi</th>
                {canManageGroups && <th className="text-center">Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="teacher-row-clickable"
                  onClick={() => openDetailModal(t)}
                >
                  <td>
                    <span className="id-pill">#{t.id}</span>
                  </td>
                  <td>
                    <div className="student-name-cell">
                      <span className="avatar-circle"><FaChalkboardUser /></span>
                      <div>
                        <strong className="student-name-text">{t.name}</strong>
                        <span className="student-status-tag">KPI & Dars jadvali</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="group-tag-pill">{t.subject}</span>
                  </td>
                  <td>
                    <HiOutlinePhone className="inline-icon-xs" />
                    {t.phone}
                  </td>
                  <td>{t.experience}</td>
                  <td>
                    <strong className="text-emerald">
                      {formatMoney(t.salary)}
                    </strong>
                  </td>
                  {canManageGroups && (
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => openEditModal(t, e)}
                        >
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => handleDelete(t.id, t.name, e)}
                        >
                          <HiOutlineTrash /> O'chirish
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTeacherDetail && teacherStats && (
        <div className="modal-overlay" onClick={() => setSelectedTeacherDetail(null)}>
          <div
            className="modal-content card teacher-detail-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  <FaChalkboardUser className="title-icon-indigo" />
                  {selectedTeacherDetail.name} — O'qituvchi KPI & Jadvallari
                </h2>
                <p className="text-muted text-sm m-0 mt-1">
                  Mutaxassislik: <strong>{selectedTeacherDetail.subject}</strong> | Tajriba: <strong>{selectedTeacherDetail.experience}</strong>
                </p>
              </div>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedTeacherDetail(null)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <div className="teacher-kpi-grid-4">
              <div className="teacher-kpi-card">
                <div className="kpi-icon-wrap kpi-purple">
                  <HiOutlineBanknotes />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">13. Oylik Maoshi</span>
                  <strong className="kpi-value">{formatMoney(selectedTeacherDetail.salary)}</strong>
                  <span className="kpi-subtext">Belgilangan oylik stavka</span>
                </div>
              </div>

              <div className="teacher-kpi-card">
                <div className="kpi-icon-wrap kpi-green">
                  <HiOutlineAcademicCap />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">14. Faol Guruhlari</span>
                  <strong className="kpi-value">{teacherStats.teacherGroups.length} ta guruh</strong>
                  <span className="kpi-subtext">Jami {teacherStats.totalStudentsTaught} nafar o'quvchi</span>
                </div>
              </div>

              <div className="teacher-kpi-card">
                <div className="kpi-icon-wrap kpi-indigo">
                  <HiOutlineArrowTrendingUp />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Guruhlar Tushumi</span>
                  <strong className="kpi-value">{formatMoney(teacherStats.totalRevenueGenerated)}</strong>
                  <span className="kpi-subtext">Oyiga kutilayotgan summa</span>
                </div>
              </div>

              <div className="teacher-kpi-card">
                <div className="kpi-icon-wrap kpi-amber">
                  <HiOutlineChartBar />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Markazga Sof Foyda</span>
                  <strong className="kpi-value text-emerald">{formatMoney(teacherStats.netCenterProfit)}</strong>
                  <span className="kpi-subtext">Oylik maoshdan keyin</span>
                </div>
              </div>
            </div>

            <h4 className="section-title text-sm mb-3">
              <HiOutlineAcademicCap className="inline-icon-xs text-indigo" />
              14. O'qituvchi Boshqarayotgan Faol Guruhlar
            </h4>

            <div className="teacher-groups-list">
              {teacherStats.teacherGroups.length === 0 ? (
                <p className="text-muted">Hozirda biriktirilgan faol guruhlar mavjud emas</p>
              ) : (
                teacherStats.teacherGroups.map((g) => {
                  const gStudentCount = students.filter((s) => s.groupId === g.id).length;
                  return (
                    <div key={g.id} className="teacher-group-item">
                      <strong className="teacher-group-title">{g.name}</strong>
                      <span className="text-muted text-xs">{g.courseName}</span>
                      <span className="text-indigo text-xs font-bold">
                        <HiOutlineClock className="inline-icon-xs" /> {g.scheduleDays} • {g.scheduleTime}
                      </span>
                      <span className="text-xs">
                        <HiOutlineMapPin className="inline-icon-xs" /> {g.room}
                      </span>
                      <span className="group-tag-pill mt-1">
                        <HiOutlineUserGroup className="inline-icon-xs" /> {gStudentCount} nafar o'quvchi
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <h4 className="section-title text-sm mb-3">
              <HiOutlineCalendarDays className="inline-icon-xs text-indigo" />
              17. O'qituvchining Haftalik Dars Jadvali Matritsasi
            </h4>

            <div className="teacher-schedule-matrix-wrap">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Dars Vaqti</th>
                      <th>Dushanba - Chorshanba - Juma</th>
                      <th>Seshanba - Payshanba - Shanba</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "06:00 - 08:00",
                      "08:00 - 10:00",
                      "10:00 - 12:00",
                      "14:00 - 16:00",
                      "16:00 - 18:00",
                      "18:00 - 20:00",
                      "20:00 - 22:00"
                    ].map((timeSlot) => {
                      const toqGroup = teacherStats.teacherGroups.find(
                        (g) => (g.scheduleDays || "").includes("Dushanba") && g.scheduleTime === timeSlot
                      );
                      const juftGroup = teacherStats.teacherGroups.find(
                        (g) => (g.scheduleDays || "").includes("Seshanba") && g.scheduleTime === timeSlot
                      );

                      return (
                        <tr key={timeSlot}>
                          <td><strong>{timeSlot}</strong></td>
                          <td>
                            {toqGroup ? (
                              <span className="status-pill pill-paid">
                                {toqGroup.name} ({toqGroup.room})
                              </span>
                            ) : (
                              <span className="text-muted text-xs">Bo'sh</span>
                            )}
                          </td>
                          <td>
                            {juftGroup ? (
                              <span className="status-pill pill-paid">
                                {juftGroup.name} ({juftGroup.room})
                              </span>
                            ) : (
                              <span className="text-muted text-xs">Bo'sh</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions-flex">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedTeacherDetail(null)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingTeacher
                  ? "O'qituvchi Ma'lumotlarini Tahrirlash"
                  : "Yangi O'qituvchi Qo'shish"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">O'qituvchi F.I.SH:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="masalan: Abdulbosit Abdumannonov"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Telefon Raqami:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mutaxassisligi / Fani:</label>
                  <select
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  >
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">O'qituvchilik Tajribasi:</label>
                  <select
                    className="form-select"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  >
                    {experienceOptions.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Oylik Maosh Stavkasi:</label>
                  <select
                    className="form-select"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  >
                    {salaryOptions.map((sal) => (
                      <option key={sal.value} value={sal.value}>
                        {sal.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeacher ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
