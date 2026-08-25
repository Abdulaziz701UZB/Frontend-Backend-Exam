import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { roomsApi } from "../../services/api";
import { format9DigitId } from "../../utils/idFormatter";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineMapPin
} from "react-icons/hi2";
import "./Rooms.css";

const STANDARD_TIME_SLOTS = [
  "06:00 - 08:00",
  "08:00 - 10:00",
  "10:00 - 12:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00"
];

const Rooms = () => {
  const { canManageGroups } = useEduAuth();
  const toast = useToast();
  const { id: urlParamId } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedTimetableRoom, setSelectedTimetableRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: "301-xona (Yangi Lab)",
    capacity: 20,
    floor: "2-qavat",
    status: "Active",
  });

  const floorOptions = [
    "1-qavat (Asosiy zal)",
    "2-qavat (Dasturlash laboratoriyasi)",
    "2-qavat (Sharqiy qanot)",
    "3-qavat (Til markazi)",
    "4-qavat (Konferens zal)",
    "Bosh bino (A-blok)",
    "Yangi korpus (B-blok)",
  ];

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

  useEffect(() => {
    if (urlParamId && occupancyData.length > 0) {
      const match = occupancyData.find(
        (o) =>
          String(o.room.id) === String(urlParamId) ||
          format9DigitId(o.room.id, "room") === String(urlParamId)
      );
      if (match) {
        setSelectedTimetableRoom(match);
      }
    }
  }, [urlParamId, occupancyData]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: `Xona ${100 + rooms.length + 1}`,
      capacity: 20,
      floor: "2-qavat",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingRoom(r);
    setFormData({
      name: r.name,
      capacity: r.capacity,
      floor: r.floor || "2-qavat",
      status: r.status,
    });
    setIsModalOpen(true);
  };

  const openTimetable = (item) => {
    setSelectedTimetableRoom(item);
    navigate(`/rooms/${format9DigitId(item.room.id, "room")}`);
  };

  const closeTimetable = () => {
    setSelectedTimetableRoom(null);
    if (urlParamId) {
      navigate("/rooms");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      capacity: parseInt(formData.capacity || 20),
      floor: formData.floor,
      status: formData.status,
    };

    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom.id, payload);
        toast.success(`"${formData.name}" muvaffaqiyatli yangilandi!`);
      } else {
        await roomsApi.create({
          id: `R-${Math.floor(100000000 + Math.random() * 900000000)}`,
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
  const totalFreeSlots = occupancyData.reduce((acc, o) => acc + (o.freeSlotsCount || 0), 0);
  const avgOccupancy = occupancyData.length > 0
    ? Math.round(occupancyData.reduce((acc, o) => acc + (o.occupancyRate || 0), 0) / occupancyData.length)
    : 0;

  return (
    <div className="rooms-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineBuildingOffice2 className="title-icon-indigo" />
            9. Xonalar & Bandlik Matritsasi
          </h1>
          <p className="page-subtitle">
            O'quv xonalari, qavat va bino joylashuvi hamda 06:00 - 22:00 dars jadvali bandligi nazorati
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
            <HiOutlineSparkles />
          </div>
          <div className="room-kpi-content">
            <span>Bo'sh Dars Slotlari</span>
            <strong>{totalFreeSlots} ta slot</strong>
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
              06:00 dan 22:00 gacha bo'lgan barcha 7 ta vaqt oraliqlari va xona joylashuvlari bo'yicha bandlik
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="room-capacity-badge">
                        <HiOutlineUserGroup className="inline-icon-xs" />
                        Sig'im: {r.capacity} kishi
                      </span>
                      <span className="room-capacity-badge text-indigo">
                        <HiOutlineMapPin className="inline-icon-xs" />
                        {r.floor || "2-qavat"}
                      </span>
                    </div>
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

                <div className="room-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openTimetable(item)}
                  >
                    <HiOutlineClock /> Dars Jadvali
                  </button>
                  {canManageGroups && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(r)}
                        title="Tahrirlash"
                      >
                        <HiOutlinePencilSquare />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.id, r.name)}
                        title="O'chirish"
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
                <th>9 Xonali ID</th>
                <th>Xona Nomi</th>
                <th>Qavati / Joylashuvi</th>
                <th>Maksimal Sig'imi</th>
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
                      <span className="id-pill">#{format9DigitId(r.id, "room")}</span>
                    </td>
                    <td>
                      <strong className="student-name-text">{r.name}</strong>
                    </td>
                    <td>
                      <span className="group-tag-pill">
                        <HiOutlineMapPin className="inline-icon-xs" /> {r.floor || "2-qavat"}
                      </span>
                    </td>
                    <td>
                      <strong>{r.capacity} kishi</strong>
                    </td>
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
        <div className="modal-overlay" onClick={closeTimetable}>
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
                  Xona 9 Xonali ID: <strong>#{format9DigitId(selectedTimetableRoom.room.id, "room")}</strong> | Joylashuvi: <strong>{selectedTimetableRoom.room.floor || "2-qavat"}</strong> | Sig'imi: <strong>{selectedTimetableRoom.room.capacity} kishi</strong> ({selectedTimetableRoom.occupancyRate}% Band)
                </p>
              </div>
              <button
                className="close-modal-btn"
                onClick={closeTimetable}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <div className="timetable-grid">
              <div className="timetable-days-block">
                <h5 className="days-block-title">
                  <HiOutlineCalendarDays /> Dushanba - Chorshanba - Juma
                </h5>
                <div className="slots-row-grid">
                  {STANDARD_TIME_SLOTS.map((timeSlot) => {
                    const occ = (selectedTimetableRoom.assignedGroups || []).find(
                      (g) => (g.scheduleDays || "").includes("Dushanba") && (g.scheduleTime || "").trim() === timeSlot
                    ) || (selectedTimetableRoom.scheduleMatrix || []).find(
                      (s) => s.days.includes("Dushanba") && s.time === timeSlot && s.isOccupied
                    );

                    return (
                      <div
                        key={timeSlot}
                        className={`time-slot-card ${occ ? "slot-occupied" : "slot-free"}`}
                      >
                        <span className="slot-time-text">{timeSlot}</span>
                        {occ ? (
                          <>
                            <strong>{occ.name || occ.groupName}</strong>
                            <span>{occ.teacherName}</span>
                          </>
                        ) : (
                          <strong className="text-emerald">
                            <HiOutlineCheckCircle className="inline-icon-xs" /> Bo'sh
                          </strong>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="timetable-days-block">
                <h5 className="days-block-title">
                  <HiOutlineCalendarDays /> Seshanba - Payshanba - Shanba
                </h5>
                <div className="slots-row-grid">
                  {STANDARD_TIME_SLOTS.map((timeSlot) => {
                    const occ = (selectedTimetableRoom.assignedGroups || []).find(
                      (g) => (g.scheduleDays || "").includes("Seshanba") && (g.scheduleTime || "").trim() === timeSlot
                    ) || (selectedTimetableRoom.scheduleMatrix || []).find(
                      (s) => s.days.includes("Seshanba") && s.time === timeSlot && s.isOccupied
                    );

                    return (
                      <div
                        key={timeSlot}
                        className={`time-slot-card ${occ ? "slot-occupied" : "slot-free"}`}
                      >
                        <span className="slot-time-text">{timeSlot}</span>
                        {occ ? (
                          <>
                            <strong>{occ.name || occ.groupName}</strong>
                            <span>{occ.teacherName}</span>
                          </>
                        ) : (
                          <strong className="text-emerald">
                            <HiOutlineCheckCircle className="inline-icon-xs" /> Bo'sh
                          </strong>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeTimetable}
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
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Xona Nomi:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Xona nomini kiriting"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Qavati / Joylashuvi:</label>
                  <select
                    className="form-select"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                  >
                    {floorOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Maksimal Sig'im (o'quvchi):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Holati:</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Faol (Ishlamoqda)</option>
                  <option value="Maintenance">Ta'mirda</option>
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? "Saqlash" : "Yaratish"}
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
