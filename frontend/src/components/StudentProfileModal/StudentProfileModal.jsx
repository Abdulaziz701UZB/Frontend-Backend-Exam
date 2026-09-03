import { useState } from "react";
import { format9DigitId } from "../../utils/idFormatter";
import { useToast } from "../../context/ToastContext";
import "./StudentProfileModal.css";
import {
  HiXMark,
  HiOutlineCreditCard,
  HiOutlineCalendarDays,
  HiOutlineTrophy,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowsRightLeft,
  HiOutlinePhone,
  HiOutlineArrowDownTray,
  HiOutlinePaperAirplane,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { FaUserGraduate, FaTelegram } from "react-icons/fa6";

const StudentProfileModal = ({ student, onClose }) => {
  const toast = useToast();
  const [dossierActiveTab, setDossierActiveTab] = useState("parents");

  if (!student) return null;

  const formatMoney = (val) => {
    return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
  };

  const getDossierData = (s) => {
    const isBotConnected = Boolean(s.telegramUsername || s.id % 2 === 0);
    const totalLTV = 3400000;

    const mockAttendance = [
      { date: "24.08", status: "present" },
      { date: "22.08", status: "present" },
      { date: "19.08", status: "late" },
      { date: "17.08", status: "present" },
      { date: "15.08", status: "present" },
      { date: "12.08", status: "absent" },
      { date: "10.08", status: "present" },
      { date: "08.08", status: "present" },
      { date: "05.08", status: "present" },
      { date: "03.08", status: "present" },
      { date: "01.08", status: "present" },
      { date: "29.07", status: "absent" },
      { date: "26.07", status: "present" },
      { date: "24.07", status: "present" },
      { date: "22.07", status: "present" },
      { date: "19.07", status: "present" },
    ];

    const mockExams = [
      { title: "HTML & CSS Semantika Nazorati", score: 94, maxScore: 100, grade: "A'lo" },
      { title: "JavaScript ES6 & Async/Await", score: 88, maxScore: 100, grade: "Yaxshi" },
      { title: "React Component & Hooks Imtihoni", score: 92, maxScore: 100, grade: "A'lo" },
    ];

    return {
      isBotConnected,
      totalLTV,
      mockAttendance,
      mockExams,
    };
  };

  const dossierData = getDossierData(student);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content card student-dossier-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="dossier-modal-header">
          <div className="dossier-header-left">
            <div className="dossier-header-icon-box">
              <FaUserGraduate />
            </div>
            <div>
              <h2 className="dossier-modal-title">
                {student.fullName} — O'quvchi Profili
              </h2>
              <p className="dossier-modal-sub">
                O'quvchi ID: <strong>#{format9DigitId(student.id, "student")}</strong> | Guruhi: <strong>{student.groupName || "Faol Guruh"}</strong>
              </p>
            </div>
          </div>
          <button
            className="dossier-close-btn"
            onClick={onClose}
            aria-label="Yopish"
            title="Yopish"
          >
            <HiXMark />
          </button>
        </div>

        {/* Hero Card */}
        <div className="dossier-hero-header">
          <div className="dossier-user-info">
            <div className="dossier-avatar">
              <FaUserGraduate />
            </div>
            <div>
              <h3 className="dossier-name">{student.fullName}</h3>
              <div className="dossier-meta-badges">
                <span className="user-phone-chip">
                  <HiOutlinePhone className="inline-icon-xs" /> {student.phone || "+998 90 000 00 00"}
                </span>
                <span className={`bot-sync-pill ${dossierData.isBotConnected ? "" : "is-offline"}`}>
                  <FaTelegram /> {dossierData.isBotConnected ? "Telegram Bot: Ulangan" : "Bot: Ulanmagan"}
                </span>
                <span className="group-badge-chip">
                  <HiOutlineUserGroup className="inline-icon-xs" /> {student.groupName || "Guruh"}
                </span>
              </div>
            </div>
          </div>

          <div className="ltv-metric-badge">
            <span className="ltv-label">Umumiy Qiymati (LTV)</span>
            <span className="ltv-value">{formatMoney(dossierData.totalLTV)}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dossier-tabs-bar">
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "parents" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("parents")}
          >
            <HiOutlineChatBubbleLeftRight /> Ota-ona & Aloqa
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "payments" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("payments")}
          >
            <HiOutlineCreditCard /> To'lov Tarixi & Cheklar
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "attendance" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("attendance")}
          >
            <HiOutlineCalendarDays /> Davomat Dinamikasi
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "grades" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("grades")}
          >
            <HiOutlineTrophy /> Baholar & Imtihonlar
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "transfers" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("transfers")}
          >
            <HiOutlineArrowsRightLeft /> Guruhlar Tarixi
          </button>
        </div>

        <div className="dossier-tab-content">
          {dossierActiveTab === "payments" && (
            <div className="dossier-tab-panel">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Kvitansiya 9 Xonali ID</th>
                      <th>To'lov Sanasi</th>
                      <th>To'lov Usuli</th>
                      <th>Summa</th>
                      <th>Holati</th>
                      <th>Chek</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="id-pill">#800109812</span></td>
                      <td>15.08.2026</td>
                      <td><span className="group-tag-pill">Click</span></td>
                      <td><strong>{formatMoney(850000)}</strong></td>
                      <td><span className="status-pill pill-paid">Muvaffaqiyatli</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => toast.success("Kvitansiya cheki yuklab olindi!")}
                        >
                          <HiOutlineArrowDownTray /> Chek PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td><span className="id-pill">#800108421</span></td>
                      <td>15.07.2026</td>
                      <td><span className="group-tag-pill">Payme</span></td>
                      <td><strong>{formatMoney(850000)}</strong></td>
                      <td><span className="status-pill pill-paid">Muvaffaqiyatli</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => toast.success("Kvitansiya cheki yuklab olindi!")}
                        >
                          <HiOutlineArrowDownTray /> Chek PDF
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dossierActiveTab === "attendance" && (
            <div className="dossier-tab-panel">
              <div className="attendance-summary-cards">
                <div className="attendance-stat-box">
                  <span className="kpi-label">O'rtacha Davomat</span>
                  <strong className="kpi-value text-emerald">88%</strong>
                </div>
                <div className="attendance-stat-box">
                  <span className="kpi-label">Kelgan Darslari</span>
                  <strong className="kpi-value">14 ta dars</strong>
                </div>
                <div className="attendance-stat-box">
                  <span className="kpi-label">Qoldirgan Darslari</span>
                  <strong className="kpi-value text-danger">2 ta dars</strong>
                </div>
              </div>

              <h5 className="section-title text-sm mb-2">So'nggi darslar jurnali:</h5>
              <div className="attendance-dots-grid">
                {dossierData.mockAttendance.map((a, idx) => (
                  <div
                    key={idx}
                    className={`attendance-dot-item ${
                      a.status === "present"
                        ? "dot-present"
                        : a.status === "late"
                          ? "dot-late"
                          : "dot-absent"
                    }`}
                  >
                    <div>{a.date}</div>
                    <small>{a.status === "present" ? "Keldi" : a.status === "late" ? "Kechikdi" : "Kelmadi"}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dossierActiveTab === "grades" && (
            <div className="dossier-tab-panel">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Imtihon / Nazorat Ishi</th>
                      <th>To'plagan Bali</th>
                      <th>Maksimal Ball</th>
                      <th>Baho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossierData.mockExams.map((ex, idx) => (
                      <tr key={idx}>
                        <td><strong>{ex.title}</strong></td>
                        <td><strong className="text-emerald">{ex.score} ball</strong></td>
                        <td>{ex.maxScore} ball</td>
                        <td><span className="group-tag-pill">{ex.grade}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dossierActiveTab === "parents" && (
            <div className="dossier-tab-panel">
              <div className="contact-card-grid">
                <div className="contact-info-card">
                  <span className="contact-card-title">O'quvchining O'zi:</span>
                  <strong className="contact-person-name">{student.fullName}</strong>
                  <a href={`tel:${student.phone}`} className="contact-phone-btn">
                    <HiOutlinePhone /> {student.phone || "Telefon kiritilmagan"}
                  </a>
                </div>

                <div className="contact-info-card">
                  <span className="contact-card-title">Ota-onasi / Vasiysi:</span>
                  <strong className="contact-person-name">{student.fullName} ning Ota-onasi</strong>
                  <a href={`tel:${student.parentPhone || student.phone}`} className="contact-phone-btn">
                    <HiOutlinePhone /> {student.parentPhone || student.phone || "Telefon kiritilmagan"}
                  </a>
                  <div className="mt-2">
                    <a
                      href={`https://t.me/${String(student.parentPhone || student.phone || "").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-telegram-direct"
                    >
                      <FaTelegram /> Telegramdan Bog'lanish
                    </a>
                  </div>
                </div>
              </div>

              <div className="telegram-integration-card">
                <div className="telegram-card-top">
                  <span className="telegram-card-title">
                    <FaTelegram style={{ color: "#0284c7" }} />
                    Telegram Bot Integratsiyasi & Bildirishnomalar
                  </span>
                  <span className={`bot-sync-pill ${dossierData.isBotConnected ? "" : "is-offline"}`}>
                    {dossierData.isBotConnected ? "Faol Ulangan" : "Ulanmagan"}
                  </span>
                </div>
                <p className="telegram-desc-text">
                  Davomat, baholar va to'lov kvitansiyalari avtomatik ravishda o'quvchi va ota-onaning Telegram botiga yuboriladi.
                </p>
                <button
                  type="button"
                  className="btn-send-bot-invite"
                  onClick={() => toast.success(`"${student.fullName}" telefoniga botga ulanish havolasi yuborildi!`)}
                >
                  <HiOutlinePaperAirplane /> Botga Ulanish Havolasini Yuborish
                </button>
              </div>
            </div>
          )}

          {dossierActiveTab === "transfers" && (
            <div className="dossier-tab-panel">
              <div className="transfer-info-banner">
                <div><strong>Hozirgi Guruhi:</strong> {student.groupName || "Guruh"}</div>
                <div><strong>Guruhga Biriktirilgan Sana:</strong> 01.06.2026</div>
                <div><strong>Guruh O'zgartirish Tarixi:</strong> 1 marta (Dars vaqti mos kelmaganligi sababli kechki guruhga o'tkazilgan)</div>
              </div>
            </div>
          )}
        </div>

        <div className="dossier-modal-footer">
          <button
            type="button"
            className="btn-dossier-close"
            onClick={onClose}
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
