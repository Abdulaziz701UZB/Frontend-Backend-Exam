import { useState } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_CERTIFICATES,
  STORAGE,
} from "../../data/eduData";
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineQrCode
} from "react-icons/hi2";

const Certificates = () => {
  const { canManageGroups } = useEduAuth();
  const [certs, setCerts] = useState(() =>
    getStoredData(STORAGE.CERTIFICATES, INITIAL_CERTIFICATES),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "Abdulaziz Abdulhayev",
    courseName: "Frontend ReactJS",
    issueDate: new Date().toISOString().split("T")[0],
    qrCode: `QR-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`,
    grade: "A+ (98%)",
  });

  const saveToStorage = (updated) => {
    setCerts(updated);
    setStoredData(STORAGE.CERTIFICATES, updated);
  };

  const openCreateModal = () => {
    setEditingCert(null);
    setFormData({
      studentName: "Abdulaziz Abdulhayev",
      courseName: "Frontend ReactJS",
      issueDate: new Date().toISOString().split("T")[0],
      qrCode: `QR-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`,
      grade: "A+ (98%)",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCert(c);
    setFormData({
      studentName: c.studentName,
      courseName: c.courseName,
      issueDate: c.issueDate,
      qrCode: c.qrCode,
      grade: c.grade,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingCert) {
      const updated = certs.map((c) =>
        c.id === editingCert.id ? { ...c, ...formData } : c,
      );
      saveToStorage(updated);
    } else {
      const newCert = {
        id: `CERT-${Math.floor(8000 + Math.random() * 999)}`,
        ...formData,
      };
      saveToStorage([newCert, ...certs]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Sertifikatni bekor qilmoqchisiz?")) {
      saveToStorage(certs.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="certificates-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineDocumentText style={{ verticalAlign: 'middle', marginRight: 6 }} />
            8. Sertifikatlar va Bitiruvchilar
          </h1>
          <p className="page-subtitle">
            QR-kodli raqamli sertifikatlar reestri va bitiruvchilar
            portfoliolari
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Sertifikat Generatsiya Qilish
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Sertifikat ID</th>
                <th>Bitiruvchi F.I.SH</th>
                <th>Kurs Nomi</th>
                <th>Berilgan Sana</th>
                <th>Natija / Baho</th>
                <th>QR-Kod Verification</th>
                {canManageGroups && <th className="text-center">Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="id-pill">{c.id}</span>
                  </td>
                  <td>
                    <strong className="student-name-text">
                      {c.studentName}
                    </strong>
                  </td>
                  <td>
                    <span className="group-tag-pill">{c.courseName}</span>
                  </td>
                  <td className="text-muted">{c.issueDate}</td>
                  <td>
                    <strong className="text-emerald">{c.grade}</strong>
                  </td>
                  <td>
                    <code className="text-indigo flex items-center gap-1">
                      <HiOutlineQrCode style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {c.qrCode}
                    </code>
                  </td>
                  {canManageGroups && (
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(c)}
                        >
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c.id)}
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
                {editingCert
                  ? "Sertifikatni Tahrirlash"
                  : "Sertifikat Generatsiya Qilish"}
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
                <label className="form-label">Bitiruvchi F.I.SH</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Kurs Nomi</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData({ ...formData, courseName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Natija / Bahosi</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
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
                  {editingCert ? "Saqlash" : "Generatsiya Qilish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
