import { useState } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_EXAMS,
  STORAGE,
} from "../../data/eduData";
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
  const [exams, setExams] = useState(() =>
    getStoredData(STORAGE.EXAMS, INITIAL_EXAMS),
  );
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

  const saveToStorage = (updated) => {
    setExams(updated);
    setStoredData(STORAGE.EXAMS, updated);
  };

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingExam) {
      const updated = exams.map((ex) =>
        ex.id === editingExam.id ? { ...ex, ...formData } : ex,
      );
      saveToStorage(updated);
    } else {
      const newExam = {
        id: `EX-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
      };
      saveToStorage([newExam, ...exams]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Imtihonni o'chirmoqchisiz?")) {
      saveToStorage(exams.filter((ex) => ex.id !== id));
    }
  };

  return (
    <div className="exams-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineTrophy style={{ verticalAlign: 'middle', marginRight: 6 }} />
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
                        <><HiOutlineCheckCircle style={{ verticalAlign: 'middle', marginRight: 3 }} /> Yakunlangan</>
                      ) : (
                        <><HiOutlineClock style={{ verticalAlign: 'middle', marginRight: 3 }} /> Kutilmoqda</>
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
