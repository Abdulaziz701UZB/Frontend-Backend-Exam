import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { trialLessonsApi, teachersApi, coursesApi, roomsApi } from "../../services/api";
import {
  HiOutlineSparkles,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlinePhone,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle
} from "react-icons/hi2";
import { FaUserCheck, FaUserXmark } from "react-icons/fa6";
import "./TrialLessons.css";

const TRIAL_STATUSES = [
  "Kutilyapti",
  "Guruhga yozildi",
  "O'ylanyapti",
  "Kelmay qoldi",
  "Bekor qilindi",
];

const TrialLessons = () => {
  const { canManageStudents } = useEduAuth();

  const [trialLessons, setTrialLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentTrialId, setCurrentTrialId] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    phone: "+998 90 ",
    teacherName: "",
    courseName: "",
    date: new Date().toISOString().split("T")[0],
    time: "14:00 - 15:30",
    room: "201-xona",
    status: "Kutilyapti",
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [trData, tData, cData, rData] = await Promise.all([
        trialLessonsApi.getAll(),
        teachersApi.getAll(),
        coursesApi.getAll(),
        roomsApi.getAll(),
      ]);
      setTrialLessons(trData);
      setTeachers(tData);
      setCourses(cData);
      setRooms(rData);
    } catch (err) {
      console.error("Trial lessons load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      studentName: "",
      phone: "+998 90 ",
      teacherName: teachers[0]?.name || "Abdulaziz Abdulhayev",
      courseName: courses[0]?.name || "Frontend ReactJS",
      date: new Date().toISOString().split("T")[0],
      time: "14:00 - 15:30",
      room: rooms[0]?.name || "201-xona (Kompyuter zali)",
      status: "Kutilyapti",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tr) => {
    setModalMode("edit");
    setCurrentTrialId(tr.id);
    setFormData({
      studentName: tr.studentName,
      phone: tr.phone,
      teacherName: tr.teacherName,
      courseName: tr.courseName,
      date: tr.date,
      time: tr.time,
      room: tr.room || "201-xona",
      status: tr.status,
      notes: tr.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveTrial = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student_name: formData.studentName,
        phone: formData.phone,
        teacher_name: formData.teacherName,
        course_name: formData.courseName,
        date: formData.date,
        time: formData.time,
        room: formData.room,
        status: formData.status,
        notes: formData.notes,
      };

      if (modalMode === "create") {
        await trialLessonsApi.create(payload);
      } else {
        await trialLessonsApi.update(currentTrialId, payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTrial = async (id) => {
    if (!window.confirm("Rostdan ham ushbu sinov darsini o'chirmoqchimisiz?")) return;
    try {
      await trialLessonsApi.delete(id);
      loadData();
    } catch (err) {
      alert("O'chirishda xatolik: " + err.message);
    }
  };

  const filteredTrials = trialLessons.filter((tr) => {
    const matchesSearch =
      tr.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || tr.status === filterStatus;

    const matchesCourse =
      filterCourse === "all" || tr.courseName === filterCourse;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const totalTrials = trialLessons.length;
  const enrolledCount = trialLessons.filter((t) => t.status === "Guruhga yozildi").length;
  const pendingCount = trialLessons.filter((t) => t.status === "Kutilyapti").length;
  const noShowCount = trialLessons.filter((t) => t.status === "Kelmay qoldi").length;

  const conversionRate = totalTrials
    ? Math.round((enrolledCount / totalTrials) * 100)
    : 0;

  const getStatusBadgeClass = (st) => {
    switch (st) {
      case "Guruhga yozildi":
        return "status-enrolled";
      case "Kutilyapti":
        return "status-pending";
      case "O'ylanyapti":
        return "status-thinking";
      case "Kelmay qoldi":
        return "status-noshow";
      default:
        return "status-canceled";
    }
  };

  return (
    <div className="trial-lessons-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineSparkles style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Bepul Sinov Darslari va Konvertatsiya (Trial Lessons)
          </h1>
          <p className="page-subtitle">
            Yangi qiziquvchilar uchun 1 martalik bepul ochiq sinov darslari grafigi va ularning guruhlarga yozilish konvertatsiyasi
          </p>
        </div>

        <button className="btn btn-primary btn-lg" onClick={openCreateModal}>
          <HiOutlinePlus /> Sinov Darsi Rejalashtirish
        </button>
      </div>

      <div className="trial-stats-grid">
        <div className="trial-stat-card">
          <div className="trial-icon-wrap icon-blue">
            <HiOutlineSparkles />
          </div>
          <div className="trial-stat-content">
            <span>Jami Sinov Darslari</span>
            <strong>{totalTrials} ta</strong>
          </div>
        </div>

        <div className="trial-stat-card">
          <div className="trial-icon-wrap icon-green">
            <FaUserCheck />
          </div>
          <div className="trial-stat-content">
            <span>Guruhga Yozildi (To'lov qildi)</span>
            <strong>{enrolledCount} ta ({conversionRate}%)</strong>
          </div>
        </div>

        <div className="trial-stat-card">
          <div className="trial-icon-wrap icon-amber">
            <HiOutlineClock />
          </div>
          <div className="trial-stat-content">
            <span>Dars Kutilmoqda</span>
            <strong>{pendingCount} ta</strong>
          </div>
        </div>

        <div className="trial-stat-card">
          <div className="trial-icon-wrap icon-red">
            <FaUserXmark />
          </div>
          <div className="trial-stat-content">
            <span>Kelmay Qolganlar</span>
            <strong>{noShowCount} ta</strong>
          </div>
        </div>
      </div>

      <div className="card filter-card">
        <div className="grid-form-3">
          <div className="form-group mb-0">
            <label className="form-label">Qidiruv:</label>
            <div className="search-input-wrap">
              <input
                type="text"
                className="form-input"
                placeholder="Qiziquvchi ismi yoki telefon raqami..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Kurs Bo'yicha:</label>
            <select
              className="form-select"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="all">Barcha Kurslar</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Sinov Natijasi (Status):</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Barcha Statuslar</option>
              {TRIAL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Qiziquvchi F.I.SH</th>
                <th>Telefon</th>
                <th>Kurs</th>
                <th>O'qituvchi</th>
                <th>Sana & Vaqt</th>
                <th>Xona</th>
                <th>Natija (Status)</th>
                <th>Qaydlar / Izoh</th>
                <th className="text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrials.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-muted">
                    Sinov darslari topilmadi
                  </td>
                </tr>
              ) : (
                filteredTrials.map((tr, idx) => (
                  <tr key={tr.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{tr.studentName}</strong>
                    </td>
                    <td>
                      <span className="text-muted text-sm flex items-center gap-1">
                        <HiOutlinePhone /> {tr.phone}
                      </span>
                    </td>
                    <td>
                      <strong>{tr.courseName}</strong>
                    </td>
                    <td>{tr.teacherName}</td>
                    <td>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 font-semibold">
                          <HiOutlineCalendarDays /> {tr.date}
                        </div>
                        <div className="text-muted text-xs flex items-center gap-1">
                          <HiOutlineClock /> {tr.time}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs flex items-center gap-1">
                        <HiOutlineBuildingOffice2 /> {tr.room}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(tr.status)}`}>
                        {tr.status}
                      </span>
                    </td>
                    <td>
                      {tr.notes ? (
                        <div className="trial-notes-box">{tr.notes}</div>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(tr)}
                          title="Tahrirlash / Natijani o'zgartirish"
                        >
                          <HiOutlinePencilSquare />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTrial(tr.id)}
                          title="O'chirish"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <HiOutlineSparkles style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {modalMode === "create" ? "Yangi Sinov Darsi Rejalashtirish" : "Sinov Darsini Tahrirlash"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <HiOutlineXMark />
              </button>
            </div>

            <form onSubmit={handleSaveTrial}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Qiziquvchi F.I.SH:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="masalan: Otabek Mahmudov"
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon Raqami:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Qiziqayotgan Kurs:</label>
                  <select
                    className="form-select"
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Biriktirilgan O'qituvchi:</label>
                  <select
                    className="form-select"
                    value={formData.teacherName}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherName: e.target.value })
                    }
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Dars Sanasi:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Vaqti:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="14:00 - 15:30"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Xona:</label>
                  <select
                    className="form-select"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Natija (Status):</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    {TRIAL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Izoh / Suhbat Qaydlari:</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Qiziquvchining bilim darajasi, talablari yoki darsdan keyingi xulosalari..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                ></textarea>
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
                  <HiOutlineCheckCircle /> Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialLessons;
