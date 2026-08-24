import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { reviewsApi, teachersApi, groupsApi, studentsApi } from "../../services/api";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineStar,
  HiStar,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineHandThumbUp,
  HiOutlineFaceSmile,
  HiOutlineFaceFrown,
  HiOutlineCheckCircle,
  HiOutlineSparkles
} from "react-icons/hi2";
import "./Reviews.css";

const CATEGORIES = [
  "O'qitish sifati",
  "Dars qiziqarliligi",
  "Xona sharoiti & Jihozlar",
  "Ma'muriyat xizmati",
  "Umumiy taassurot",
];

const STATUSES = ["Yangi", "Ko'rib chiqildi", "Shikoyat", "Hal qilindi"];

const Reviews = () => {
  const { isAdmin, canManageStudents } = useEduAuth();

  const [reviews, setReviews] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentReviewId, setCurrentReviewId] = useState(null);

  const [formData, setFormData] = useState({
    studentName: "",
    teacherName: "",
    groupName: "",
    rating: 10,
    category: "O'qitish sifati",
    comment: "",
    status: "Yangi",
    date: new Date().toISOString().split("T")[0],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, tData, gData, sData] = await Promise.all([
        reviewsApi.getAll(),
        teachersApi.getAll(),
        groupsApi.getAll(),
        studentsApi.getAll(),
      ]);
      setReviews(rData);
      setTeachers(tData);
      setGroups(gData);
      setStudents(sData);
    } catch (err) {
      console.error("Reviews load error:", err.message);
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
      studentName: students[0]?.fullName || "Abdulaziz Abdulhayev",
      teacherName: teachers[0]?.name || "Abdulaziz Abdulhayev",
      groupName: groups[0]?.name || "F-12 Guruh",
      rating: 10,
      category: "O'qitish sifati",
      comment: "",
      status: "Yangi",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rev) => {
    setModalMode("edit");
    setCurrentReviewId(rev.id);
    setFormData({
      studentName: rev.studentName,
      teacherName: rev.teacherName,
      groupName: rev.groupName || "",
      rating: rev.rating,
      category: rev.category || "O'qitish sifati",
      comment: rev.comment,
      status: rev.status || "Yangi",
      date: rev.date || new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student_name: formData.studentName,
        teacher_name: formData.teacherName,
        group_name: formData.groupName,
        rating: parseInt(formData.rating),
        category: formData.category,
        comment: formData.comment,
        status: formData.status,
        date: formData.date,
      };

      if (modalMode === "create") {
        await reviewsApi.create(payload);
      } else {
        await reviewsApi.update(currentReviewId, payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Rostdan ham ushbu fikr-mulohazani o'chirmoqchimisiz?")) return;
    try {
      await reviewsApi.delete(id);
      loadData();
    } catch (err) {
      alert("O'chirishda xatolik: " + err.message);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.groupName && r.groupName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || r.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" || r.status === filterStatus;

    const matchesRating =
      filterRating === "all"
        ? true
        : filterRating === "high"
          ? r.rating >= 9
          : filterRating === "mid"
            ? r.rating >= 7 && r.rating <= 8
            : r.rating <= 6;

    return matchesSearch && matchesCategory && matchesStatus && matchesRating;
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const promoters = reviews.filter((r) => r.rating >= 9).length;
  const passives = reviews.filter((r) => r.rating >= 7 && r.rating <= 8).length;
  const detractors = reviews.filter((r) => r.rating <= 6).length;

  const npsScore = totalReviews
    ? Math.round(((promoters - detractors) / totalReviews) * 100)
    : 0;

  return (
    <div className="reviews-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineChatBubbleLeftRight className="title-icon-indigo" />
            11. Mijozlar Fikr-Mulohazalari va NPS
          </h1>
          <p className="page-subtitle">
            O'quvchilar va ota-onalarning ta'lim sifati, o'qituvchilar va sharoitlar bo'yicha 1 dan 10 gacha qo'ygan baholari monitoringi
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <HiOutlinePlus /> Yangi Fikr Qo'shish
        </button>
      </div>

      <div className="nps-stats-grid">
        <div className="nps-stat-card">
          <div className="nps-icon-wrap nps-icon-blue">
            <HiStar />
          </div>
          <div className="nps-stat-content">
            <span>O'rtacha Ball (1-10)</span>
            <strong>{avgRating} / 10</strong>
          </div>
        </div>

        <div className="nps-stat-card">
          <div className="nps-icon-wrap nps-icon-green">
            <HiOutlineFaceSmile />
          </div>
          <div className="nps-stat-content">
            <span>Tavsiya Qiluvchilar (9-10)</span>
            <strong>{promoters} ta ({totalReviews ? Math.round((promoters / totalReviews) * 100) : 0}%)</strong>
          </div>
        </div>

        <div className="nps-stat-card">
          <div className="nps-icon-wrap nps-icon-yellow">
            <HiOutlineSparkles />
          </div>
          <div className="nps-stat-content">
            <span>Neytrallar (7-8)</span>
            <strong>{passives} ta</strong>
          </div>
        </div>

        <div className="nps-stat-card">
          <div className="nps-icon-wrap nps-icon-red">
            <HiOutlineFaceFrown />
          </div>
          <div className="nps-stat-content">
            <span>NPS Indeksi</span>
            <strong>{npsScore > 0 ? `+${npsScore}%` : `${npsScore}%`}</strong>
          </div>
        </div>
      </div>

      <div className="card filter-card">
        <div className="grid-form-4">
          <div className="form-group mb-0">
            <label className="form-label">Qidiruv:</label>
            <div className="search-input-wrap">
              <input
                type="text"
                className="form-input"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Kategoriya:</label>
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Barcha Kategoriyalar</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Baho Darajasi:</label>
            <select
              className="form-select"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">Barcha Baholar (1-10)</option>
              <option value="high">A'lo (9 - 10 ball)</option>
              <option value="mid">Yaxshi (7 - 8 ball)</option>
              <option value="low">Past / Tanqid (1 - 6 ball)</option>
            </select>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Statusi:</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Barcha Statuslar</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
                <th>O'quvchi</th>
                <th>O'qituvchi / Guruh</th>
                <th className="text-center">Baho (1-10)</th>
                <th>Kategoriya</th>
                <th>Fikr / Taklif</th>
                <th>Sana</th>
                <th>Status</th>
                <th className="text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-muted">
                    Fikr-mulohazalar topilmadi
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev, idx) => {
                  const isHigh = rev.rating >= 9;
                  const isMid = rev.rating >= 7 && rev.rating <= 8;

                  return (
                    <tr key={rev.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{rev.studentName}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{rev.teacherName}</strong>
                          {rev.groupName && (
                            <div className="text-muted text-xs">{rev.groupName}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span
                          className={`rating-score-pill ${
                            isHigh ? "score-high" : isMid ? "score-mid" : "score-low"
                          }`}
                        >
                          <HiStar /> {rev.rating} / 10
                        </span>
                      </td>
                      <td>
                        <span className="category-tag">{rev.category}</span>
                      </td>
                      <td>
                        <div className="comment-bubble">{rev.comment}</div>
                      </td>
                      <td className="text-muted text-sm">{rev.date}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            rev.status === "Hal qilindi" || rev.status === "Ko'rib chiqildi"
                              ? "pill-paid"
                              : "pill-overdue"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="action-buttons-flex">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(rev)}
                            title="Tahrirlash / Statusni o'zgartirish"
                          >
                            <HiOutlinePencilSquare />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteReview(rev.id)}
                            title="O'chirish"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                <HiOutlineChatBubbleLeftRight className="title-icon-indigo" />
                {modalMode === "create" ? "Yangi Fikr-Mulohaza Qo'shish" : "Fikrni Tahrirlash"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <HiOutlineXMark />
              </button>
            </div>

            <form onSubmit={handleSaveReview}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">O'quvchi F.I.SH:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">O'qituvchi:</label>
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
                  <label className="form-label">Guruh:</label>
                  <select
                    className="form-select"
                    value={formData.groupName}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                  >
                    <option value="">Guruh biriktirilmagan</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.courseName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Kategoriya:</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Baho Qo'ying (1 dan 10 gacha): <strong>{formData.rating} ball</strong>
                </label>
                <div className="rating-bar-selector">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      className={`score-btn score-${score} ${
                        formData.rating === score ? "selected" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, rating: score })}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fikr, Taklif yoki Shikoyat matni:</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder=""
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Status:</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sana:</label>
                  <input
                    type="date"
                    className="form-input"
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

export default Reviews;
