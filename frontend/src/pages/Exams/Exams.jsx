import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { examsApi } from "../../services/api";
import {
  HiOutlineTrophy,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineCheckCircle,
  HiOutlineClock
} from "react-icons/hi2";

const Exams = () => {
  const { canMarkAttendance } = useEduAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const [formData, setFormData] = useState({
    groupName: "F-12 Guruh (ReactJS)",
    title: "",
    date: new Date().toISOString().split("T")[0],
    totalScore: 100,
    maxPassingScore: 70,
    status: "Upcoming",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await examsApi.getAll();
      setExams(data);
    } catch (err) {
      console.error("Exams load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setFormData({
      groupName: "F-12 Guruh (ReactJS)",
      title: "",
      date: new Date().toISOString().split("T")[0],
      totalScore: 100,
      maxPassingScore: 70,
      status: "Upcoming",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e) => {
    setEditingExam(e);
    setFormData({
      groupName: e.groupName,
      title: e.title,
      date: e.date,
      totalScore: e.totalScore,
      maxPassingScore: e.maxPassingScore,
      status: e.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      group_name: formData.groupName,
      title: formData.title,
      date: formData.date,
      total_score: parseFloat(formData.totalScore || 100),
      max_passing_score: parseFloat(formData.maxPassingScore || 70),
      status: formData.status,
    };

    try {
      if (editingExam) {
        await examsApi.update(editingExam.id, payload);
      } else {
        await examsApi.create({
          id: `EX-${Math.floor(100 + Math.random() * 900)}`,
          ...payload,
        });
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Imtihonni o'chirmoqchisiz?")) {
      try {
        await examsApi.delete(id);
        await loadData();
      } catch (err) {
        alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="exams-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineTrophy className="title-icon-indigo" />
            6. Imtihonlar va Baholash
          </h1>
          <p className="page-subtitle">
            Oraliq va yakuniy imtihonlar jadvallari va baholash natijalari
          </p>
        </div>
        {canMarkAttendance && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Imtihon E'lon Qilish
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Imtihon ID</th>
                <th>Guruh</th>
                <th>Imtihon Nomi</th>
                <th>Sana</th>
                <th>Maksimal Ball</th>
                <th>O'tish Bali</th>
                <th>Holati</th>
                {canMarkAttendance && (
                  <th className="text-center">Harakatlar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {exams.map((ex) => (
                <tr key={ex.id}>
                  <td>
                    <span className="id-pill">{ex.id}</span>
                  </td>
                  <td>
                    <span className="group-tag-pill">{ex.groupName}</span>
                  </td>
                  <td>
                    <strong className="student-name-text">{ex.title}</strong>
                  </td>
                  <td className="text-muted">{ex.date}</td>
                  <td>
                    <strong>{ex.totalScore} ball</strong>
                  </td>
                  <td>
                    <span className="text-emerald">
                      {ex.maxPassingScore} ball
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${ex.status === "Completed" ? "badge-active" : "badge-finished"}`}
                    >
                      {ex.status === "Completed" ? (
                        <><HiOutlineCheckCircle className="inline-icon-xs" /> Yakunlangan</>
                      ) : (
                        <><HiOutlineClock className="inline-icon-xs" /> Kutilmoqda</>
                      )}
                    </span>
                  </td>
                  {canMarkAttendance && (
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(ex)}
                        >
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(ex.id)}
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>
                {editingExam
                  ? "Imtihonni Tahrirlash"
                  : "Yangi Imtihon Yaratish"}
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Imtihon Nomi</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Guruh</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.groupName}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sana</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
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
                  {editingExam ? "Saqlash" : "Imtihon Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
