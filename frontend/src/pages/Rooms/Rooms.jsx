import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { roomsApi } from "../../services/api";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineComputerDesktop,
  HiOutlineTv,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCheckCircle
} from "react-icons/hi2";
import "./Rooms.css";

const Rooms = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();

  const [rooms, setRooms] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedTimetableRoom, setSelectedTimetableRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: "301-xona (Yangi Lab)",
    capacity: 20,
    computersCount: 20,
    projector: "Mavjud",
    status: "Active",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, occupancyRes] = await Promise.all([
        roomsApi.getAll(),
        roomsApi.getOccupancy(),
      ]);
      setRooms(roomsRes);
      setOccupancyData(occupancyRes);
    } catch (err) {
      console.error("Rooms load error:", err.message);
      toast.error("Xonalar ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: `Xona ${100 + rooms.length + 1} (Yangi Sinf)`,
      capacity: 18,
      computersCount: 15,
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      capacity: parseInt(formData.capacity || 20),
      computers_count: parseInt(formData.computersCount || 0),
      projector: formData.projector,
      status: formData.status,
    };

    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom.id, payload);
        toast.success(`"${formData.name}" muvaffaqiyatli yangilandi!`);
      } else {
        await roomsApi.create({
          id: `R-${Math.floor(100 + Math.random() * 900)}`,
          ...payload,
        });
        toast.success(`"${formData.name}" muvaffaqiyatli yaratildi!`);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Haqiqatan ham "${name}" xonasini o'chirmoqchimisiz?`)) {
      try {
        await roomsApi.delete(id);
        toast.success(`"${name}" muvaffaqiyatli o'chirildi!`);
        await loadData();
      } catch (err) {
        toast.error("O'chirishda xatolik: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const totalComputers = rooms.reduce((acc, r) => acc + (r.computersCount || 0), 0);
  const avgOccupancy = occupancyData.length > 0
    ? Math.round(occupancyData.reduce((acc, o) => acc + (o.occupancyRate || 0), 0) / occupancyData.length)
    : 0;
  const totalFreeSlots = occupancyData.reduce((acc, o) => acc + (o.freeSlotsCount || 0), 0);

  return (
    <div className="rooms-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineBuildingOffice2 className="title-icon-indigo" />
            9. Xonalar & Bandlik Matritsasi
          </h1>
          <p className="page-subtitle">
            O'quv xonalari, texnik jihozlar va haftalik dars jadvali to'qnashuvlari nazorati
          </p>
        </div>
        {canManageGroups && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi Xona Qo'shish
          </button>
        )}
      </div>

      <div className="rooms-kpi-grid">
        <div className="room-kpi-card">
          <div className="room-kpi-icon kpi-blue">
            <HiOutlineBuildingOffice2 />
          </div>
          <div className="room-kpi-content">
            <span>Jami Xonalar</span>
            <strong>{rooms.length} ta xona</strong>
          </div>
        </div>

        <div className="room-kpi-card">
          <div className="room-kpi-icon kpi-green">
            <HiOutlineUserGroup />
          </div>
          <div className="room-kpi-content">
            <span>Umumiy Sig'im</span>
            <strong>{totalCapacity} o'rin</strong>
          </div>
        </div>

        <div className="room-kpi-card">
          <div className="room-kpi-icon kpi-amber">
            <HiOutlineChartBar />
          </div>
          <div className="room-kpi-content">
            <span>O'rtacha Bandlik</span>
            <strong>{avgOccupancy}%</strong>
          </div>
        </div>

        <div className="room-kpi-card">
          <div className="room-kpi-icon kpi-purple">
            <HiOutlineComputerDesktop />
          </div>
          <div className="room-kpi-content">
            <span>Kompyuterlar</span>
            <strong>{totalComputers} ta PC</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header-flex mb-4">
          <div>
            <h3 className="section-title mb-1">
              <HiOutlineCalendarDays className="title-icon-indigo" />
              Xonalar Haftalik Dars Jadvali & Bandlik Holati
            </h3>
            <p className="text-muted text-sm m-0">
              Har bir xonaning guruhlar bilan band qilingan soatlari va bo'sh vaqtlari
            </p>
          </div>
        </div>

        <div className="rooms-matrix-grid">
          {occupancyData.map((item) => {
            const r = item.room;
            const rateClass = item.occupancyRate > 75 ? "rate-high" : item.occupancyRate > 40 ? "rate-mid" : "rate-low";
            const fillClass = item.occupancyRate > 75 ? "fill-high" : item.occupancyRate > 40 ? "fill-mid" : "fill-low";

            return (
              <div key={r.id} className="room-matrix-card">
                <div className="room-card-header">
                  <div className="room-title-wrap">
                    <h4 className="room-card-title">{r.name}</h4>
                    <span className="room-capacity-badge">
                      <HiOutlineUserGroup className="inline-icon-xs" />
                      Maksimal sig'im: {r.capacity} o'quvchi
                    </span>
                  </div>
                  <span className={`occupancy-rate-pill ${rateClass}`}>
                    {item.occupancyRate}% Band
                  </span>
                </div>

                <div className="room-progress-wrap">
                  <div className="room-progress-header">
                    <span>Haftalik bandlik: {item.activeGroupsCount} ta guruh</span>
                    <span>{item.freeSlotsCount} ta bo'sh slot</span>
                  </div>
                  <div className="room-progress-bar">
                    <div
                      className={`room-progress-fill ${fillClass}`}
                      style={{ width: `${item.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="room-features-row">
                  <div className="room-feature-item">
                    <HiOutlineComputerDesktop />
                    <span>{r.computersCount} PC</span>
                  </div>
                  <div className="room-feature-item">
                    <HiOutlineTv />
                    <span>{r.projector}</span>
                  </div>
                </div>

                <div className="room-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedTimetableRoom(item)}
                  >
                    <HiOutlineClock /> Dars Jadvali
                  </button>
                  {canManageGroups && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(r)}
                      >
                        <HiOutlinePencilSquare />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.id, r.name)}
                      >
                        <HiOutlineTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Xona ID</th>
                <th>Xona Nomi</th>
                <th>Sig'imi</th>
                <th>Kompyuterlar</th>
                <th>Proektor</th>
                <th>Faol Guruhlar</th>
                <th>Holati</th>
                {canManageGroups && <th className="text-center">Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => {
                const occ = occupancyData.find((o) => o.room.id === r.id);
                return (
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
                      <span className="text-indigo">
                        <HiOutlineComputerDesktop className="inline-icon-xs" />
                        {r.computersCount} ta
                      </span>
                    </td>
                    <td>{r.projector}</td>
                    <td>
                      <span className="group-tag-pill">
                        {occ?.activeGroupsCount || 0} ta guruh
                      </span>
                    </td>
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
                            <HiOutlinePencilSquare />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(r.id, r.name)}
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTimetableRoom && (
        <div className="modal-overlay" onClick={() => setSelectedTimetableRoom(null)}>
          <div
            className="modal-content card timetable-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  <HiOutlineCalendarDays className="title-icon-indigo" />
                  {selectedTimetableRoom.room.name} — Haftalik Dars Jadvali
                </h2>
                <p className="text-muted text-sm m-0 mt-1">
                  Sig'imi: {selectedTimetableRoom.room.capacity} kishi | {selectedTimetableRoom.occupancyRate}% Band
                </p>
              </div>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedTimetableRoom(null)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <div className="timetable-grid">
              <div className="timetable-days-block">
                <h5 className="days-block-title">
                  <HiOutlineCalendarDays /> Dushanba - Chorshanba - Juma (Toq kunlar)
                </h5>
                <div className="slots-row-grid">
                  {selectedTimetableRoom.scheduleMatrix
                    .filter((s) => s.days.includes("Dushanba"))
                    .map((s, idx) => (
                      <div
                        key={idx}
                        className={`time-slot-card ${s.isOccupied ? "slot-occupied" : "slot-free"}`}
                      >
                        <span className="slot-time-text">{s.time}</span>
                        {s.isOccupied ? (
                          <>
                            <strong>{s.groupName}</strong>
                            <span>{s.teacherName}</span>
                          </>
                        ) : (
                          <strong className="text-emerald">
                            <HiOutlineCheckCircle className="inline-icon-xs" /> Bo'sh
                          </strong>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="timetable-days-block">
                <h5 className="days-block-title">
                  <HiOutlineCalendarDays /> Seshanba - Payshanba - Shanba (Juft kunlar)
                </h5>
                <div className="slots-row-grid">
                  {selectedTimetableRoom.scheduleMatrix
                    .filter((s) => s.days.includes("Seshanba"))
                    .map((s, idx) => (
                      <div
                        key={idx}
                        className={`time-slot-card ${s.isOccupied ? "slot-occupied" : "slot-free"}`}
                      >
                        <span className="slot-time-text">{s.time}</span>
                        {s.isOccupied ? (
                          <>
                            <strong>{s.groupName}</strong>
                            <span>{s.teacherName}</span>
                          </>
                        ) : (
                          <strong className="text-emerald">
                            <HiOutlineCheckCircle className="inline-icon-xs" /> Bo'sh
                          </strong>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedTimetableRoom(null)}
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
                  placeholder="masalan: 201-xona (Kompyuter zali)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Maksimal Sig'imi (o'quvchi)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="5"
                    max="100"
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
                    min="0"
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
              <div className="form-group">
                <label className="form-label">Proektor / Ekran Holati</label>
                <select
                  className="form-select"
                  value={formData.projector}
                  onChange={(e) =>
                    setFormData({ ...formData, projector: e.target.value })
                  }
                >
                  <option value="Mavjud">Mavjud (Interaktiv doska / TV)</option>
                  <option value="Mavjud emas">Mavjud emas</option>
                </select>
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
