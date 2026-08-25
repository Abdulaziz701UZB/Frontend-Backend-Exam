import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { teachersApi, groupsApi, studentsApi } from "../../services/api";
import { format9DigitId, formatSpaced9DigitId } from "../../utils/idFormatter";
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
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentCheck,
  HiOutlineShare
} from "react-icons/hi2";
import { FaChalkboardUser, FaUserGraduate } from "react-icons/fa6";
import "./Teachers.css";

const Teachers = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();
  const { id: urlParamId } = useParams();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState(null);

  const format9Digits = (input) => {
    let digits = (input || "").replace(/\D/g, "");
    if (digits.startsWith("998")) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);
    let res = "";
    if (digits.length > 0) res += digits.slice(0, 2);
    if (digits.length > 2) res += " " + digits.slice(2, 5);
    if (digits.length > 5) res += " " + digits.slice(5, 7);
    if (digits.length > 7) res += " " + digits.slice(7, 9);
    return res;
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
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

  useEffect(() => {
    if (urlParamId && teachers.length > 0) {
      const match = teachers.find(
        (t) =>
          String(t.id) === String(urlParamId) ||
          format9DigitId(t.id, "teacher") === String(urlParamId)
      );
      if (match) {
        setSelectedTeacherDetail(match);
      }
    }
  }, [urlParamId, teachers]);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      phone: "",
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
      phone: format9Digits(teacher.phone),
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
    navigate(`/teachers/${format9DigitId(teacher.id, "teacher")}`);
  };

  const closeDetailModal = () => {
    setSelectedTeacherDetail(null);
    navigate("/teachers");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleCopyTeacherLink = (teacherId) => {
    const formattedId = format9DigitId(teacherId, "teacher");
    const fullUrl = `${window.location.origin}/teachers/${formattedId}`;
    navigator.clipboard?.writeText(fullUrl);
    toast.success(`Ustoz profili havolasi nusxalandi: #${formattedId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      phone: formData.phone ? `+998 ${formData.phone.trim()}` : "",
    };
    try {
      if (editingTeacher) {
        await teachersApi.update(editingTeacher.id, payload);
        toast.success("O'qituvchi ma'lumotlari muvaffaqiyatli yangilandi!");
      } else {
        await teachersApi.create(payload);
        toast.success("Yangi o'qituvchi muvaffaqiyatli qo'shildi!");
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error("Save teacher error:", err.message);
      toast.error(
        "Saqlashda xatolik: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleDelete = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (
      window.confirm(
        `Haqiqatan ham "${name}" o'qituvchisini tizimdan o'chirmoqchimisiz?`,
      )
    ) {
      try {
        await teachersApi.delete(id);
        toast.success(`"${name}" o'qituvchisi tizimdan o'chirildi!`);
        if (selectedTeacherDetail?.id === id) {
          closeDetailModal();
        }
        loadData();
      } catch (err) {
        console.error("Delete teacher error:", err.message);
        toast.error("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
  };

  const filtered = teachers.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    const formattedId = format9DigitId(t.id, "teacher");
    return (
      (t.name || "").toLowerCase().includes(term) ||
      (t.subject || "").toLowerCase().includes(term) ||
      (t.phone || "").includes(term) ||
      formattedId.includes(term)
    );
  });

  const getTeacherAnalytics = (teacher) => {
    const teacherGroups = groups.filter(
      (g) =>
        (g.teacherName || "").toLowerCase().includes((teacher.name || "").toLowerCase()) ||
        (teacher.name || "").toLowerCase().includes((g.teacherName || "").toLowerCase())
    );

    let totalStudentsTaught = 0;
    let totalRevenueGenerated = 0;

    teacherGroups.forEach((g) => {
      const gStudents = students.filter((s) => s.groupId === g.id);
      totalStudentsTaught += gStudents.length;
      totalRevenueGenerated += gStudents.length * (g.price || 850000);
    });

    const netCenterProfit = totalRevenueGenerated - (teacher.salary || 10000000);

    const timeSlots = [
      "06:00 - 08:00",
      "08:00 - 10:00",
      "10:00 - 12:00",
      "14:00 - 16:00",
      "16:00 - 18:00",
      "18:00 - 20:00",
      "20:00 - 22:00",
    ];

    const scheduleMatrix = timeSlots.map((slot) => {
      const oddDayGroup = teacherGroups.find(
        (g) =>
          g.scheduleTime === slot &&
          (g.scheduleDays || "").includes("Dush"),
      );
      const evenDayGroup = teacherGroups.find(
        (g) =>
          g.scheduleTime === slot &&
          (g.scheduleDays || "").includes("Sesh"),
      );
      return {
        timeSlot: slot,
        oddDayGroup: oddDayGroup
          ? `${oddDayGroup.name} (${oddDayGroup.room})`
          : "Bo'sh",
        evenDayGroup: evenDayGroup
          ? `${evenDayGroup.name} (${evenDayGroup.room})`
          : "Bo'sh",
      };
    });

    return {
      teacherGroups,
      totalStudentsTaught,
      totalRevenueGenerated,
      netCenterProfit,
      scheduleMatrix,
    };
  };

  const teacherStats = selectedTeacherDetail ? getTeacherAnalytics(selectedTeacherDetail) : null;

  return (
    <div className="teachers-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaChalkboardUser className="title-icon-indigo" />
            O'qituvchilar va Xodimlar Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha o'qituvchilari, 9 xonali identifikatorlar (#300000101), maosh kalkulyatori va shaxsiy dars jadvallari
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
            placeholder="O'qituvchi F.I.SH yoki fani bo'yicha qidirish"
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
                <th>9 Xonali ID</th>
                <th>O'qituvchi F.I.SH</th>
                <th>Mutaxassisligi / Fani</th>
                <th>Telefon</th>
                <th>Tajribasi</th>
                <th>Oylik Maosh Stavkasi</th>
                <th className="text-center">Profil Ko'rish</th>
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
                    <span className="id-pill">#{format9DigitId(t.id, "teacher")}</span>
                  </td>
                  <td>
                    <div className="student-name-cell">
                      <span className="avatar-circle"><FaChalkboardUser /></span>
                      <div>
                        <strong className="student-name-text">{t.name}</strong>
                        <span className="student-status-tag">/teachers/{format9DigitId(t.id, "teacher")}</span>
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
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => openDetailModal(t, e)}
                    >
                      <FaChalkboardUser /> Profil Ko'rish
                    </button>
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
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="modal-content card teacher-detail-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  <FaChalkboardUser className="title-icon-indigo" />
                  {selectedTeacherDetail.name} — O'qituvchi Profili & KPI
                </h2>
                <p className="text-muted text-sm m-0 mt-1">
                  O'qituvchi 9 Xonali ID: <strong>#{format9DigitId(selectedTeacherDetail.id, "teacher")}</strong> | Fani: <strong>{selectedTeacherDetail.subject}</strong>
                </p>
              </div>
              <button
                className="close-modal-btn"
                onClick={closeDetailModal}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <div className="teacher-dossier-hero">
              <div className="teacher-hero-left">
                <div className="teacher-hero-avatar">
                  <FaChalkboardUser />
                </div>
                <div>
                  <h3 className="teacher-hero-title">{selectedTeacherDetail.name}</h3>
                  <div className="teacher-hero-meta">
                    <span className="id-pill">#{format9DigitId(selectedTeacherDetail.id, "teacher")}</span>
                    <span><HiOutlinePhone className="inline-icon-xs" /> {selectedTeacherDetail.phone}</span>
                    <span><HiOutlineAcademicCap className="inline-icon-xs" /> {selectedTeacherDetail.subject}</span>
                    <span>Tajriba: <strong>{selectedTeacherDetail.experience}</strong></span>
                  </div>
                </div>
              </div>

              <div className="share-link-box">
                <span>Havola: /teachers/{format9DigitId(selectedTeacherDetail.id, "teacher")}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleCopyTeacherLink(selectedTeacherDetail.id)}
                >
                  <HiOutlineShare /> Nusxalash
                </button>
              </div>
            </div>

            <div className="teacher-kpi-grid-4">
              <div className="teacher-kpi-card">
                <div className="kpi-icon-wrap kpi-purple">
                  <HiOutlineBanknotes />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Oylik Maoshi</span>
                  <strong className="kpi-value">{formatMoney(selectedTeacherDetail.salary)}</strong>
                  <span className="kpi-subtext">Belgilangan stavka</span>
                </div>
              </div>

              <div className="teacher-kpi-card">
                <div className="kpi-icon-wrap kpi-green">
                  <HiOutlineAcademicCap />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Faol Guruhlari</span>
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
              O'qituvchi Boshqarayotgan Faol Guruhlar
            </h4>

            <div className="teacher-groups-list">
              {teacherStats.teacherGroups.length === 0 ? (
                <p className="text-muted">Hozirda biriktirilgan faol guruhlar mavjud emas</p>
              ) : (
                teacherStats.teacherGroups.map((g) => {
                  const gStudentCount = students.filter((s) => s.groupId === g.id).length;
                  return (
                    <div key={g.id} className="teacher-group-item">
                      <strong className="teacher-group-title">
                        #{format9DigitId(g.id, "group")} — {g.name}
                      </strong>
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
              Haftalik Dars Jadvali Matritsasi (06:00 - 22:00)
            </h4>

            <div className="teacher-schedule-matrix-wrap">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Vaqt Oralig'i</th>
                      <th>Dushanba - Chorshanba - Juma</th>
                      <th>Seshanba - Payshanba - Shanba</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherStats.scheduleMatrix.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{item.timeSlot}</strong>
                        </td>
                        <td>
                          <span
                            className={`schedule-slot-pill ${
                              item.oddDayGroup !== "Bo'sh" ? "occupied" : "empty"
                            }`}
                          >
                            {item.oddDayGroup}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`schedule-slot-pill ${
                              item.evenDayGroup !== "Bo'sh" ? "occupied" : "empty"
                            }`}
                          >
                            {item.evenDayGroup}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content card admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <FaChalkboardUser className="title-icon-indigo" />
                {editingTeacher ? "O'qituvchi Ma'lumotlarini Tahrirlash" : "Yangi O'qituvchi Qo'shish"}
              </h2>
              <button
                className="close-modal-btn"
                onClick={closeModal}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label">O'qituvchi F.I.SH:</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="O'qituvchi to'liq ism-familiyasi"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Raqami:</label>
                <div className="phone-input-group">
                  <span className="phone-prefix-badge">+998</span>
                  <input
                    type="tel"
                    required
                    className="phone-input-field"
                    placeholder="90 123 45 67"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: format9Digits(e.target.value) })
                    }
                    maxLength={12}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mutaxassisligi / Asosiy Fani:</label>
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

              <div className="form-group">
                <label className="form-label">Tajribasi:</label>
                <select
                  className="form-select"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                >
                  {experienceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                    setFormData({
                      ...formData,
                      salary: parseFloat(e.target.value) || 0,
                    })
                  }
                >
                  {salaryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Bekor Qilish
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
