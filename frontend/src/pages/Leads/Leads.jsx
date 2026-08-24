import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { leadsApi } from "../../services/api";
import {
  HiOutlinePhoneArrowUpRight,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone
} from "react-icons/hi2";

const Leads = () => {
  const { canManageStudents } = useEduAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998 90 599 06 00",
    interestedCourse: "Frontend ReactJS",
    source: "Instagram Ads",
    status: "Yangi",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (err) {
      console.error("Leads load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({
      name: "",
      phone: "+998 90 599 06 00",
      interestedCourse: "Frontend ReactJS",
      source: "Instagram Ads",
      status: "Yangi",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (l) => {
    setEditingLead(l);
    setFormData({
      name: l.name,
      phone: l.phone,
      interestedCourse: l.interestedCourse,
      source: l.source,
      status: l.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      phone: formData.phone,
      interested_course: formData.interestedCourse,
      source: formData.source,
      status: formData.status,
    };

    try {
      if (editingLead) {
        await leadsApi.update(editingLead.id, payload);
      } else {
        await leadsApi.create({
          id: `L-${Math.floor(500 + Math.random() * 900)}`,
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
    if (window.confirm("Lidni o'chirmoqchisiz?")) {
      try {
        await leadsApi.delete(id);
        await loadData();
      } catch (err) {
        alert("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="leads-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlinePhoneArrowUpRight className="title-icon-indigo" />
            Lidlar va Yangi Arizalar Voronkasi
          </h1>
          <p className="page-subtitle">
            Ijtimoiy tarmoqlar va Telegram-botdan tushgan yangi ariza/lidlar
            voronkasi
          </p>
        </div>
        {canManageStudents && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Lid Qo'shish
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Lid ID</th>
                <th>Murojaatchi F.I.SH</th>
                <th>Telefon</th>
                <th>Qiziqqan Kursi</th>
                <th>Manbasi (Kanal)</th>
                <th>Voronka Holati</th>
                {canManageStudents && (
                  <th className="text-center">Harakatlar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span className="id-pill">{l.id}</span>
                  </td>
                  <td>
                    <strong className="student-name-text">{l.name}</strong>
                  </td>
                  <td>
                    <HiOutlinePhone className="inline-icon-xs" />
                    {l.phone}
                  </td>
                  <td>
                    <span className="group-tag-pill">{l.interestedCourse}</span>
                  </td>
                  <td className="text-muted">{l.source}</td>
                  <td>
                    <span className="status-pill pill-paid">{l.status}</span>
                  </td>
                  {canManageStudents && (
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(l)}
                        >
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(l.id)}
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
              <h2>{editingLead ? "Lidni Tahrirlash" : "Yangi Lid Kiritish"}</h2>
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
                <label className="form-label">Murojaatchi F.I.SH</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Telefon Raqami</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qiziqqan Kursi</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.interestedCourse}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interestedCourse: e.target.value,
                      })
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
                  {editingLead ? "Saqlash" : "Lidni Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
