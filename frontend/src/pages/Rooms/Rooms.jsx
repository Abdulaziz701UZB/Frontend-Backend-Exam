import { useState } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_ROOMS,
  STORAGE,
} from "../../data/eduData";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineComputerDesktop
} from "react-icons/hi2";

const Rooms = () => {
  const { canManageGroups } = useEduAuth();
  const [rooms, setRooms] = useState(() =>
    getStoredData(STORAGE.ROOMS, INITIAL_ROOMS),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: "301-xona (Yangi Lab)",
    capacity: 20,
    computersCount: 20,
    projector: "Mavjud",
    status: "Active",
  });

  const saveToStorage = (updated) => {
    setRooms(updated);
    setStoredData(STORAGE.ROOMS, updated);
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: "301-xona (Yangi Lab)",
      capacity: 20,
      computersCount: 20,
      projector: "Mavjud",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingRoom(r);
    setFormData({
      name: r.name,
      capacity: r.capacity,
      computersCount: r.computersCount,
      projector: r.projector,
      status: r.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      const updated = rooms.map((r) =>
        r.id === editingRoom.id ? { ...r, ...formData } : r,
      );
      saveToStorage(updated);
    } else {
      const newRoom = {
        id: `R-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
      };
      saveToStorage([newRoom, ...rooms]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Xonani o'chirmoqchisiz?")) {
      saveToStorage(rooms.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="rooms-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineBuildingOffice2 style={{ verticalAlign: 'middle', marginRight: 6 }} />
            9. Xonalar va Jihozlar Inventari
          </h1>
          <p className="page-subtitle">
            O'quv xonalari, sig'imi va texnik jihozlar boshqaruvi
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Xona Qo'shish
          </button>
        )}
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Xona ID</th>
                <th>Xona Nomi</th>
                <th>Sig'imi (O'quvchi)</th>
                <th>Kompyuterlar Soni</th>
                <th>Proektor / TV</th>
                <th>Holati</th>
                {canManageGroups && <th className="text-center">Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="id-pill">{r.id}</span>
                  </td>
                  <td>
                    <strong className="student-name-text">{r.name}</strong>
                  </td>
                  <td>
                    <strong>{r.capacity} kishi</strong>
                  </td>
                  <td>
                    <span className="text-indigo flex items-center gap-1">
                      <HiOutlineComputerDesktop style={{ verticalAlign: 'middle' }} />
                      {r.computersCount} ta monoblok
                    </span>
                  </td>
                  <td>{r.projector}</td>
                  <td>
                    <span className="status-badge badge-active">Faol</span>
                  </td>
                  {canManageGroups && (
                    <td className="text-center">
                      <div className="action-buttons-flex">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(r)}
                        >
                          <HiOutlinePencilSquare /> Tahrirlash
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r.id)}
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
                {editingRoom ? "Xonani Tahrirlash" : "Yangi Xona Qo'shish"}
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
                <label className="form-label">Xona Nomi</label>
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
                  <label className="form-label">Sig'imi</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kompyuterlar Soni</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.computersCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        computersCount: e.target.value,
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
                  {editingRoom ? "Saqlash" : "Xonani Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
