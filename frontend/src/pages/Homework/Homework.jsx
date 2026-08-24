import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { homeworkApi } from "../../services/api";
import {
  HiOutlineBookOpen,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineClock
} from "react-icons/hi2";

const Homework = () => {
  const { canMarkAttendance } = useEduAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHw, setEditingHw] = useState(null);

  const [formData, setFormData] = useState({
    groupName: "F-12 Guruh (ReactJS)",
    title: "",
    deadline: new Date().toISOString().split("T")[0],
    totalSubmitted: 0,
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await homeworkApi.getAll();
      setHomework(data);
    } catch (err) {
      console.error("Homework load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingHw(null);
    setFormData({
      groupName: "F-12 Guruh (ReactJS)",
      title: "",
      deadline: new Date().toISOString().split("T")[0],
      totalSubmitted: 0,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHw(h);
    setFormData({
      groupName: h.groupName,
      title: h.title,
      deadline: h.deadline,
      totalSubmitted: h.totalSubmitted,
      status: h.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      group_name: formData.groupName,
      title: formData.title,
      deadline: formData.deadline,
      total_submitted: parseInt(formData.totalSubmitted || 0),
      status: formData.status,
    };

    try {
      if (editingHw) {
        await homeworkApi.update(editingHw.id, payload);
      } else {
        await homeworkApi.create({
          id: `HW-${Math.floor(10 + Math.random() * 90)}`,
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
    if (window.confirm("Uyga vazifani o'chirmoqchisiz?")) {
      try {
        await homeworkApi.delete(id);
        await loadData();
      } catch (err) {
        alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="homework-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineBookOpen className="title-icon-indigo" />
            7. Uyga Vazifalar va Topshiriqlar
          </h1>
          <p className="page-subtitle">
            O'quvchilar uchun topshiriqlar, muddatlar va javoblarni qabul qilish
          </p>
        </div>
        {canMarkAttendance && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Vazifa Biriktirish
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Vazifa ID</th>
                <th>Guruh</th>
                <th>Vazifa Sarlavhasi</th>
                <th>Topshirish Muddati</th>
                <th>Topshirganlar Soni</th>
                <th>Holati</th>
                {canMarkAttendance && (
                  <th className="text-center">Harakatlar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {homework.map((h) => (
                <tr key={h.id}>
                  <td>
                    <span className="id-pill">{h.id}</span>
                  </td>
                  <td>
                    <span className="group-tag-pill">{h.groupName}</span>
                  </td>
                  <td>
                    <strong className="student-name-text">{h.title}</strong>
                  </td>
                  <td className="text-danger font-bold">
                    <HiOutlineClock className="inline-icon-xs" />
                    {h.deadline}
                  </td>
                  <td>
                    <strong className="text-emerald">
                      {h.totalSubmitted} ta o'quvchi
                    </strong>
                  </td>
                  <td>
                    <span className="status-badge badge-active">Faol</span>
                  </td>
                  {canMarkAttendance && (
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(h)}
                        >
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(h.id)}
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
                {editingHw ? "Vazifani Tahrirlash" : "Yangi Vazifa Biriktirish"}
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
                <label className="form-label">Vazifa Sarlavhasi</label>
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
                  <label className="form-label">Topshirish Muddati</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
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
                  {editingHw ? "Saqlash" : "Vazifani Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;
